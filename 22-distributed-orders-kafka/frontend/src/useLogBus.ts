import { useCallback, useEffect, useRef, useState } from 'react';
import type { LogEntry, TraceView } from './types';

// The .NET AOT traceability collector serves the live feed over SSE (it ingests every
// service's logs AND assembles their spans). Override with VITE_COLLECTOR_URL.
const COLLECTOR_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_COLLECTOR_URL ?? 'http://localhost:9317';

type StreamMessage =
  | { type: 'log'; entry: LogEntry }
  | { type: 'trace'; trace: TraceView };

// Identity of a log line for de-dup when the live SSE buffer and a durable fetch overlap.
const logKey = (e: LogEntry): string =>
  `${e.correlationId ?? ''}|${e.timestamp}|${e.service}|${e.level}|${e.spanId ?? ''}|${e.message}`;

/**
 * Subscribes to the collector's SSE stream. Accumulates a rolling buffer of log entries
 * AND the latest assembled trace per `traceId` (the waterfall fills in live as spans
 * arrive — the .NET collector re-assembles and pushes each update).
 */
export function useLogBus(max = 1000): {
  entries: LogEntry[];
  traces: Record<string, TraceView>;
  connected: boolean;
  fetchTrace: (traceId: string) => void;
  fetchLogs: (correlationId: string) => void;
} {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [traces, setTraces] = useState<Record<string, TraceView>>({});
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // Pull a trace's assembled waterfall from the collector (served from its durable SQLite store).
  // Live traces stream in over SSE; historical ones (e.g. after a reload) aren't re-broadcast, so
  // selecting an older chip fetches its waterfall on demand. Never throws — telemetry never breaks the UI.
  const fetchTrace = useCallback((traceId: string): void => {
    void (async () => {
      try {
        const res = await fetch(`${COLLECTOR_URL}/trace/${traceId}`);
        if (!res.ok) return; // 404 → not persisted (yet); the live SSE will fill it
        const trace = (await res.json()) as TraceView;
        setTraces((prev) => ({ ...prev, [trace.traceId]: trace }));
      } catch {
        /* collector unreachable → ignore */
      }
    })();
  }, []);

  // Pull a whole flow's logs by correlationId from the collector's durable store, ordered by
  // timestamp, and merge them into the buffer (de-duped against what SSE already delivered). Lets
  // the dashboard review a historical flow in full — the live SSE buffer only holds the recent tail.
  // Never throws — telemetry never breaks the UI.
  const fetchLogs = useCallback(
    (correlationId: string): void => {
      void (async () => {
        try {
          const res = await fetch(`${COLLECTOR_URL}/logs/${correlationId}`);
          if (!res.ok) return;
          const rows = (await res.json()) as LogEntry[];
          if (rows.length === 0) return;
          setEntries((prev) => {
            const seen = new Set(prev.map(logKey));
            const fresh = rows.filter((e) => !seen.has(logKey(e)));
            if (fresh.length === 0) return prev;
            const next = [...prev, ...fresh];
            return next.length > max ? next.slice(next.length - max) : next;
          });
        } catch {
          /* collector unreachable → ignore */
        }
      })();
    },
    [max]
  );

  useEffect(() => {
    // EventSource reconnects on its own — we just reflect the connection state.
    const es = new EventSource(`${COLLECTOR_URL}/stream`);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as StreamMessage;
        if (msg.type === 'log') {
          setEntries((prev) => {
            const next = [...prev, msg.entry];
            return next.length > max ? next.slice(next.length - max) : next;
          });
        } else if (msg.type === 'trace') {
          setTraces((prev) => ({ ...prev, [msg.trace.traceId]: msg.trace }));
        }
      } catch {
        /* ignore malformed */
      }
    };

    return () => {
      esRef.current?.close();
    };
  }, [max]);

  return { entries, traces, connected, fetchTrace, fetchLogs };
}
