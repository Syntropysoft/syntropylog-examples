import { syntropyLog } from 'syntropylog';

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
 */

// Reusable initialization boilerplate (same for all examples)
async function initializeSyntropyLog(serviceName: string = 'my-app') {
  await syntropyLog.init({
    logger: {
      serviceName,
      level: 'info',
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

  // 1. Basic logging at different levels
  logger.info('Hello World from SyntropyLog!');
  logger.warn('This is a warning message.');
  logger.error('This is an error message.');

  // 2. Structured logging with metadata
  // This is useful for adding context to your logs
  logger.info('User logged in successfully', {
    userId: 'user-123',
    tenantId: 'tenant-abc',
    timestamp: new Date().toISOString()
  });

  // 3. Logging with different data types
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

  // 4. Error logging with context
  try {
    // Simulate an error
    throw new Error('Something went wrong');
  } catch (err) {
    logger.error('An error occurred during processing', {
      error: err.message,
      stack: err.stack,
      context: 'user-authentication'
    });
  }

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