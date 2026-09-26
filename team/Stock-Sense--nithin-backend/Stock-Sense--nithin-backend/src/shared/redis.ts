import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => console.log('✅ [Redis] Connected successfully'));
redis.on('error', (err) => console.error('❌ [Redis] Connection error:', err.message));

// Helper: Get or compute cache
export const getOrSetCache = async <T>(
  key: string,
  ttlSeconds: number,
  fetchFunction: () => Promise<T>
): Promise<T> => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
  } catch (err) {
    console.warn(`[Redis] Failed to read key ${key}:`, err);
  }

  const freshData = await fetchFunction();

  try {
    if (freshData !== null && freshData !== undefined) {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData));
    }
  } catch (err) {
    console.warn(`[Redis] Failed to cache key ${key}:`, err);
  }

  return freshData;
};

// Helper: Invalidate cache by pattern or key
export const invalidateCache = async (keyOrPattern: string): Promise<void> => {
  try {
    if (keyOrPattern.includes('*')) {
      const keys = await redis.keys(keyOrPattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(keyOrPattern);
    }
  } catch (err) {
    console.warn(`[Redis] Invalidation failed for ${keyOrPattern}:`, err);
  }
};

export default redis;
