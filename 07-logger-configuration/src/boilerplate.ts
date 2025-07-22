import { SyntropyLog } from 'syntropylog';

// 🎯 Standard SyntropyLog Boilerplate
export const initializeSyntropyLog = async () => {
  const syntropyLog = new SyntropyLog({
    serviceName: 'logger-configuration-demo',
    prettyPrint: { enabled: true },
    serializerTimeoutMs: 100,
  });

  await syntropyLog.initialize();
  return syntropyLog;
};

export const waitForReady = async (syntropyLog: SyntropyLog) => {
  await syntropyLog.waitForReady();
  console.log('🚀 SyntropyLog ready for logger configuration demo');
};

export const gracefulShutdown = async (syntropyLog: SyntropyLog) => {
  console.log('\n🛑 Shutting down gracefully...');
  await syntropyLog.shutdown();
  console.log('✅ Shutdown complete');
  process.exit(0);
};

// 🎯 Graceful shutdown handlers
export const setupGracefulShutdown = (syntropyLog: SyntropyLog) => {
  process.on('SIGINT', () => gracefulShutdown(syntropyLog));
  process.on('SIGTERM', () => gracefulShutdown(syntropyLog));
}; 