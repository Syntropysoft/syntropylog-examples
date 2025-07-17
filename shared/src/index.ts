import { syntropyLog, CompactConsoleTransport } from 'syntropylog';

// Boilerplate: Initialize and shutdown functions
export async function initializeSyntropyLog() {
  try {
    await syntropyLog.init({
      logger: {
        level: 'info',
        serviceName: 'ecommerce-app',
        transports: [new CompactConsoleTransport()],
        serializerTimeoutMs: 50
      },
      context: {
        correlationIdHeader: 'X-Correlation-ID'
      }
    });
    console.log('✅ SyntropyLog initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize SyntropyLog:', error);
    throw error;
  }
}

export async function shutdownSyntropyLog() {
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (error) {
    console.error('❌ Error during SyntropyLog shutdown:', error);
  }
}

// Handle graceful shutdown
export function setupGracefulShutdown() {
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await shutdownSyntropyLog();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await shutdownSyntropyLog();
    process.exit(0);
  });
}

// Re-export syntropyLog for convenience
export { syntropyLog }; 