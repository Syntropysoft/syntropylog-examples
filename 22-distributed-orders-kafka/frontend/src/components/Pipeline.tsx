import type { LogEntry } from '../types';

interface StageStat {
  count: number;
  level: 'info' | 'warn' | 'error';
}

function statsByService(entries: LogEntry[]): Map<string, StageStat> {
  const m = new Map<string, StageStat>();
  for (const e of entries) {
    const s = m.get(e.service) ?? { count: 0, level: 'info' as const };
    s.count += 1;
    if (e.level === 'error') s.level = 'error';
    else if (e.level === 'warn' && s.level !== 'error') s.level = 'warn';
    m.set(e.service, s);
  }
  return m;
}

function Node({
  svc,
  label,
  sub,
  color,
  stat,
}: {
  svc: string;
  label: string;
  sub: string;
  color: string;
  stat?: StageStat;
}) {
  const active = !!stat;
  const cls = ['node', `c-${color}`, active ? 'active' : 'idle', stat?.level ?? ''].join(' ');
  return (
    <div className={cls} title={svc}>
      <div className="node-name">{label}</div>
      <div className="node-sub">{sub}</div>
      <div className="node-count">{stat ? `${stat.count} logs` : '—'}</div>
    </div>
  );
}

function Hop({ label }: { label: string }) {
  return (
    <div className="hop">
      <span className="hop-label">{label}</span>
      <span className="hop-arrow">→</span>
    </div>
  );
}

export function Pipeline({ entries }: { entries: LogEntry[] }) {
  const s = statsByService(entries);
  return (
    <div className="pipeline">
      <Node svc="gateway" label="Gateway" sub="Express" color="blue" stat={s.get('gateway')} />
      <Hop label="HTTP" />
      <Node svc="orders" label="Orders" sub="NestJS" color="pink" stat={s.get('orders')} />
      <Hop label="Kafka" />
      <div className="parallel">
        <Node svc="payments" label="Payments" sub="Fastify" color="green" stat={s.get('payments')} />
        <Node svc="inventory" label="Inventory" sub="🐍 FastAPI · Python" color="cyan" stat={s.get('inventory')} />
      </div>
      <Hop label="Kafka" />
      <Node
        svc="notifications"
        label="Notifications"
        sub="worker"
        color="gray"
        stat={s.get('notifications')}
      />
    </div>
  );
}
