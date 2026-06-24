import type { FastifyBaseLogger } from "fastify";
import { cacheGet, cacheSet } from "../services/cache.service.js";

/** TCGdex series id for the Pokémon TCG Pocket mobile game (not physical TCG). */
export const TCG_POCKET_SERIES_ID = "tcgp";

const POCKET_SET_IDS_CACHE_KEY = "tcgdex:pocket-set-ids";
const POCKET_SET_IDS_TTL_SECONDS = 60 * 60 * 24;

type TcgdexSeriesDetail = {
  id: string;
  sets?: { id: string }[];
};

let memoryPocketSetIds: Set<string> | null = null;

function pocketSetIdsFromSeries(series: TcgdexSeriesDetail): Set<string> {
  return new Set((series.sets ?? []).map((set) => set.id));
}

export function isTcgPocketSet(setId: string, pocketSetIds: Set<string>): boolean {
  return pocketSetIds.has(setId);
}

export async function getTcgPocketSetIds(
  fetchSeries: (path: string) => Promise<Response>,
  logger: FastifyBaseLogger
): Promise<Set<string>> {
  if (memoryPocketSetIds) {
    return memoryPocketSetIds;
  }

  const cached = await cacheGet<string[]>(POCKET_SET_IDS_CACHE_KEY);
  if (cached) {
    memoryPocketSetIds = new Set(cached);
    return memoryPocketSetIds;
  }

  const response = await fetchSeries(`/series/${TCG_POCKET_SERIES_ID}`);

  if (!response.ok) {
    logger.warn(
      { event: "tcgdex.pocket_sets_fetch_failed", status: response.status },
      "failed to load TCG Pocket set ids; pocket cards may appear in results"
    );
    return new Set();
  }

  const series = (await response.json()) as TcgdexSeriesDetail;
  const ids = [...pocketSetIdsFromSeries(series)];

  memoryPocketSetIds = new Set(ids);
  await cacheSet(POCKET_SET_IDS_CACHE_KEY, ids, POCKET_SET_IDS_TTL_SECONDS);

  return memoryPocketSetIds;
}

export function pocketSetExclusionFilters(pocketSetIds: Set<string>): string[] {
  return [...pocketSetIds].map((id) => `neq:${id}`);
}
