/**
 * Log-bus subscriber, used by the gateway. Every service publishes its already
 * masked + context-enriched log entries to a Redis channel; the gateway
 * subscribes here and forwards each entry to the dashboard over WebSocket.
 */
import Redis from 'ioredis';
import { env } from './env';
import { LOGBUS_CHANNEL } from './constants';

export interface LogBusEntry {
  service: string;
  level: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  tenantId?: string;
  source?: string;
  [key: string]: unknown;
}

/** Subscribe to the log bus. Returns an async stop() function. */
export function subscribeLogBus(
  onEntry: (entry: LogBusEntry) => void
): () => Promise<void> {
  const sub = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  sub.on('error', () => {
    /* best-effort */
  });
  void sub.subscribe(LOGBUS_CHANNEL).catch(() => {});
  sub.on('message', (_channel, payload) => {
    try {
      onEntry(JSON.parse(payload) as LogBusEntry);
    } catch {
      /* ignore malformed entries */
    }
  });
  return async () => {
    await sub.quit().catch(() => {});
  };
}
