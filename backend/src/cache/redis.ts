import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connecting = false;

/**
 * Returns a shared Redis client, or null if Redis is unavailable.
 * Failures are logged and degraded gracefully — the caller falls back to
 * source-only reads without caching.
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (client) return client;
  if (connecting) return null;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    connecting = true;
    const c = createClient({ url });
    c.on("error", (err) => {
      console.error("[redis] connection lost:", err.message);
      client = null;
    });
    await c.connect();
    client = c;
    return c;
  } catch (err) {
    console.error("[redis] connect failed:", (err as Error).message);
    client = null;
    return null;
  } finally {
    connecting = false;
  }
}

const DEFAULT_TTL = 300;

function getCacheTtl(): number {
  const raw = process.env.EVIDENCE_CACHE_TTL_SECONDS;
  if (!raw) return DEFAULT_TTL;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TTL;
}

/** Namespace prefix for all evidence cache keys. */
const NS = "trace:evidence" as const;

/** Cached line-count metadata for an evidence file. */
export function evidenceCountCacheKey(caseId: string, fileId: string): string {
  return `${NS}:${caseId}:${fileId}:count`;
}

/** Cached individual page of an evidence file. */
export function evidencePageCacheKey(caseId: string, fileId: string, page: number): string {
  return `${NS}:${caseId}:${fileId}:page:${page}`;
}

/** Cached server-side search statistics for a query on an evidence file. */
export function evidenceSearchCacheKey(caseId: string, fileId: string, query: string): string {
  return `${NS}:${caseId}:${fileId}:search:${encodeURIComponent(query.toLowerCase().trim())}`;
}

export async function cacheGet(key: string): Promise<string | null> {
  const redis = await getRedisClient();
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;
  try {
    await redis.setEx(key, getCacheTtl(), value);
  } catch (err) {
    console.error("[redis] set failed:", (err as Error).message);
  }
}