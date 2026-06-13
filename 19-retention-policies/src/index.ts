/**
 * Example 19: Retention policy registry
 *
 * Audit/compliance logs often need a retention rule attached ("keep 7 years,
 * immutable", "GDPR Article 30", ...). Instead of repeating that object at every
 * call site, declare named policies once and reference them by name:
 *
 *   - `defineRetentionPolicies({...})` — declare the registry (keeps literal types).
 *   - `retentionPolicies` in init() — register them.
 *   - `log.withRetention('NAME')`     — look one up; binds it as `retention` metadata.
 *   - `log.withRetention({...})`      — or pass inline rules (freeform, no registry).
 *   - an unknown name throws `RetentionPolicyNotFoundError`, listing valid names.
 */
import {
  syntropyLog,
  ConsoleTransport,
  defineRetentionPolicies,
  RetentionPolicyNotFoundError,
} from 'syntropylog';

// Declare once. defineRetentionPolicies preserves literal types, so the names
// are autocompletable and typo-checkable elsewhere in your codebase.
const policies = defineRetentionPolicies({
  SOX_AUDIT_TRAIL: { standard: 'SOX', years: 7, immutable: true },
  GDPR_ARTICLE_30: { standard: 'GDPR', basis: 'legitimate-interest', months: 12 },
});

async function main() {
  await syntropyLog.init({
    logger: {
      serviceName: 'ledger',
      level: 'info',
      transports: [new ConsoleTransport()],
    },
    retentionPolicies: policies,
  });

  const log = syntropyLog.getLogger('ledger');

  // 1) Lookup by registered name — the policy is bound as `retention` on the log.
  console.log('\n1) Registered policy by name (see the `retention` field):');
  log.withRetention('SOX_AUDIT_TRAIL').info('ledger.entry.created', {
    entryId: 'TX-1001',
    amount: 4200,
  });

  // 2) Inline rules — no registry, just a freeform object.
  console.log('\n2) Inline rules:');
  log.withRetention({ ttl: 86400, archiveAfter: 3600 }).info('cache.snapshot');

  // 3) Unknown name → RetentionPolicyNotFoundError (lists the registered names).
  console.log('\n3) Unknown policy name throws:');
  try {
    log.withRetention('TYPO_POLICY').info('this never logs');
  } catch (err) {
    if (err instanceof RetentionPolicyNotFoundError) {
      console.log('   caught RetentionPolicyNotFoundError →', err.message);
    } else {
      throw err;
    }
  }

  await syntropyLog.shutdown();
}

main().catch((err) => {
  console.error('❌ Example failed:', err);
  process.exit(1);
});
