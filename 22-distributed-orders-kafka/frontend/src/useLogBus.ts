import { useEffect, useRef, useState } from 'react';
import type { LogEntry } from './types';

// The .NET AOT traceability collector serves the live feed over SSE (it ingests every
// service's logs). Override with VITE_COLLECTOR_URL; defaults to the local collector.
const COLLECTOR_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_COLLECTOR_URL ?? 'http://localhost:9317';

/** Subscribes to the collector's SSE stream and accumulates a rolling buffer of log entries. */
export function useLogBus(max = 1000): { entries: LogEntry[]; connected: boolean } {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // EventSource reconnects on its own — we just reflect the connection state.
    const es = new EventSource(`${COLLECTOR_URL}/stream`);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as { type: string; entry: LogEntry };
        if (msg.type !== 'log') return; // guard: ignore non-log events (spans, later)
        setEntries((prev) => {
          const next = [...prev, msg.entry];
          return next.length > max ? next.slice(next.length - max) : next;
        });
      } catch {
        /* ignore malformed */
      }
    };

    return () => {
      esRef.current?.close();
    };
  }, [max]);

  return { entries, connected };
}
