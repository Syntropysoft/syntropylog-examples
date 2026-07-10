import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

// Fields worth surfacing inline — note the masked ones (email, cardNumber, cvv).
const SHOWN_FIELDS = [
  'orderId',
  'email',
  'cardNumber',
  'cvv',
  'cardHolder',
  'last4',
  'amount',
  'operation',
  'reason',
  'channel',
  'itemCount',
  'shortageCount',
];

const MASKED = new Set(['email', 'cardNumber', 'cvv']);

function fmtTime(ts: string): string {
  try {
    const d = new Date(ts);
    return (
      d.toLocaleTimeString('en-US', { hour12: false }) +
      '.' +
      String(d.getMilliseconds()).padStart(3, '0')
    );
  } catch {
    return ts;
  }
}

export function LogStream({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  return (
    <div className="logstream" ref={ref}>
      {entries.length === 0 && (
        <div className="empty">No logs in this trace yet — place an order and watch it light up.</div>
      )}
      {entries.map((e, i) => (
        <div className={`logrow lvl-${e.level}`} key={i}>
          <span className="ts">{fmtTime(e.timestamp)}</span>
          <span className={`svc svc-${e.service}`}>{e.service}</span>
          <span className={`lvl-pill lvl-${e.level}`}>{e.level}</span>
          <span className="msg">{e.message}</span>
          <span className="fields">
            {SHOWN_FIELDS.filter((f) => e[f] !== undefined && e[f] !== null).map((f) => (
              <span className={`field ${MASKED.has(f) ? 'masked' : ''}`} key={f}>
                <b>{f}</b>:{String(e[f])}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
