import { syntropyLog, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';

/**
 * Initialize SyntropyLog with basic configuration
 */
export async function initializeSyntropyLog(): Promise<void> {
  console.log('🚀 Initializing SyntropyLog...');
  
  await syntropyLog.init({
    logger: {
      level: 'info',
      serializerTimeoutMs: 100,
      transports: [new ClassicConsoleTransport(), new ConsoleTransport()]
    },
    context: {
      correlationIdHeader: 'X-Correlation-ID'
    }
  });

  console.log('✅ SyntropyLog initialized successfully!');
}

/**
 * Graceful shutdown of SyntropyLog
 */
export async function gracefulShutdown(): Promise<void> {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
}

/**
 * Wait for SyntropyLog to be ready
 */
export async function waitForReady(): Promise<void> {
  return new Promise((resolve) => {
    if (syntropyLog.getState() === 'READY') {
      resolve();
    } else {
      syntropyLog.once('ready', resolve);
    }
  });
}

// Export the main instance
export { syntropyLog }; 