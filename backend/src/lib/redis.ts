import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // required for BullMQ
  retryStrategy: (times) => Math.min(times * 200, 5000), // exponential backoff, cap at 5s
});

// Suppress noisy TCP errors (e.g. ECONNRESET from Upstash) — ioredis auto-reconnects
redis.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') return;
  console.error('[Redis] Unexpected error:', err.message);
});

export const cacheGet = async (key: string): Promise<string | null> => {
  return redis.get(key);
};

export const cacheSet = async (key: string, value: string, ttlSeconds = 3600): Promise<void> => {
  await redis.set(key, value, 'EX', ttlSeconds);
};

export const cacheDel = async (...keys: string[]): Promise<void> => {
  if (keys.length > 0) await redis.del(...keys);
};