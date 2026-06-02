import redis from '../config/redis';

const DEFAULT_TTL = 60 * 5; // 5 minutes

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null; // Redis failure should never break the app
  }
};

export const setCache = async (
  key:   string,
  value: unknown,
  ttl:   number = DEFAULT_TTL
): Promise<void> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // silently fail , cuz this is optional
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch {}
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {}
};