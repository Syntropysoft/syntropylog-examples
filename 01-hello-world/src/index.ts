import { syntropyLog } from 'syntropylog';
import { randomUUID } from 'crypto';

/**
 * Example 01: Hello World - Basic Logging
 * 
 * This example demonstrates basic logging with SyntropyLog.
 * Initialization is separated as reusable boilerplate.
 * 
 * Key concepts:
 * - Getting a logger instance
 * - Basic log levels (info, warn, error)
 * - Structured logging with metadata
 * - Context management and correlation IDs
 */

// Reusable initialization boilerplate (same for all examples)
async function initializeSyntropyLog(serviceName: string = 'my-app') {
  await syntropyLog.init({
    logger: {
      serviceName,
      level: 'info',
      serializerTimeoutMs: 50,
    },
    context: {
      correlationIdHeader: 'x-correlation-id-test',
    },
  });
}

// Reusable shutdown boilerplate (same for all examples)
async function shutdownSyntropyLog() {
  await syntropyLog.shutdown();
}

// Main logging logic - this is what changes between examples
async function demonstrateLogging() {
  // Get a logger instance
  const logger = syntropyLog.getLogger('hello-world');
  const contextManager = syntropyLog.getContextManager();

  // 1. Basic logging WITHOUT context - no correlationId
  logger.info('Hello World from SyntropyLog! (no context)');
  logger.warn('This is a warning message. (no context)');
  logger.error('This is an error message. (no context)');

  // 2. Logging WITH context - correlationId will appear
  await contextManager.run(async () => {
    // Set correlation ID for this context
    const correlationId = randomUUID();
    contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
    
    logger.info('Hello World from SyntropyLog! (with context)');
    logger.warn('This is a warning message. (with context)');
    logger.error('This is an error message. (with context)');

    // 3. Structured logging with metadata
    // This is useful for adding context to your logs
    logger.info('User logged in successfully', {
      userId: 'user-123',
      tenantId: 'tenant-abc',
      timestamp: new Date().toISOString()
    });

    // 4. Logging with different data types
    logger.info('Processing user data', {
      user: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com'
      },
      actions: ['login', 'profile_update'],
      metadata: {
        source: 'web',
        version: '1.0.0'
      }
    });

    // 5. Error logging with context
    try {
      // Simulate an error
      throw new Error('Something went wrong');
    } catch (err) {
      logger.error('An error occurred during processing', {
        error: err instanceof Error ? err.message : String(err),
        context: 'user-authentication'
      });
    }
  });

  // 6. Logging outside context again - no correlationId
  logger.info('Back outside context - no correlationId');

  console.log('✅ Hello World example completed!');
}

// Main function - orchestrates initialization, logging, and shutdown
async function main() {
  try {
    // 1. Initialize (boilerplate)
    await initializeSyntropyLog('hello-world-app');
    
    // 2. Demonstrate logging (the actual example logic)
    await demonstrateLogging();
    
    // 3. Shutdown (boilerplate)
    await shutdownSyntropyLog();
    
  } catch (error) {
    console.error('❌ Error in Hello World example:', error);
    process.exit(1);
  }
}

// Run the example
main(); 