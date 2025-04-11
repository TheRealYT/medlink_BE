import Redis from 'ioredis';

import { getEnv } from '@/config/env';
import { logger } from '@/utils';

export function connectRedis() {
  const redis = new Redis({
    host: getEnv('REDIS_HOST'),
    port: getEnv('REDIS_PORT'),
  });

  return new Promise<void>((resolve, reject) => {
    redis.on('connect', () => {
      logger.info('Connected to Redis');
      resolve();
    });

    redis.on('error', (err) => {
      logger.error('Redis connection error:', err);
      reject(err);
    });
  });
}
