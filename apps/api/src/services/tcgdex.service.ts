import type { FastifyBaseLogger } from "fastify";
import { API_ERROR_CODES, type CardSearchSortField } from "@rebind/shared";
import { appError } from "../lib/errors.js";
import {
  buildSearchResponse,
  expandSearchCardsWithVariants,
  extractSetId,
  normalizeCardDetail,
  normalizeSearchCard,
  normalizeSetBrief,
  sortSearchResultsByPrice,
  type NormalizedCardDetail,
  type NormalizedSearchResponse,
  type NormalizedSetBrief,
  type SearchCardEnrichment,
  type TcgdexCardDetail,
  type TcgdexSearchCard,
  type TcgdexSetBrief,
} from "../lib/tcgdex.types.js";
import {
  getTcgPocketSetIds,
  isTcgPocketSet,
  pocketSetExclusionFilters,
  TCG_POCKET_SERIES_ID,
} from "../lib/tcgdex-pocket.js";
import {
  cacheGet,
  cacheSet,
  cardCacheKey,
  getCardCacheTtl,
  getSearchCacheTtl,
  getSetsCacheTtl,
  searchCacheKey,
  setsCacheKey,
} from "./cache.service.js";

const TCGDEX_TIMEOUT_MS = 10_000;

const SORT_FIELD_MAP: Record<Exclude<CardSearchSortField, "price">, string> = {
  releaseDate: "releaseDate",
  name: "name",
  rarity: "rarity",
};

export type SearchCardsInput = {
  q?: string;
  set?: string;
  rarity?: string;
  sort?: CardSearchSortField;
  order?: "asc" | "desc";
  page: number;
  limit: number;
};

function tcgdexBaseUrl(): string {
  return process.env.TCGDEX_BASE_URL ?? "https://api.tcgdex.net/v2";
}

function tcgdexLang(): string {
  return process.env.TCGDEX_LANG ?? "en";
}

