import { syntropyLog } from 'syntropylog';

/**
 * Example 00: Setup & Initialization
 *
 * Patrón oficial (README + npm): https://www.npmjs.com/package/syntropylog
 * - Escuchar 'ready' y 'error' antes de init()
 * - Esperar a 'ready' antes de usar getLogger() o cualquier recurso
 *
 * Key concepts:
 * - Event-based initialization (patrón recomendado)
 * - Graceful shutdown
 * - Error handling
 */

async function initializeSyntropyLog() {
  console.log('🚀 Initializing SyntropyLog...');

  return new Promise<void>((resolve, reject) => {
    syntropyLog.on('ready', () => {
      console.log('✅ SyntropyLog initialized successfully!');
      resolve();
    });
    syntropyLog.on('error', (err) => {
      console.error('❌ SyntropyLog initialization failed:', err);
      reject(err);
    });

    syntropyLog.init({
      logger: {
        serviceName: 'my-app',
        level: 'info',
        serializerTimeoutMs: 100,
      },
    });
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
    // 1. Initialize SyntropyLog
    await initializeSyntropyLog();
    
    // 2. Get logger instance
    const logger = syntropyLog.getLogger('main');
    
    // 3. Log that initialization is complete (logger.info devuelve Promise<void>)
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