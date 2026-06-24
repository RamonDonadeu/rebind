import type { FastifyBaseLogger } from "fastify";
import { API_ERROR_CODES } from "@rebind/shared";
import { appError } from "../lib/errors.js";
import {
  normalizeCardDetail,
  normalizeSearchCard,
  paginateSearchResults,
  type NormalizedCardDetail,
  type NormalizedSearchResponse,
  type TcgdexCardDetail,
  type TcgdexSearchCard,
} from "../lib/tcgdex.types.js";
import {
  cacheGet,
  cacheSet,
  cardCacheKey,
  getCardCacheTtl,
  getSearchCacheTtl,
  searchCacheKey,
} from "./cache.service.js";

const TCGDEX_TIMEOUT_MS = 10_000;

export type SearchCardsInput = {
  q: string;
  set?: string;
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

function filterBySet(cards: TcgdexSearchCard[], setId?: string): TcgdexSearchCard[] {
  if (!setId) {
    return cards;
  }

  return cards.filter((card) => card.id.startsWith(`${setId}-`) || card.id.startsWith(`${setId}.`));
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

  const response = await fetchTcgdex("/cards", { name: input.q }, logger);

  if (response.status === 404) {
    return paginateSearchResults([], input.page, input.limit);
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
  const filtered = filterBySet(raw, input.set);
  const normalized = filtered.map(normalizeSearchCard);
  const result = paginateSearchResults(normalized, input.page, input.limit);

  await cacheSet(cacheKey, result, getSearchCacheTtl());

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
