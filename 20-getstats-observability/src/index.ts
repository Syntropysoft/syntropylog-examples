/**
 * Example 20: syntropyLog.getStats() — self-observability
 *
 * A logging framework should be observable itself. `getStats()` returns an
 * aggregated snapshot of the instance, built off the same hooks you can wire:
 *
 *   {
 *     state,                // lifecycle state (READY, ...)
 *     initializedAt,        // epoch ms, or null before init
 *     uptimeMs,
 *     nativeAddonActive,    // is the Rust addon in use?
 *     failures: { log, transport, serializationFallback, masking, step }
 *   }
 *
 * User hooks still fire — getStats() just *also* counts them, so monitoring the
 * logger never gets in the way of your own callbacks.
 */
import { syntropyLog, ConsoleTransport } from 'syntropylog';

// A transport that fails ONLY for entries we deliberately mark with `__fail`.
// (If it failed on everything, the framework's own lifecycle logs would move
// the counters too, muddying the demo.) Everything else is swallowed quietly —
// this example is about the counters, not the log output.
class SelectiveFlakyTransport extends ConsoleTransport {
  public override log(entry: unknown): void {
    const serialized = typeof entry === 'string' ? entry : JSON.stringify(entry);
    if (serialized.includes('__fail')) {
      throw new Error('transport sink unreachable');
    }
  }
}

async function main() {
  await syntropyLog.init({
    logger: {
      serviceName: 'stats-demo',
      level: 'info',
      transports: [new SelectiveFlakyTransport()],
    },
    // Your own hook still runs; getStats() also increments failures.log.
    onLogFailure: (err) =>
      console.log(`  [your onLogFailure] ${(err as Error).message}`),
  });

  console.log('\n── Healthy stats right after init (all failures zero) ──');
  console.dir(syntropyLog.getStats(), { depth: null });

  const log = syntropyLog.getLogger('stats-demo');

  console.log('\n── Emitting 3 logs that the sink rejects ──');
  log.info('audit.event', { __fail: true, n: 1 });
  log.info('audit.event', { __fail: true, n: 2 });
  log.info('audit.event', { __fail: true, n: 3 });

  console.log('\n── Stats after the failures ──');
  const stats = syntropyLog.getStats();
  console.dir(stats, { depth: null });
  console.log(
    `\nfailures.log = ${stats.failures.log} (one per failed log call). ` +
      `\nThe other counters (transport, serializationFallback, masking, step) ` +
      `stay 0 until those specific failure paths fire.`
  );

  await syntropyLog.shutdown();
}

main().catch((err) => {
  console.error('❌ Example failed:', err);
  process.exit(1);
});
