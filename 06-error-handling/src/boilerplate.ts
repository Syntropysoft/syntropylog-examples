import { syntropyLog, ClassicConsoleTransport } from 'syntropylog';
import { ContextHeaders } from '../../../../dist/types/internal-types';

// Initialize SyntropyLog with basic configuration
const initializeSyntropyLog = async () => {
  await syntropyLog.init({
    logger: {
      serviceName: 'error-handling-example',
      level: 'info',
      serializerTimeoutMs: 100,
      transports: [new ClassicConsoleTransport()],
    },
    context: {
      correlationIdHeader: 'x-correlation-id-test-06'
    },
  });
};

// Wait for SyntropyLog to be ready
const waitForReady = async (maxWaitMs: number = 5000): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const state = syntropyLog.getState();
    if (state === 'READY') {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error(`SyntropyLog did not reach READY state within ${maxWaitMs}ms`);
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close any open connections or cleanup
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady }; 