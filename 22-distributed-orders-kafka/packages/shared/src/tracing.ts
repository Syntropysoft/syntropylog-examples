/**
 * The TypeScript observability helper — the client-side SDK (the OTel-SDK-per-language
 * model). One import gives a service: `withSpan` (timed spans), `inject`/`extract` (W3C
 * `traceparent` propagation), and a batched HTTP exporter that pushes to the .NET AOT
 * collector. See ../../TRACING-DESIGN.md.
 *
 * Structure = functional core / imperative shell:
 *   - PURE core: the `traceparent` codec (compose/parse) — no I/O, deterministic, tested.
 *   - Shell: the exporter (fetch) and `withSpan` (reads/writes SyntropyLog context).
 */
import { randomBytes } from 'node:crypto';
import { syntropyLog, AdapterTransport, UniversalAdapter } from 'syntropylog';

// ── Context field keys (conceptual; also ride in the log envelope) ───────────
export const FIELD_TRACE_ID = 'traceId';
export const FIELD_SPAN_ID = 'spanId';

export type SpanKind = 'server' | 'client' | 'producer' | 'consumer' | 'internal';
export type SpanStatus = 'ok' | 'error';

export interface SpanRecord {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  name: string;
  service: string;
  kind: SpanKind;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: SpanStatus;
  attributes: Record<string, unknown>;
}

// ════════════════════════════════════════════════════════════════════════════
// PURE CORE — id generation + W3C traceparent codec. No I/O, no context.
// ════════════════════════════════════════════════════════════════════════════

/** 16 bytes / 32 hex — a W3C trace-id. */
export const newTraceId = (): string => randomBytes(16).toString('hex');

/** 8 bytes / 16 hex — a W3C span-id. */
export const newSpanId = (): string => randomBytes(8).toString('hex');

const TRACEPARENT_RE = /^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/i;
const ZERO_TRACE = '0'.repeat(32);
const ZERO_SPAN = '0'.repeat(16);

/** Compose a sampled W3C `traceparent`: `00-<traceId>-<spanId>-01`. Pure. */
export const composeTraceparent = (traceId: string, spanId: string): string =>
  `00-${traceId}-${spanId}-01`;

/**
 * Parse a W3C `traceparent`, returning the trace-id and the sender's span-id (our
 * parent). Pure; guard-claused — returns null for anything malformed or all-zero.
 */
export function parseTraceparent(
  header: string | null | undefined
): { traceId: string; parentSpanId: string } | null {
  if (!header) return null; // guard: absent
  const m = TRACEPARENT_RE.exec(header.trim());
  if (m === null) return null; // guard: malformed
  const traceId = m[2].toLowerCase();
  const parentSpanId = m[3].toLowerCase();
  if (traceId === ZERO_TRACE || parentSpanId === ZERO_SPAN) return null; // guard: invalid all-zero
  return { traceId, parentSpanId };
}

/** Read a header case-insensitively from a plain record. Pure. */
export function readHeader(
  headers: Record<string, unknown>,
  name: string
): string | undefined {
  const wanted = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() !== wanted) continue;
    const value = headers[key];
    if (value == null) return undefined;
    return Array.isArray(value) ? String(value[0]) : String(value);
  }
  return undefined;
}

// ════════════════════════════════════════════════════════════════════════════
// SHELL — the batched HTTP exporter (the executor's sink).
// ════════════════════════════════════════════════════════════════════════════

export interface ExporterOptions {
  endpoint: string;
  batchSize?: number;
  flushMs?: number;
}

/**
 * Buffers spans/logs and flushes them to the collector in batches — the OTel
 * BatchProcessor/exporter pattern. Best-effort (Silent Observer): a failed flush drops
 * the batch rather than throwing (durable buffering is a later phase).
 */
export class OtlpLiteExporter {
  private readonly endpoint: string;
  private readonly batchSize: number;
  private readonly timer: NodeJS.Timeout;
  private spans: SpanRecord[] = [];
  private logs: Record<string, unknown>[] = [];

  constructor(options: ExporterOptions) {
    this.endpoint = options.endpoint;
    this.batchSize = options.batchSize ?? 100;
    this.timer = setInterval(() => void this.flush(), options.flushMs ?? 1000);
    if (typeof this.timer.unref === 'function') this.timer.unref();
  }

  addSpan(span: SpanRecord): void {
    this.spans.push(span);
    if (this.spans.length >= this.batchSize) void this.flushSpans();
  }

  addLog(entry: Record<string, unknown>): void {
    this.logs.push(entry);
    if (this.logs.length >= this.batchSize) void this.flushLogs();
  }

  async flush(): Promise<void> {
    await Promise.all([this.flushSpans(), this.flushLogs()]);
  }

  async shutdown(): Promise<void> {
    clearInterval(this.timer);
    await this.flush();
  }

  private async flushSpans(): Promise<void> {
    if (this.spans.length === 0) return; // guard
    const batch = this.spans;
    this.spans = [];
    await this.post('/v1/spans', batch);
  }

