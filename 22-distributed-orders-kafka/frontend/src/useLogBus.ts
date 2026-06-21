import { useEffect, useRef, useState } from 'react';
import type { LogEntry } from './types';

/** Subscribes to the gateway WebSocket and accumulates a rolling buffer of log entries. */
export function useLogBus(max = 1000): { entries: LogEntry[]; connected: boolean } {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let stopped = false;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${location.host}/ws`;

    function connect(): void {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        setConnected(false);
        if (!stopped) setTimeout(connect, 1000);
      };
      ws.onmessage = (ev) => {
        try {
          const entry = JSON.parse(ev.data as string) as LogEntry;
          setEntries((prev) => {
            const next = [...prev, entry];
            return next.length > max ? next.slice(next.length - max) : next;
          });
        } catch {
          /* ignore malformed */
        }
      };
    }

    connect();
    return () => {
      stopped = true;
      wsRef.current?.close();
    };
  }, [max]);

  return { entries, connected };
}
