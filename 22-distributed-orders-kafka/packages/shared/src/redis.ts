import Redis from 'ioredis';
import { env } from './env';

/** A general-purpose Redis client (state: orders, stock). */
export function createRedis(): Redis {
  const client = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  client.on('error', () => {
    /* surfaced by callers via reconnect; don't crash */
  });
  return client;
}

export type { Redis };
