import { syntropyLog, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';

// Initialize SyntropyLog with basic configuration
const initializeSyntropyLog = async () => {
  await syntropyLog.init({
    logger: {
      serviceName: 'error-handling-example',
      level: 'info',
      serializerTimeoutMs: 100,
      transports: [new ClassicConsoleTransport(), new ConsoleTransport()],
    },
    context: {
      correlationIdHeader: 'x-correlation-id-test-06'
    },
  });
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

export { syntropyLog, initializeSyntropyLog, gracefulShutdown };