  private async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return; // guard
    const batch = this.logs;
    this.logs = [];
    await this.post('/v1/logs', batch);
  }

  private async post(path: string, batch: unknown[]): Promise<void> {
    try {
      await fetch(`${this.endpoint}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(batch),
      });
    } catch {
      /* Silent Observer — never let a telemetry hiccup touch the request path. */
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SHELL — the tracer: withSpan + traceparent inject/extract over the context.
// ════════════════════════════════════════════════════════════════════════════

export interface Tracer {
  withSpan<T>(
    name: string,
    attributes: Record<string, unknown>,
    fn: () => Promise<T>,
    kind?: SpanKind
  ): Promise<T>;
  /** Compose `traceparent` from the active context onto outbound headers. */
  inject(headers: Record<string, string>): void;
  /** Parse an inbound `traceparent` into the current context scope. */
  extract(headers: Record<string, unknown>): void;
}

/** Create a tracer bound to a service name and an exporter (DIP). */
export function createTracer(serviceName: string, exporter: OtlpLiteExporter): Tracer {
  const ctx = () => syntropyLog.getContextManager();

  async function withSpan<T>(
    name: string,
    attributes: Record<string, unknown>,
    fn: () => Promise<T>,
    kind: SpanKind = 'internal'
  ): Promise<T> {
    const cm = ctx();
    const parentSpanId = cm.get<string>(FIELD_SPAN_ID) ?? null;
    const traceId = cm.get<string>(FIELD_TRACE_ID) ?? newTraceId(); // root if none
    const spanId = newSpanId();
    const startTime = new Date().toISOString();
    const startedAt = performance.now();

    let result: T | undefined;
    let status: SpanStatus = 'ok';

    // A child scope (inherits parent data): traceId flows, spanId becomes this span,
    // so any nested withSpan sees it as its parent.
    await cm.run(async () => {
      cm.set(FIELD_TRACE_ID, traceId);
      cm.set(FIELD_SPAN_ID, spanId);
      try {
        result = await fn();
      } catch (err) {
        status = 'error';
        throw err; // tracing never swallows
      } finally {
        exporter.addSpan({
          traceId,
          spanId,
          parentSpanId,
          name,
          service: serviceName,
          kind,
          startTime,
          endTime: new Date().toISOString(),
          durationMs: performance.now() - startedAt,
          status,
          attributes,
        });
      }
    });

    return result as T;
  }

  function inject(headers: Record<string, string>): void {
    const cm = ctx();
    const traceId = cm.get<string>(FIELD_TRACE_ID);
    const spanId = cm.get<string>(FIELD_SPAN_ID);
    if (!traceId || !spanId) return; // guard: nothing active to propagate
    headers['traceparent'] = composeTraceparent(traceId, spanId);
  }

  function extract(headers: Record<string, unknown>): void {
    const parsed = parseTraceparent(readHeader(headers, 'traceparent'));
    if (parsed === null) return; // guard: no/invalid traceparent → this hop starts a root
    const cm = ctx();
    cm.set(FIELD_TRACE_ID, parsed.traceId);
    cm.set(FIELD_SPAN_ID, parsed.parentSpanId); // the sender's span is our parent
  }

  return { withSpan, inject, extract };
}

/**
 * A SyntropyLog transport that pushes every already-masked log entry to the collector's
 * `/v1/logs` (batched), so the dashboard can be fed by the collector instead of the Redis
 * log bus. The executor's sink is HTTP — same "declare once, route anywhere", new target.
 * Coexists with the log bus during the transition (Silent-Observer drop on failure).
 */
export function createCollectorLogTransport(
  endpoint: string,
  batchSize = 100,
  flushMs = 1000
): { transport: AdapterTransport; shutdown: () => Promise<void> } {
  let buffer: Record<string, unknown>[] = [];

  const flush = async (): Promise<void> => {
    if (buffer.length === 0) return; // guard
    const batch = buffer;
    buffer = [];
    try {
      await fetch(`${endpoint}/v1/logs`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(batch),
      });
    } catch {
      /* Silent Observer — telemetry never touches the app. */
    }
  };

  const timer = setInterval(() => void flush(), flushMs);
  if (typeof timer.unref === 'function') timer.unref();

  const transport = new AdapterTransport({
    name: 'collector-logs',
    adapter: new UniversalAdapter({
      // `entry` is already masked, sanitized and context-enriched.
      executor: (entry: unknown) => {
        buffer.push(entry as Record<string, unknown>);
        if (buffer.length >= batchSize) void flush();
      },
      onError: () => {},
    }),
  });

  return {
    transport,
    shutdown: async () => {
      clearInterval(timer);
      await flush();
    },
  };
}

/** Convenience: an exporter + tracer for a service, pointed at the collector. */
export function createTracing(
  serviceName: string,
  endpoint: string
): { tracer: Tracer; exporter: OtlpLiteExporter; shutdown: () => Promise<void> } {
  const exporter = new OtlpLiteExporter({ endpoint });
  const tracer = createTracer(serviceName, exporter);
  return { tracer, exporter, shutdown: () => exporter.shutdown() };
}
