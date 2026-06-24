import type { FastifyBaseLogger } from "fastify";
import { API_ERROR_CODES, type CardSearchSortField } from "@rebind/shared";
import { appError } from "../lib/errors.js";
import {
  buildSearchResponse,
  normalizeCardDetail,
  normalizeSearchCard,
  normalizeSetBrief,
  type NormalizedCardDetail,
  type NormalizedSearchResponse,
  type NormalizedSetBrief,
  type TcgdexCardDetail,
  type TcgdexSearchCard,
  type TcgdexSetBrief,
} from "../lib/tcgdex.types.js";
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

const SORT_FIELD_MAP: Record<CardSearchSortField, string> = {
  releaseDate: "releaseDate",
  name: "name",
  rarity: "rarity",
  price: "pricing.tcgplayer.normal.marketPrice",
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

function buildTcgdexUrl(path: string, query?: Record<string, string>): string {
  const url = new URL(`${tcgdexBaseUrl()}/${tcgdexLang()}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function fetchTcgdex(
  path: string,
  query: Record<string, string> | undefined,
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

function buildTcgdexSearchQuery(input: SearchCardsInput): Record<string, string> {
  const query: Record<string, string> = {
    "pagination:page": String(input.page),
    "pagination:itemsPerPage": String(input.limit),
  };

  if (input.q) {
    query.name = input.q;
  }

  if (input.set) {
    query["set.id"] = input.set;
  }

  if (input.rarity) {
    query.rarity = input.rarity;
  }

  const sortField = input.sort ?? "releaseDate";
  query["sort:field"] = SORT_FIELD_MAP[sortField];
  query["sort:order"] = input.order === "desc" ? "DESC" : "ASC";

  return query;
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

  const response = await fetchTcgdex("/cards", buildTcgdexSearchQuery(input), logger);

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
  const result = buildSearchResponse(normalized, input.page, input.limit);

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
    { "sort:field": "name", "sort:order": "ASC" },
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
