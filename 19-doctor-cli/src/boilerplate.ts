// =================================================================
//  boilerplate.ts - SyntropyLog initialization and shutdown
//  RESPONSIBILITY: Handle SyntropyLog lifecycle for the example
// =================================================================

import { syntropyLog } from 'syntropylog';

/**
 * Initialize SyntropyLog with basic configuration for the Doctor CLI example
 */
export async function initializeSyntropyLog(): Promise<void> {
  console.log('🚀 Initializing SyntropyLog...');

  await syntropyLog.init({
    logger: {
      serviceName: 'doctor-cli-example',
      level: 'info',
      serializerTimeoutMs: 5000,
    },
    context: {
      correlationIdHeader: 'X-Correlation-ID',
    },
  });

  console.log('✅ SyntropyLog initialized successfully!');
}

/**
 * Graceful shutdown of SyntropyLog
 */
export async function gracefulShutdown(): Promise<void> {
  console.log('🛑 Shutting down SyntropyLog...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
} 