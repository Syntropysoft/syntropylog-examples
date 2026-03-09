import { syntropyLog } from 'syntropylog';

/**
 * Test utilities for SyntropyLog Redis context testing
 * 
 * This file contains reusable testing helpers that handle:
 * - SyntropyLog initialization with Redis
 * - SyntropyLog shutdown
 * - Common test setup and teardown
 */

export interface RedisTestConfig {
  serviceName?: string;
  logLevel?: string;
  serializerTimeoutMs?: number;
}

/**
 * Initialize SyntropyLog with Redis for testing
 */
export async function initSyntropyWithRedis(config: RedisTestConfig = {}) {
  const {
    serviceName = 'redis-test-app',
    logLevel = 'info',
    serializerTimeoutMs = 50,
  } = config;

  await syntropyLog.init({
    logger: {
      serviceName,
      level: logLevel,
      serializerTimeoutMs,
    },
    redis: {
      instances: [
        {
          mode: 'single',
          instanceName: 'default',
          url: process.env.REDIS_URL ?? 'redis://localhost:6379',
        }
      ]
    },
    context: {
      correlationIdHeader: 'x-correlation-id',
      transactionIdHeader: 'x-transaction-id',
    },
  });
}

/**
 * Shutdown SyntropyLog after testing
 */
export async function shutdownSyntropyForTesting() {
  await syntropyLog.shutdown();
}

/**
 * Create a test wrapper that handles Redis initialization and shutdown
 */
export function createRedisTest(config: RedisTestConfig = {}) {
  return {
    beforeEach: async () => {
      await initSyntropyWithRedis(config);
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