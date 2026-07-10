import { useState } from 'react';
import type { LogEntry, TraceView, WaterfallEntry } from '../types';

// Fields worth surfacing on a nested log line (mirrors LogStream) — the masked ones stand out.
const SHOWN_FIELDS = [
  'orderId',
  'email',
  'cardNumber',
  'cvv',
  'amount',
  'operation',
  'reason',
  'itemCount',
  'shortageCount',
];
const MASKED = new Set(['email', 'cardNumber', 'cvv']);

function fmtTime(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return (
    d.toLocaleTimeString('en-US', { hour12: false }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0')
  );
}

/** Group log entries by the span they were emitted in (pure). Logs with no spanId key to ''. */
function groupBySpan(logs: LogEntry[]): Map<string, LogEntry[]> {
  const bySpan = new Map<string, LogEntry[]>();
  for (const log of logs) {
    const key = typeof log.spanId === 'string' ? log.spanId : '';
    const list = bySpan.get(key);
    if (list) list.push(log);
    else bySpan.set(key, [log]);
  }
  return bySpan;
}

/** A single nested log line under a span — compact form of the flat LogStream row. */
function LogLine({ log }: { log: LogEntry }) {
  return (
    <div className={`wf-logrow lvl-${log.level}`}>
      <span className="ts">{fmtTime(log.timestamp)}</span>
      <span className={`lvl-pill lvl-${log.level}`}>{log.level}</span>
      <span className="msg">{log.message}</span>
      {SHOWN_FIELDS.filter((f) => log[f] !== undefined && log[f] !== null).map((f) => (
        <span className={`field ${MASKED.has(f) ? 'masked' : ''}`} key={f}>
          <b>{f}</b>:{String(log[f])}
        </span>
      ))}
    </div>
  );
}

/**
 * Renders the assembled trace as a waterfall, with each service's logs nested under the span
 * they were emitted in. The .NET collector computed the span layout (offsets, depths, status);
 * the nesting is a pure client-side group-by: every log carries the `spanId` of its enclosing
 * span (the tracer sets it in context; the logging matrix whitelists it), so `log.spanId ===
 * span.spanId` stitches a log to its bar. Logs with no such span fall to a small footer group.
 */
export function TraceWaterfall({
  trace,
  logs = [],
}: {
  trace: TraceView | null;
  logs?: LogEntry[];
}) {
  // UI-only state: which spans have their logs collapsed. Default (absent) = expanded.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (!trace || trace.waterfall.length === 0) {
    return (
      <div className="empty">
        No spans in this trace yet — place an order and watch the waterfall assemble.
      </div>
    );
  }

  const total = Math.max(trace.totalDurationMs, 1);
  const bySpan = groupBySpan(logs);
  const spanIds = new Set(trace.waterfall.map((s) => s.spanId));
  // Logs tied to the trace but not to a span in it (no spanId, or a span not yet arrived).
  const orphans = logs.filter((l) => typeof l.spanId !== 'string' || !spanIds.has(l.spanId));

  const toggle = (spanId: string): void =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(spanId)) next.delete(spanId);
      else next.add(spanId);
      return next;
    });

  return (
    <div className="waterfall">
      <div className="wf-head">
        <span>
          trace <code>{trace.traceId.slice(0, 12)}…</code>
        </span>
        <span>
          <b>{trace.spanCount}</b> spans · <b>{trace.totalDurationMs.toFixed(1)}</b> ms ·{' '}
          <b className={`wf-status wf-${trace.status}`}>{trace.status}</b>
        </span>
      </div>

      {trace.waterfall.map((s: WaterfallEntry) => {
        const left = Math.min((s.offsetMs / total) * 100, 99);
        const width = Math.max((s.durationMs / total) * 100, 0.8);
        const spanLogs = bySpan.get(s.spanId) ?? [];
        const open = spanLogs.length > 0 && !collapsed.has(s.spanId);
        return (
          <div className="wf-group" key={s.spanId}>
            <div className="wf-row">
              <div className="wf-label" style={{ paddingLeft: `${s.depth * 14}px` }}>
                {spanLogs.length > 0 ? (
                  <button
                    className="wf-caret"
                    onClick={() => toggle(s.spanId)}
                    title={`${spanLogs.length} log${spanLogs.length === 1 ? '' : 's'}`}
                  >
                    <span className="wf-tri">{open ? '▾' : '▸'}</span>
                    <span className="wf-logcount">{spanLogs.length}</span>
                  </button>
                ) : (
                  <span className="wf-caret wf-caret-empty">·</span>
                )}
                <span className={`svc svc-${s.service}`}>{s.service}</span>
                <span className="wf-name" title={s.name}>
                  {s.name}
                </span>
                <span className="wf-kind">{s.kind}</span>
              </div>
              <div className="wf-track">
                <div
                  className={`wf-bar ${s.status === 'error' ? 'wf-err' : ''}`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: `var(--svc-${s.service}, var(--accent))`,
                  }}
                  title={`${s.name} · ${s.durationMs.toFixed(1)}ms`}
                >
                  <span className="wf-dur">{s.durationMs.toFixed(0)}ms</span>
                </div>
              </div>
            </div>
            {open && (
              <div className="wf-logs" style={{ paddingLeft: `${s.depth * 14 + 20}px` }}>
                {spanLogs.map((log, i) => (
                  <LogLine log={log} key={i} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {orphans.length > 0 && (
        <div className="wf-orphans">
          <div className="wf-orphan-head">
            {orphans.length} log{orphans.length === 1 ? '' : 's'} not tied to a span in this trace
          </div>
          <div className="wf-logs">
            {orphans.map((log, i) => (
              <LogLine log={log} key={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
