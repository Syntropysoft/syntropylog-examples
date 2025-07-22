import { syntropyLog } from 'syntropylog';
import { config } from './config';

// Initialize SyntropyLog with configuration from file
const initializeSyntropyLog = async () => {
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

    // Initialize with configuration from file
    syntropyLog.init(config);
  });
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
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
