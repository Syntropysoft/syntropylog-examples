/**
 * The single SyntropyLog bootstrap shared by every service.
 *
 * The important bits:
 *   - `correlationIdHeader: FIELD_CORRELATION` makes the built-in middleware
 *     store the id under the SAME conceptual key that getPropagationHeaders()
 *     reads. That is what keeps ONE id in the logs AND on the wire (HTTP + Kafka).
 *   - inbound/outbound maps declare the wire names per source/target. HTTP uses
 *     `x-correlation-id`; Kafka uses `correlationId`. The framework translates.
 *   - a collector-log AdapterTransport pushes every already-masked entry to the .NET
 *     collector over HTTP, which serves the live dashboard over SSE.
 */
import { syntropyLog, ClassicConsoleTransport, type ILogger } from 'syntropylog';

import { env } from './env';
import { maskingConfig } from './masking';
import { createCollectorLogTransport, FIELD_SPAN_ID } from './tracing';
import {
  FIELD_CORRELATION,
  FIELD_TENANT,
  SOURCE_FRONTEND,
  SOURCE_KAFKA,
  TARGET_HTTP,
  TARGET_KAFKA,
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
  // Logs are pushed to the .NET collector over HTTP (batched); the collector serves the
  // live dashboard over SSE. Redis is now state-only (orders + stock).
  const collectorLogs = createCollectorLogTransport(env.COLLECTOR_URL);

  await syntropyLog.init({
    logger: {
      serviceName,
      level: env.LOG_LEVEL,
      transports: [new ClassicConsoleTransport(), collectorLogs.transport],
    },
    masking: maskingConfig,
    loggingMatrix: {
      // spanId rides every entry so the dashboard can nest each log under its span in the
      // waterfall. It is set by tracing's withSpan; a log emitted outside any span simply
      // has no spanId and attaches to the trace, not a span.
      default: [FIELD_CORRELATION, FIELD_TENANT, FIELD_SPAN_ID],
      info: [FIELD_CORRELATION, FIELD_TENANT, FIELD_SPAN_ID, 'orderId', 'customerId', 'operation'],
      warn: [FIELD_CORRELATION, FIELD_TENANT, FIELD_SPAN_ID, 'orderId', 'operation'],
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
      await collectorLogs.shutdown();
    }
  };

  return { sl: syntropyLog, logger, contextManager, shutdown };
}
