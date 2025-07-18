import { syntropyLog, SyntropyLogConfig } from 'syntropylog';

/**
 * Boilerplate for SyntropyLog initialization and shutdown
 * 
 * This reusable boilerplate provides:
 * - Standardized initialization with error handling
 * - Graceful shutdown with proper cleanup
 * - Consistent configuration patterns
 * 
 * Based on Example 00: Setup and Initialization
 */

export interface BoilerplateConfig {
  logger?: {
    serviceName?: string;
    level?: string;
    transports?: any[];
    serializerTimeoutMs?: number;
  };
  context?: {
    correlationIdHeader?: string;
    transactionIdHeader?: string;
  };
  http?: {
    instances?: Array<{
      instanceName: string;
      adapter: any;
    }>;
  };
}

/**
 * Initialize SyntropyLog with the provided configuration
 * 
 * @param config - Configuration for SyntropyLog initialization
 * @returns Promise<void> - Resolves when initialization is complete
 */
export async function initializeSyntropyLog(config: BoilerplateConfig = {}): Promise<void> {
  try {
    console.log('🚀 Initializing SyntropyLog...');
    
    const defaultConfig: SyntropyLogConfig = {
      logger: {
        serviceName: config.logger?.serviceName || 'custom-adapter-example',
        level: config.logger?.level || 'info',
        transports: config.logger?.transports || [],
        serializerTimeoutMs: config.logger?.serializerTimeoutMs || 100,
      },
      context: {
        correlationIdHeader: config.context?.correlationIdHeader || 'X-Correlation-ID',
        transactionIdHeader: config.context?.transactionIdHeader || 'X-Transaction-ID',
      },
      http: {
        instances: config.http?.instances || [],
      },
    };

    await syntropyLog.initialize(defaultConfig);
    console.log('✅ SyntropyLog initialized successfully!');
    
  } catch (error) {
    console.error('❌ Failed to initialize SyntropyLog:', error);
    throw error;
  }
}

/**
 * Gracefully shutdown SyntropyLog
 * 
 * @returns Promise<void> - Resolves when shutdown is complete
 */
export async function gracefulShutdown(): Promise<void> {
  try {
    console.log('🔄 Shutting down SyntropyLog gracefully...');
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (error) {
    console.error('❌ Error during SyntropyLog shutdown:', error);
    throw error;
  }
} 