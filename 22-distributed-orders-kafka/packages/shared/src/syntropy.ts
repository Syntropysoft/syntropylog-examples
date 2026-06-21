/**
 * The single SyntropyLog bootstrap shared by every service.
 *
 * The important bits:
 *   - `correlationIdHeader: FIELD_CORRELATION` makes the built-in middleware
 *     store the id under the SAME conceptual key that getPropagationHeaders()
 *     reads. That is what keeps ONE id in the logs AND on the wire (HTTP + Kafka).
 *   - inbound/outbound maps declare the wire names per source/target. HTTP uses
 *     `x-correlation-id`; Kafka uses `correlationId`. The framework translates.
 *   - a logbus AdapterTransport publishes every already-masked entry to Redis,
 *     where the gateway picks it up and streams it to the live dashboard.
 */
import {
  syntropyLog,
  ClassicConsoleTransport,
  AdapterTransport,
  UniversalAdapter,
  type ILogger,
} from 'syntropylog';
import Redis from 'ioredis';

import { env } from './env';
import { maskingConfig } from './masking';
import {
  FIELD_CORRELATION,
  FIELD_TENANT,
  SOURCE_FRONTEND,
  SOURCE_KAFKA,
  TARGET_HTTP,
  TARGET_KAFKA,
  LOGBUS_CHANNEL,
} from './constants';

/**
 * The context configuration, exported so consumers (Kafka handlers) can pass it
 * to `extractInboundContext` without reaching into framework internals.
 */
export const CONTEXT_CONFIG = {
  correlationIdHeader: FIELD_CORRELATION, // ← the coherence trick
  inbound: {
    [SOURCE_FRONTEND]: {
      [FIELD_CORRELATION]: 'x-correlation-id',
      [FIELD_TENANT]: 'x-tenant-id',
    },
    [SOURCE_KAFKA]: {
      [FIELD_CORRELATION]: 'correlationId',
      [FIELD_TENANT]: 'tenantId',
    },
  },
  outbound: {
    [TARGET_HTTP]: {
      [FIELD_CORRELATION]: 'x-correlation-id',
      [FIELD_TENANT]: 'x-tenant-id',
    },
    [TARGET_KAFKA]: {
      [FIELD_CORRELATION]: 'correlationId',
      [FIELD_TENANT]: 'tenantId',
    },
  },
};

export interface Bootstrapped {
  sl: typeof syntropyLog;
  logger: ILogger;
  contextManager: ReturnType<typeof syntropyLog.getContextManager>;
  shutdown: () => Promise<void>;
}

export async function bootstrap(serviceName: string): Promise<Bootstrapped> {
  // Dedicated, publish-only Redis connection for the log bus.
  const logbusRedis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  logbusRedis.on('error', () => {
    /* the logbus is best-effort; never let it crash a service */
  });

  const logbusTransport = new AdapterTransport({
    name: 'logbus',
    adapter: new UniversalAdapter({
      // `entry` is already masked, sanitized and context-enriched.
      executor: (entry: unknown) => {
        const payload = JSON.stringify({
          ...(entry as Record<string, unknown>),
          service: serviceName,
        });
        void logbusRedis.publish(LOGBUS_CHANNEL, payload).catch(() => {});
      },
      onError: () => {},
    }),
  });

  await syntropyLog.init({
    logger: {
      serviceName,
      level: env.LOG_LEVEL,
      transports: [new ClassicConsoleTransport(), logbusTransport],
    },
    masking: maskingConfig,
    loggingMatrix: {
      default: [FIELD_CORRELATION, FIELD_TENANT],
      info: [FIELD_CORRELATION, FIELD_TENANT, 'orderId', 'customerId', 'operation'],
      warn: [FIELD_CORRELATION, FIELD_TENANT, 'orderId', 'operation'],
      error: ['*'],
      audit: ['*'],
    },
    context: CONTEXT_CONFIG,
    onLogFailure: (err: unknown) =>
      // eslint-disable-next-line no-console
      console.error(
        `[${serviceName}] log failure:`,
        err instanceof Error ? err.message : String(err)
      ),
  });

  const logger = syntropyLog.getLogger(serviceName);
  const contextManager = syntropyLog.getContextManager();

  const shutdown = async (): Promise<void> => {
    try {
      await syntropyLog.shutdown();
    } finally {
      await logbusRedis.quit().catch(() => {});
    }
  };

  return { sl: syntropyLog, logger, contextManager, shutdown };
}
