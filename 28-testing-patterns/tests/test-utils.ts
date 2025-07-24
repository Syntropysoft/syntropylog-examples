import { syntropyLog } from 'syntropylog';

/**
 * Test utilities for SyntropyLog testing patterns
 * 
 * This file contains reusable testing helpers that handle:
 * - SyntropyLog initialization
 * - SyntropyLog shutdown
 * - Common test setup and teardown
 */

export interface TestConfig {
  serviceName?: string;
  logLevel?: string;
  serializerTimeoutMs?: number;
  redis?: boolean;
  brokers?: boolean;
  http?: boolean;
}

/**
 * Initialize SyntropyLog for testing with default configuration
 */
export async function initSyntropyForTesting(config: TestConfig = {}) {
  const {
    serviceName = 'test-app',
    logLevel = 'info',
    serializerTimeoutMs = 50,
    redis = false,
    brokers = false,
    http = false
  } = config;

  const syntropyConfig: any = {
    logger: {
      serviceName,
      level: logLevel,
      serializerTimeoutMs,
    },
    context: {
      correlationIdHeader: 'x-correlation-id-test',
    },
  };

  // Add Redis if requested
  if (redis) {
    syntropyConfig.redis = {
      instances: [
        {
          name: 'default',
          // BeaconRedisMock handles everything in-memory
        }
      ]
    };
  }

  // Add brokers if requested
  if (brokers) {
    syntropyConfig.brokers = {
      instances: []
    };
  }

  // Add HTTP if requested
  if (http) {
    syntropyConfig.http = {
      instances: []
    };
  }

  await syntropyLog.init(syntropyConfig);
}

/**
 * Shutdown SyntropyLog after testing
 */
export async function shutdownSyntropyForTesting() {
  await syntropyLog.shutdown();
}

/**
 * Create a test wrapper that handles initialization and shutdown
 */
export function createSyntropyTest(config: TestConfig = {}) {
  return {
    beforeEach: async () => {
      await initSyntropyForTesting(config);
    },
    afterEach: async () => {
      await shutdownSyntropyForTesting();
    }
  };
}

/**
 * Get SyntropyLog instances for testing
 */
export function getSyntropyInstances() {
  return {
    logger: syntropyLog.getLogger('test-service'),
    contextManager: syntropyLog.getContextManager(),
  };
} 