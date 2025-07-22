import { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady } from './boilerplate';

// Simulate different types of errors
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class ExternalServiceError extends Error {
  constructor(message: string, public service: string) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

// Simulate business operations
async function validateUser(userData: any): Promise<void> {
  if (!userData.email) {
    throw new ValidationError('Email is required', 'email');
  }
  if (!userData.name) {
    throw new ValidationError('Name is required', 'name');
  }
}

async function saveUserToDatabase(userData: any): Promise<void> {
  // Simulate database operation
  if (Math.random() > 0.7) {
    throw new DatabaseError('Connection timeout', 'insert');
  }
}

async function callExternalService(userData: any): Promise<void> {
  // Simulate external service call
  if (Math.random() > 0.8) {
    throw new ExternalServiceError('Service unavailable', 'email-service');
  }
}

async function demonstrateErrorHandling() {
  console.log('🎯 Example 06: Error Handling with Correlation\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();

  // Wait for SyntropyLog to be ready before proceeding
  await waitForReady();

  const logger = syntropyLog.getLogger();
  const contextManager = syntropyLog.getContextManager();

  await contextManager.run(async () => {
    // Set correlation context
    const correlationId = contextManager.getCorrelationId();
    contextManager.set('operation', 'user-registration');
    contextManager.set('userId', 'new-user-123');

    console.log('🔗 Correlation ID:', correlationId);
    console.log('📊 Demonstrating error handling patterns:\n');

    // Pattern 1: Simple error handling
    console.log('🛡️ Pattern 1: Simple Error Handling');
    try {
      await validateUser({ email: 'test@example.com' });
      logger.info('User validation successful');
    } catch (error) {
      logger.error('User validation failed', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      });
    }

    // Pattern 2: Error handling with context preservation
    console.log('\n🔍 Pattern 2: Error Handling with Context Preservation');
    try {
      await validateUser({}); // This will fail
      logger.info('User validation successful');
    } catch (error) {
      logger.error('User validation failed with context', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        correlationId: correlationId
      });
    }

    // Pattern 3: Error handling in async operations
    console.log('\n⚡ Pattern 3: Error Handling in Async Operations');
    try {
      const userData = { email: 'user@example.com', name: 'John Doe' };
      
      // Step 1: Validation
      logger.info('Validating user data');
      await validateUser(userData);
      logger.info('User validation successful');

      // Step 2: Database operation
      logger.info('Saving user to database');
      await saveUserToDatabase(userData);
      logger.info('User saved to database');

      // Step 3: External service call
      logger.info('Calling external service');
      await callExternalService(userData);
      logger.info('External service call completed');

      logger.info('User registration completed successfully');
    } catch (error) {
      // Simple error handling
      logger.error('User registration failed', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        correlationId: correlationId
      });
    }

    // Pattern 4: HTTP Error Handling with Graceful Degradation
    console.log('\n🌐 Pattern 4: HTTP Error Handling with Graceful Degradation');
    
    // Simulate HTTP client that fails but app continues
    const simulateHttpError = async () => {
      try {
        logger.info('Making HTTP request to external API');
        
        // Simulate HTTP request that fails
        if (Math.random() > 0.3) {
          throw new Error('HTTP 500: External service unavailable');
        }
        
        logger.info('HTTP request successful');
        return { data: 'fresh-data' };
      } catch (error) {
        logger.error('HTTP request failed, using fallback', {
          error: error instanceof Error ? error.message : String(error),
          fallback: 'cached-data',
          correlationId: correlationId
        });
        
        // App continues with cached data
        return { data: 'cached-data' };
      }
    };

    const result = await simulateHttpError();
    logger.info('Operation completed with data', {
      dataSource: result.data,
      correlationId: correlationId
    });

    console.log('\n📊 Error Handling Pattern Summary:');
    console.log('✅ Simple: Basic try-catch with error logging');
    console.log('✅ Context Preservation: Errors logged with correlation ID');
    console.log('✅ Async Operations: Error handling in complex async flows');
    console.log('✅ HTTP Errors: Graceful degradation when HTTP fails');

    console.log('\n✅ Error handling demonstration completed!');
  });
  
  // Exit gracefully after demonstration
  console.log('\n🎉 Example completed successfully! Exiting...');
  await gracefulShutdown('COMPLETION');
}

// Run the demonstration
demonstrateErrorHandling().catch((error) => {
  console.error('❌ Error in demonstration:', error);
  process.exit(1);
}); 