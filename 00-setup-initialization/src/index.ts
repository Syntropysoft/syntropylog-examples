import { syntropyLog } from 'syntropylog';

/**
 * Example 00: Setup & Initialization
 *
 * Key concepts:
 * - Direct await init: no event wrappers needed
 * - Graceful shutdown
 * - Error handling
 */

async function initializeSyntropyLog() {
  await syntropyLog.init({
    logger: {
      serviceName: 'my-app',
      level: 'info',
      serializerTimeoutMs: 100,
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
    // 1. Inicialización: la promesa debe resolverse antes de cualquier log
    await initializeSyntropyLog();

    if (syntropyLog.isNativeAddonInUse()) {
      console.log('⚡ Native Rust addon active');
    } else {
      console.log('ℹ️  Native addon not active — JS pipeline in use');
      console.log('   → Requires Node ≥ 20, supported platform (Linux/macOS/Windows x64/arm64)');
      console.log('   → To force JS mode intentionally: set SYNTROPYLOG_NATIVE_DISABLE=1');
    }

    // 2. A partir de aquí ya se puede usar getLogger() e imprimir logs
    const logger = syntropyLog.getLogger('main');

    // 3. Log que la inicialización terminó
    await logger.info('Application startup complete', {
      serviceName: 'my-app',
      version: '1.0.0',
      environment: 'development'
    });

    // 4. Simulate some application work
    await logger.info('Application is ready to handle requests');

    // 5. Graceful shutdown
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