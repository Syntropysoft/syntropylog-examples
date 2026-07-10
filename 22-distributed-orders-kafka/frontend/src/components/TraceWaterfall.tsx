import type { TraceView } from '../types';

/** Renders the assembled trace as a waterfall. The .NET collector already computed the
 *  layout (offsets, depths, status) — this just draws bars on a shared timeline. */
export function TraceWaterfall({ trace }: { trace: TraceView | null }) {
  if (!trace || trace.waterfall.length === 0) {
    return (
      <div className="empty">No spans in this trace yet — place an order and watch the waterfall assemble.</div>
    );
  }

  const total = Math.max(trace.totalDurationMs, 1);

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

      {trace.waterfall.map((s) => {
        const left = Math.min((s.offsetMs / total) * 100, 99);
        const width = Math.max((s.durationMs / total) * 100, 0.8);
        return (
          <div className="wf-row" key={s.spanId}>
            <div className="wf-label" style={{ paddingLeft: `${s.depth * 14}px` }}>
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
        );
      })}
    </div>
  );
}
