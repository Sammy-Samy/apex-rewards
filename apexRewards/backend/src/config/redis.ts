// ApexRewards — ioredis client
import Redis from 'ioredis';
import { logger } from './logger';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => logger.error('ApexRewards Redis error', { err }));
redis.on('connect', () => logger.info('ApexRewards Redis connected'));
