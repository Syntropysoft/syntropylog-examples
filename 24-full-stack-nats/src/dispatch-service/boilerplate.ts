// =================================================================
//  boilerplate.ts - Standard initialization and shutdown for Dispatch Service
//  RESPONSIBILITY: Provide reusable boilerplate for SyntropyLog
// =================================================================

import { syntropyLog } from 'syntropylog';
import { syntropyConfig } from './config.js';

export async function initializeSyntropyLog(): Promise<void> {
  console.log('🚀 Initializing SyntropyLog for Dispatch Service...');
  
  try {
    // ✅ Using configuration from config.ts - simple async/await pattern
    await syntropyLog.init(syntropyConfig);
    console.log('✅ SyntropyLog initialized successfully for Dispatch Service!');
  } catch (error) {
    console.error('❌ SyntropyLog initialization failed:', error);
    throw error;
  }
}

export async function gracefulShutdown(): Promise<void> {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
}

// Signal handlers for graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await gracefulShutdown();
  process.exit(0);
}); 