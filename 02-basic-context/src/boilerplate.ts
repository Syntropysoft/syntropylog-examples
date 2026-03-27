import { syntropyLog, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';

/**
 * Initialize SyntropyLog with basic configuration
 */
export async function initializeSyntropyLog(): Promise<void> {
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

// Export the main instance
export { syntropyLog }; 