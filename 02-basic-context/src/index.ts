import { syntropyLog, initializeSyntropyLog, gracefulShutdown } from './boilerplate';

/**
 * Example 02: Basic Context and Correlation
 * 
 * This example demonstrates the fundamental concept of automatic context propagation
 * for tracing operations across function calls.
 * 
 * Key Concepts:
 * - Context propagation across function calls
 * - Correlation IDs for request tracing
 * - Automatic context inheritance
 * - Structured logging with context
 */

// Simple function that logs with context
function processUser(userId: string): void {
  const logger = syntropyLog.getLogger('user-service');
  
  logger.info({ userId }, 'Processing user data');
  
  // Simulate some work
  const userData = { id: userId, name: 'John Doe', email: 'john@example.com' };
  
  logger.info({ userId, userData }, 'User data processed successfully');
}

// Another function that also logs with context
function validateUser(userId: string): boolean {
  const logger = syntropyLog.getLogger('validation-service');
    
  logger.info({ userId }, 'Validating user');
    
  // Simulate validation
  const isValid = userId.startsWith('user-');
  
  if (isValid) {
    logger.info({ userId }, 'User validation passed');
    } else {
    logger.warn({ userId }, 'User validation failed');
    }
    
  return isValid;
  }

// Main function that demonstrates context propagation
async function main(): Promise<void> {
  try {
    // Initialize SyntropyLog
    await initializeSyntropyLog();

    const logger = syntropyLog.getLogger('main');
    const contextManager = syntropyLog.getContextManager();

    logger.info('Starting context propagation example...');

    // Simulate processing multiple users with different correlation IDs
    const users = ['user-001', 'user-002', 'user-003'];

    for (const userId of users) {
      const correlationId = `corr-${userId}-${Date.now()}`;
      
      logger.info({ correlationId, userId }, 'Starting user processing session');

      // Create a new context for each user
      await contextManager.run(async () => {
        // Set correlation ID in context
        contextManager.set('X-Correlation-ID', correlationId);
        
        // Add additional context data
        contextManager.set('sessionId', `session-${Date.now()}`);
        contextManager.set('timestamp', new Date().toISOString());

        // Process user - context is automatically propagated
        processUser(userId);
        
        // Validate user - context is automatically propagated
        const isValid = validateUser(userId);
          
        if (isValid) {
          logger.info({ userId }, 'User processing completed successfully');
        } else {
          logger.warn({ userId }, 'User processing completed with warnings');
        }
      });

      // Small delay between users
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('All users processed. Example completed.');

  } catch (error) {
    console.error('Example error:', error);
  } finally {
    // Always shutdown SyntropyLog
    await gracefulShutdown();
  }
}

// Handle process termination signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

// Run the example
main()
  .then(() => {
    console.log('✅ Example completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }); 