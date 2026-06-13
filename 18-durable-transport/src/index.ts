/**
 * Example 18: DurableAdapterTransport — guaranteed delivery for audit logs
 *
 * Pino/Winston are fire-and-forget: if the sink is down, the log is gone.
 * For compliance (you legally must not lose an audit entry) that's not enough.
 * DurableAdapterTransport adds, on top of any executor:
 *   - an in-memory buffer (bounded, K8s-safe)
 *   - exponential-backoff retry
 *   - a dead-letter hook (onDrop) for whatever truly can't be delivered
 *
 * It's selective by default (`durableOnlyForRetention: true`): only entries
 * tagged with retention metadata take the durable path, so ordinary info/warn
 * logs keep their cheap fire-and-forget semantics.
 */
import { setTimeout as sleep } from 'node:timers/promises';
import { syntropyLog, DurableAdapterTransport } from 'syntropylog';
import type { DurableDropReason } from 'syntropylog';

// A fake "audit sink" (in real life: a DB, an OTel collector, an HTTP endpoint).
// It only simulates our two audit scenarios; any other entry (framework
// lifecycle logs, etc.) is accepted silently so it doesn't clutter the demo.
// Deterministic per scenario: 'DOWN' always fails; 'RECOVER' succeeds on try #3.
const attempts = new Map<string, number>();

const auditSink = async (entry: unknown): Promise<void> => {
  const serialized = typeof entry === 'string' ? entry : JSON.stringify(entry);
  if (!serialized.includes('AUDIT')) return; // not one of our audit entries

  const isDown = serialized.includes('DOWN');
  const key = isDown ? 'down' : 'recover';
  const n = (attempts.get(key) ?? 0) + 1;
  attempts.set(key, n);

  const ok = !isDown && n >= 3; // recover: fail, fail, succeed
  console.log(`  [sink] ${key} attempt #${n} → ${ok ? 'OK ✅' : 'fail ✗'}`);
  if (!ok) {
    throw new Error(isDown ? 'audit sink permanently down' : 'audit sink temporarily down');
  }
};

// Dead-letter queue. In production you persist this somewhere durable
// (a file, a backup table). A no-op onDrop defeats the purpose of the transport.
const deadLetters: Array<{ entry: unknown; reason: DurableDropReason }> = [];

const durable = new DurableAdapterTransport({
  name: 'audit',
  executor: auditSink,
  maxRetries: 4, // up to 5 total attempts per entry
  initialBackoffMs: 20, // tiny so the demo runs fast (doubles each retry)
  maxBackoffMs: 80,
  bufferSize: 100,
  onDrop: (entry, reason, cause) => {
    deadLetters.push({ entry, reason });
    const why = cause instanceof Error ? `: ${cause.message}` : '';
    console.log(`  [DLQ] entry dropped (${reason})${why}`);
  },
});

// `flush()` drains the buffer (in 1.0 it also waits for in-flight retries). The
// short settle keeps the demo deterministic on any version.
async function settle() {
  await durable.flush();
  await sleep(500);
}

async function main() {
  await syntropyLog.init({
    logger: { serviceName: 'audit-service', level: 'info', transports: [durable] },
  });

  const log = syntropyLog.getLogger('audit');

  // --- 1) Audit event whose sink recovers after a couple of retries ---
  console.log('\n1) Audit event — sink fails twice, then recovers (no data lost):');
  log.withRetention({ policy: 'AUDIT', mode: 'RECOVER' }).info('user.login', { userId: 42 });
  await settle();

  // --- 2) Audit event whose sink is permanently down → DLQ ---
  console.log('\n2) Audit event — sink stays down, exhausts retries → DLQ:');
  log.withRetention({ policy: 'AUDIT', mode: 'DOWN' }).info('user.delete', { userId: 42 });
  await settle();

  console.log(`\nDead letters captured: ${deadLetters.length}`);
  await syntropyLog.shutdown();
}

main().catch((err) => {
  console.error('❌ Example failed:', err);
  process.exit(1);
});
