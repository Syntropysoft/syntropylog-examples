/**
 * Kafka helpers that carry the SyntropyLog correlation context across the broker.
 *
 *  - producers attach `getPropagationHeaders('kafka')` as message headers
 *    → { correlationId, tenantId } on the wire.
 *  - `startConsumer` opens a fresh context per message and rehydrates it from
 *    those headers with `extractInboundContext(..., SOURCE_KAFKA, ...)`, so every
 *    log emitted while handling the message carries the SAME correlation id that
 *    started back in the browser.
 */
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { extractInboundContext, type ILogger } from 'syntropylog';

import { env } from './env';
import { CONTEXT_CONFIG } from './syntropy';
import { FIELD_CORRELATION, SOURCE_KAFKA, TARGET_KAFKA } from './constants';

/** Minimal structural view of the SyntropyLog context manager we use here. */
export interface CtxLike {
  run(fn: () => Promise<void>): Promise<void>;
  set(key: string, value: unknown): void;
  get<T = string>(key: string): T | undefined;
  getPropagationHeaders(target?: string): Record<string, string>;
}

export function createKafka(clientId: string): Kafka {
  return new Kafka({
    clientId,
    brokers: env.KAFKA_BROKERS,
    logLevel: logLevel.NOTHING,
    retry: { retries: 12, initialRetryTime: 300 },
  });
}

export async function createProducer(clientId: string): Promise<Producer> {
  const producer = createKafka(clientId).producer();
  await producer.connect();
  return producer;
}

/** Idempotently create topics (single partition) and wait for leaders, so a
 *  consumer subscribing right after never hits "server does not host this
 *  topic-partition" from the auto-create race. Safe to call from every service. */
export async function ensureTopics(clientId: string, topics: string[]): Promise<void> {
  const admin = createKafka(clientId).admin();
  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: topics.map((topic) => ({ topic, numPartitions: 1, replicationFactor: 1 })),
    });
  } catch {
    // already exists / created concurrently — fine
  } finally {
    await admin.disconnect();
  }
}

/** Publish an event, translating the current context to Kafka wire headers.
 *  `extraHeaders` (e.g. a `traceparent`) are merged onto the message headers — the tracing
 *  layer uses this to carry a span context across the broker without coupling to it. */
export async function publishEvent(
  producer: Producer,
  topic: string,
  key: string | null,
  value: unknown,
  contextManager: CtxLike,
  extraHeaders: Record<string, string> = {}
): Promise<void> {
  const headers = { ...contextManager.getPropagationHeaders(TARGET_KAFKA), ...extraHeaders };
  await producer.send({
    topic,
    messages: [{ key, value: JSON.stringify(value), headers }],
  });
}

export interface ConsumedEvent<T> {
  topic: string;
  partition: number;
  key: string | null;
  value: T;
  /** Normalized (lowercased) message headers — lets the tracing layer extract a traceparent. */
  headers: Record<string, string>;
}

export interface StartConsumerOptions<T> {
  clientId: string;
  groupId: string;
  topics: string[];
  contextManager: CtxLike;
  logger: ILogger;
  eachEvent: (event: ConsumedEvent<T>) => Promise<void>;
}

/** Kafka delivers header values as Buffers with their original-case keys.
 *  Lowercase the keys so `extractInboundContext` (which lowercases wire names)
 *  finds them regardless of the casing used on the producer side. */
function normalizeHeaders(
  headers: Record<string, unknown> | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  for (const [k, v] of Object.entries(headers)) {
    if (v == null) continue;
    const raw = Array.isArray(v) ? v[0] : v;
    out[k.toLowerCase()] = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
  }
  return out;
}

export async function startConsumer<T>(
  opts: StartConsumerOptions<T>
): Promise<Consumer> {
  const { clientId, groupId, topics, contextManager, logger, eachEvent } = opts;
  const consumer = createKafka(clientId).consumer({ groupId });
  await consumer.connect();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const headers = normalizeHeaders(message.headers as Record<string, unknown>);
      await contextManager.run(async () => {
        // Rehydrate the correlation context from the message headers.
        const fields = extractInboundContext(headers, SOURCE_KAFKA, CONTEXT_CONFIG);
        for (const [field, value] of Object.entries(fields)) {
          contextManager.set(field, value);
        }
        if (!contextManager.get(FIELD_CORRELATION)) {
          contextManager.set(FIELD_CORRELATION, `trc_${clientId}_${Date.now()}`);
        }

        const value = (message.value ? JSON.parse(message.value.toString('utf8')) : null) as T;
        try {
          await eachEvent({ topic, partition, key: message.key?.toString() ?? null, value, headers });
        } catch (err) {
          logger.error(
            { topic, error: err instanceof Error ? err.message : String(err) },
            'kafka consumer handler failed'
          );
        }
      });
    },
  });

  return consumer;
}
