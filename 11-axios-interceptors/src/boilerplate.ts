import { syntropyLog } from 'syntropylog';

/**
 * Reusable boilerplate for SyntropyLog initialization and shutdown.
 * Based on Example 00: Setup & Initialization
 */

export async function initializeSyntropyLog(config: any) {
  await syntropyLog.init(config);
}

export async function gracefulShutdown() {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
} 