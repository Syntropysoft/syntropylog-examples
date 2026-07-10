import { useEffect, useMemo, useState } from 'react';
import { CATALOG } from './catalog';
import { newTraceId, placeOrder } from './api';
import { useLogBus } from './useLogBus';
import { Storefront } from './components/Storefront';
import { Pipeline } from './components/Pipeline';
import { LogStream } from './components/LogStream';
import { TraceWaterfall } from './components/TraceWaterfall';
import type { CartLine, OrderResult } from './types';

export default function App() {
  const { entries, traces, connected, fetchTrace } = useLogBus();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [lastResult, setLastResult] = useState<OrderResult | null>(null);

  async function onPlaceOrder(lines: CartLine[]): Promise<void> {
    const id = newTraceId();
    setActiveId(id);
    setPlacing(true);
    setLastResult(null);
    try {
      const res = await placeOrder(lines, id);
      setLastResult(res);
    } catch (e) {
      setLastResult({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setPlacing(false);
    }
  }

  // Selecting a trace whose waterfall isn't in memory (a historical one, e.g. after a reload —
  // logs are replayed on connect but trace layouts are only streamed live) → fetch it from the
  // collector's durable store on demand, so any recent trace shows its full waterfall, not just the last.
  useEffect(() => {
    if (activeId && !traces[activeId]) fetchTrace(activeId);
  }, [activeId, traces, fetchTrace]);

  const traceEntries = useMemo(
    () => (activeId ? entries.filter((e) => e.correlationId === activeId) : entries),
    [entries, activeId]
  );

  const recentIds = useMemo(() => {
    const seen: string[] = [];
    for (let i = entries.length - 1; i >= 0 && seen.length < 10; i--) {
      const id = entries[i].correlationId;
      if (id && !seen.includes(id)) seen.push(id);
    }
    return seen;
  }, [entries]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◈</span> SyntropyLog · Distributed Orders
        </div>
        <div className="tag">one id across TS · Python · Kafka — logs + trace served by the .NET AOT collector</div>
        <div className={`conn ${connected ? 'on' : 'off'}`}>{connected ? '● live' : '○ connecting…'}</div>
      </header>

      <main className="grid">
        <Storefront catalog={CATALOG} placing={placing} onPlaceOrder={onPlaceOrder} lastResult={lastResult} />

        <section className="dashboard">
          <div className="dash-head">
            <h2>Live distributed trace</h2>
            <div className="trace-pick">
              <button className={`chip ${activeId === null ? 'on' : ''}`} onClick={() => setActiveId(null)}>
                all
              </button>
              {recentIds.map((id) => (
                <button
                  key={id}
                  className={`chip ${activeId === id ? 'on' : ''}`}
                  onClick={() => setActiveId(id)}
                  title={id}
                >
                  {id.slice(0, 8)}
                </button>
              ))}
            </div>
          </div>

          <div className="corr-line">
            {activeId ? (
              <>
                tracing <code>{activeId}</code> — <b>{traceEntries.length}</b> log entries across{' '}
                <b>{new Set(traceEntries.map((e) => e.service)).size}</b> services
              </>
            ) : (
              <>showing all traces — place an order to follow one end to end</>
            )}
          </div>

          <h3 className="section-h">Trace waterfall</h3>
          <TraceWaterfall trace={activeId ? traces[activeId] ?? null : null} logs={traceEntries} />

          <h3 className="section-h">Pipeline</h3>
          <Pipeline entries={traceEntries} />

          <h3 className="section-h">Logs</h3>
          <LogStream entries={traceEntries} />
        </section>
      </main>
    </div>
  );
}
