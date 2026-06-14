import { syntropyLog, MaskingStrategy } from 'syntropylog';

/**
 * Example 00: Setup & Initialization (+ automatic PII masking)
 *
 * Key concepts:
 * - Direct await init: no event wrappers needed
 * - Masking works out of the box: log an object with sensitive fields and they
 *   come out redacted — BEFORE any transport sees them.
 * - The SAME masking runs in the native Rust engine (default) and the JS fallback:
 *   one declarative rule set, asserted byte-for-byte equal by a shared parity test.
 *   So the output below is identical no matter which engine is active.
 * - Graceful shutdown & error handling
 */

async function initializeSyntropyLog() {
  await syntropyLog.init({
    logger: {
      serviceName: 'my-app',
      level: 'info',
      serializerTimeoutMs: 100,
    },
    masking: {
      // Default rules are ON by default (email, phone, credit_card, ssn, password,
      // token + secret families). Shown here explicitly for clarity.
      enableDefaultRules: true,
      rules: [
        // A custom mask declared as DATA (a `spec`) — it crosses into the native
        // engine, so it runs at native speed and stays consistent with the JS path.
        // Argentine CUIT/CUIL: keep the last 4 digits, mask the rest.
        {
          pattern: /cuit|cuil/i,
          strategy: MaskingStrategy.CUSTOM,
          spec: { scope: 'digits', unmaskEnd: 4 },
        },
      ],
    },
  });
}

async function gracefulShutdown() {
  console.log('🔄 Shutting down SyntropyLog gracefully...');

  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
}

async function main() {
  try {
    // 1. Initialization: the promise must resolve before any log call.
    await initializeSyntropyLog();

    if (syntropyLog.isNativeAddonInUse()) {
      console.log('⚡ Native Rust addon active — masking runs in Rust');
    } else {
      console.log('ℹ️  Native addon not active — JS pipeline in use (same masked output)');
      console.log('   → Requires Node ≥ 20, supported platform (Linux/macOS/Windows x64/arm64)');
    }

    // 2. From here on, getLogger() is usable.
    const logger = syntropyLog.getLogger('main');

    // Metadata goes FIRST (object), message second. Only the metadata object is
    // masked & structured; anything after the message is util.format-inlined into it.
    await logger.info(
      { serviceName: 'my-app', version: '1.0.0', environment: 'development' },
      'Application startup complete'
    );

    // 3. The point of this example: PII masking with zero extra code at the call site.
    //    Pass the object first and watch the sensitive fields come out redacted.
    console.log('\n— Logging an object with sensitive fields —');
    await logger.info(
      {
        userId: 123,                       // not sensitive → kept as-is
        email: 'john.doe@example.com',     // identifier → j*******@example.com
        phone: '+1 415 555 1234',          // identifier → masked, last 4 kept
        creditCard: '4111-1111-1111-1234', // identifier → ****-****-****-1234
        ssn: '123-45-6789',                // identifier → ***-**-6789
        password: 'hunter2',               // credential → [REDACTED]
        apiToken: 'sk_live_abcdef123456',  // credential → [REDACTED]
        cuit: '20-30405060-7',             // custom rule → **-*****060-7
      },
      'User signed up'
    );
    console.log(
      '↑ identifiers keep their last digits (debuggable); credentials are fully [REDACTED].'
    );

    // 4. Graceful shutdown
    await gracefulShutdown();
  } catch (err) {
    console.error('❌ Application startup failed:', err);
    process.exit(1);
  }
}

// Handle process termination signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

// Run the application
main()
  .then(() => {
    console.log('✅ Example completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  });
