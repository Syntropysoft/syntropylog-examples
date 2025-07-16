import { syntropyLog } from 'syntropylog';

/**
 * Example 00: Setup & Initialization
 * 
 * This example demonstrates how to properly initialize SyntropyLog
 * with event handling and graceful shutdown.
 * 
 * Key concepts:
 * - Proper initialization with event handling
 * - Configuration options
 * - Graceful shutdown
 * - Error handling
 */

async function initializeSyntropyLog() {
  console.log('🚀 Initializing SyntropyLog...');
  
  return new Promise<void>((resolve, reject) => {
    // Set up event listeners before initialization
    syntropyLog.on('ready', () => {
      console.log('✅ SyntropyLog initialized successfully!');
      resolve();
    });
    
    syntropyLog.on('error', (err) => {
      console.error('❌ SyntropyLog initialization failed:', err);
      reject(err);
    });

    // Initialize with configuration
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
    
    // 3. Log that initialization is complete
    logger.info('Application startup complete', {
      serviceName: 'my-app',
      version: '1.0.0',
      environment: 'development'
    });
    
    // 4. Simulate some application work
    logger.info('Application is ready to handle requests');
    
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
main(); 