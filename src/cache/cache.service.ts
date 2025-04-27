import { redis } from '@/config/redis';

export class CacheService {
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl != undefined) {
      await redis.set(key, value, 'EX', ttl);
    } else {
      await redis.set(key, value, 'KEEPTTL');
    }
  }

  async setJSON(key: string, value: object, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  async get(key: string): Promise<string | null> {
    const value = await redis.get(key);
    return value ? value : null;
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);

    try {
      if (value) return JSON.parse(value) as T;
    } catch (e) {
      // JSON parse error
    }

    return null;
  }

  async del(...keys: string[]): Promise<void> {
    await redis.del(keys);
  }

  // checks if whether all the keys exist
  async has(...keys: string[]): Promise<boolean> {
    const exists = await redis.exists(keys);
    return exists === keys.length;
  }

  // increment a key in Redis (e.g., counters, rate limits)
  async increment(key: string): Promise<number> {
    return redis.incr(key);
  }

  // get time left in seconds
  async getTimeLeft(key: string): Promise<number | null> {
    const ttl = await redis.ttl(key);

    // no expiration set for the key
    if (ttl === -1) return null;

    return ttl;
  }

  async clear(): Promise<void> {
    await redis.flushdb();
  }
}

export default new CacheService();