function buildTcgdexUrl(path: string, query?: Record<string, string | string[]>): string {
  const url = new URL(`${tcgdexBaseUrl()}/${tcgdexLang()}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          url.searchParams.append(key, entry);
        }
      } else {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

async function fetchTcgdex(
  path: string,
  query: Record<string, string | string[]> | undefined,
  logger: FastifyBaseLogger
): Promise<Response> {
  const url = buildTcgdexUrl(path, query);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TCGDEX_TIMEOUT_MS);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    logger.error({ err, event: "tcgdex.error", url }, "tcgdex request failed");
    throw appError(502, API_ERROR_CODES.TCGDEX_UNAVAILABLE, "Card catalog temporarily unavailable");
  } finally {
    clearTimeout(timeout);
  }
}

function buildTcgdexSearchQuery(
  input: SearchCardsInput,
  pocketSetIds: Set<string>
): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {
    "pagination:page": String(input.page),
    "pagination:itemsPerPage": String(input.limit),
  };

  if (input.q) {
    query.name = input.q;
  }

  if (input.set) {
    query["set.id"] = input.set;
  } else if (pocketSetIds.size > 0) {
    query["set.id"] = pocketSetExclusionFilters(pocketSetIds);
  }

  if (input.rarity) {
    query.rarity = input.rarity;
  }

  const sortField = input.sort ?? "releaseDate";
  const tcgSortField = sortField === "price" ? "releaseDate" : SORT_FIELD_MAP[sortField];
  query["sort:field"] = tcgSortField;
  query["sort:order"] = input.order === "desc" ? "DESC" : "ASC";

  return query;
}

async function resolveSearchCardEnrichment(
  externalId: string,
  logger: FastifyBaseLogger
): Promise<SearchCardEnrichment> {
  const cached = await cacheGet<NormalizedCardDetail>(cardCacheKey(externalId));
  if (cached) {
    return {
      variants: cached.variants,
      setName: cached.setName,
      pricing: cached.pricing,
    };
  }

  const response = await fetchTcgdex(`/cards/${encodeURIComponent(externalId)}`, undefined, logger);

  if (!response.ok) {
    logger.warn(
      { event: "tcgdex.enrichment_failed", externalId, status: response.status },
      "failed to enrich search card; defaulting to normal variant"
    );
    return {
      variants: ["normal"],
      setName: null,
      pricing: null,
    };
  }

  const raw = (await response.json()) as TcgdexCardDetail;
  const detail = normalizeCardDetail(raw);
  await cacheSet(cardCacheKey(externalId), detail, getCardCacheTtl());

  return {
    variants: detail.variants,
    setName: detail.setName,
    pricing: detail.pricing,
  };
}

async function resolveSearchCardEnrichments(
  externalIds: string[],
  logger: FastifyBaseLogger
): Promise<Map<string, SearchCardEnrichment>> {
  const uniqueIds = [...new Set(externalIds)];
  const entries = await Promise.all(
    uniqueIds.map(
      async (externalId) =>
        [externalId, await resolveSearchCardEnrichment(externalId, logger)] as const
    )
  );

  return new Map(entries);
}

export async function searchCards(
  input: SearchCardsInput,
  logger: FastifyBaseLogger
): Promise<NormalizedSearchResponse> {
  const cacheKey = searchCacheKey(input);
  const cached = await cacheGet<NormalizedSearchResponse>(cacheKey);

  if (cached) {
    logger.info({ event: "tcgdex.cache_hit", cacheKey, type: "search" }, "tcgdex cache hit");
    return cached;
  }

  const pocketSetIds = await getTcgPocketSetIds(
    (path) => fetchTcgdex(path, undefined, logger),
    logger
  );

  if (input.set && isTcgPocketSet(input.set, pocketSetIds)) {
    return buildSearchResponse([], input.page, input.limit);
  }

  const response = await fetchTcgdex("/cards", buildTcgdexSearchQuery(input, pocketSetIds), logger);

  if (response.status === 404) {
    return buildSearchResponse([], input.page, input.limit);
  }

  if (response.status === 429) {
    logger.warn({ event: "tcgdex.error", status: 429 }, "tcgdex rate limited");
    throw appError(429, API_ERROR_CODES.RATE_LIMITED, "Too many card search requests. Try again shortly.");
  }

  if (!response.ok) {
    logger.error(
      { event: "tcgdex.error", status: response.status, path: "/cards" },
      "tcgdex search failed"
    );
    throw appError(502, API_ERROR_CODES.TCGDEX_UNAVAILABLE, "Card catalog temporarily unavailable");
  }

  const raw = (await response.json()) as TcgdexSearchCard[];
  const normalized = raw.map(normalizeSearchCard);
  const enrichmentByCardId = await resolveSearchCardEnrichments(
    normalized.map((card) => card.externalId),
    logger
  );
  let expanded = expandSearchCardsWithVariants(normalized, enrichmentByCardId);

  if (input.sort === "price") {
    expanded = sortSearchResultsByPrice(expanded, input.order ?? "asc");
  }

  const result = buildSearchResponse(expanded, input.page, input.limit, raw.length === input.limit);

  await cacheSet(cacheKey, result, getSearchCacheTtl());

  return result;
}

export async function listSets(logger: FastifyBaseLogger): Promise<NormalizedSetBrief[]> {
  const cacheKey = setsCacheKey();
  const cached = await cacheGet<NormalizedSetBrief[]>(cacheKey);

  if (cached) {
    logger.info({ event: "tcgdex.cache_hit", cacheKey, type: "sets" }, "tcgdex cache hit");
    return cached;
  }

  const response = await fetchTcgdex(
    "/sets",
    {
      "serie.id": `neq:${TCG_POCKET_SERIES_ID}`,
      "sort:field": "name",
      "sort:order": "ASC",
    },
    logger
  );

  if (response.status === 429) {
    logger.warn({ event: "tcgdex.error", status: 429 }, "tcgdex rate limited");
    throw appError(429, API_ERROR_CODES.RATE_LIMITED, "Too many card search requests. Try again shortly.");
  }

  if (!response.ok) {
    logger.error(
      { event: "tcgdex.error", status: response.status, path: "/sets" },
      "tcgdex sets list failed"
    );
    throw appError(502, API_ERROR_CODES.TCGDEX_UNAVAILABLE, "Card catalog temporarily unavailable");
  }

  const raw = (await response.json()) as TcgdexSetBrief[];
  const result = raw.map(normalizeSetBrief);

  await cacheSet(cacheKey, result, getSetsCacheTtl());

  return result;
}

export async function getCardDetail(
  externalId: string,
  logger: FastifyBaseLogger
): Promise<NormalizedCardDetail> {
  const cacheKey = cardCacheKey(externalId);
  const cached = await cacheGet<NormalizedCardDetail>(cacheKey);

  if (cached) {
    logger.info({ event: "tcgdex.cache_hit", cacheKey, type: "card" }, "tcgdex cache hit");
    return cached;
  }

  const pocketSetIds = await getTcgPocketSetIds(
    (path) => fetchTcgdex(path, undefined, logger),
    logger
  );

  if (isTcgPocketSet(extractSetId(externalId), pocketSetIds)) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Card not found");
  }

  const response = await fetchTcgdex(`/cards/${encodeURIComponent(externalId)}`, undefined, logger);

  if (response.status === 404) {
    throw appError(404, API_ERROR_CODES.NOT_FOUND, "Card not found");
  }

  if (response.status === 429) {
    logger.warn({ event: "tcgdex.error", status: 429, externalId }, "tcgdex rate limited");
    throw appError(429, API_ERROR_CODES.RATE_LIMITED, "Too many card requests. Try again shortly.");
  }

  if (!response.ok) {
    logger.error(
      { event: "tcgdex.error", status: response.status, externalId },
      "tcgdex card detail failed"
    );
    throw appError(502, API_ERROR_CODES.TCGDEX_UNAVAILABLE, "Card catalog temporarily unavailable");
  }

  const raw = (await response.json()) as TcgdexCardDetail;
  const result = normalizeCardDetail(raw);

  await cacheSet(cacheKey, result, getCardCacheTtl());

  return result;
}
