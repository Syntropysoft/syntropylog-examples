// =================================================================
//  boilerplate.ts - SyntropyLog Initialization and Shutdown
//  RESPONSIBILITY: Handle SyntropyLog lifecycle management
// =================================================================

import { syntropyLog } from 'syntropylog';
import { syntropyConfig } from './config.js';

export async function initializeSyntropyLog(): Promise<void> {
  console.log('🚀 Initializing SyntropyLog for Kafka Full-Stack Example...');
  
  try {
    await syntropyLog.init(syntropyConfig);
    console.log('✅ SyntropyLog initialized successfully for Kafka Full-Stack Example!');
  } catch (error) {
    console.error('❌ Failed to initialize SyntropyLog:', error);
    throw error;
  }
}

export async function shutdownSyntropyLog(): Promise<void> {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (error) {
    console.error('❌ Error during SyntropyLog shutdown:', error);
    throw error;
  }
} 