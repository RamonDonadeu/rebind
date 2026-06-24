import { createHash } from "node:crypto";
import { createClient, type RedisClientType } from "redis";
import type { FastifyBaseLogger } from "fastify";

const SEARCH_TTL_SECONDS = 60 * 60;
const CARD_TTL_SECONDS = 60 * 60 * 24;
const SETS_TTL_SECONDS = 60 * 60 * 24;

let client: RedisClientType | null = null;
let cacheEnabled = false;

export type SearchCacheParams = {
  q?: string;
  set?: string;
  rarity?: string;
  sort?: string;
  order?: string;
  page: number;
  limit: number;
};

export function searchCacheKey(params: SearchCacheParams): string {
  const hash = createHash("sha256")
    .update(JSON.stringify(params))
    .digest("hex");

  return `tcgdex:search:${hash}`;
}

export function setsCacheKey(): string {
  return "tcgdex:sets:all";
}

export function getSetsCacheTtl(): number {
  return SETS_TTL_SECONDS;
}

export function cardCacheKey(externalId: string): string {
  return `tcgdex:card:${externalId}`;
}

export function getSearchCacheTtl(): number {
  return SEARCH_TTL_SECONDS;
}

export function getCardCacheTtl(): number {
  return CARD_TTL_SECONDS;
}

export function isCacheEnabled(): boolean {
  return cacheEnabled;
}

export async function connectRedis(logger: FastifyBaseLogger): Promise<void> {
  const url = process.env.REDIS_URL;

  if (!url) {
    logger.warn({ event: "redis.config_missing" }, "REDIS_URL not set; cache disabled");
    return;
  }

  const redis = createClient({ url });

  redis.on("error", (err) => {
    logger.error({ err, event: "redis.error" }, "redis client error");
  });

  try {
    await redis.connect();
    client = redis;
    cacheEnabled = true;
    logger.info({ event: "redis.connected" }, "redis connected");
  } catch (err) {
    logger.warn({ err, event: "redis.connect_failed" }, "redis unavailable; cache disabled");
    client = null;
    cacheEnabled = false;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!client || !cacheEnabled) {
    return null;
  }

  try {
    const value = await client.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!client || !cacheEnabled) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // Cache failures should not break requests.
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    cacheEnabled = false;
  }
}
