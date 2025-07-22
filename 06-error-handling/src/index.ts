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
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        field: error instanceof ValidationError ? error.field : undefined
      });
    }

    // Pattern 2: Error handling with context preservation
    console.log('\n🔍 Pattern 2: Error Handling with Context Preservation');
    try {
      await validateUser({}); // This will fail
      logger.info('User validation successful');
    } catch (error) {
      // Log error with full context
      logger.error('User validation failed with context', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        field: error instanceof ValidationError ? error.field : undefined,
        correlationId,
        operation: contextManager.get('operation'),
        userId: contextManager.get('userId')
      });
    }

    // Pattern 3: Error handling in async operations
    console.log('\n⚡ Pattern 3: Error Handling in Async Operations');
    
    const userData = {
      email: 'user@example.com',
      name: 'John Doe'
    };

    try {
      // Step 1: Validation
      logger.info('Starting user registration process', { userId: userData.email });
      await validateUser(userData);
      logger.info('User validation completed');

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
      // Comprehensive error handling
      const errorContext = {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        correlationId,
        operation: contextManager.get('operation'),
        userId: contextManager.get('userId')
      };

      // Add specific context based on error type
      if (error instanceof ValidationError) {
        errorContext.field = error.field;
        logger.error('Validation error during user registration', errorContext);
      } else if (error instanceof DatabaseError) {
        errorContext.operation = error.operation;
        logger.error('Database error during user registration', errorContext);
      } else if (error instanceof ExternalServiceError) {
        errorContext.service = error.service;
        logger.error('External service error during user registration', errorContext);
      } else {
        logger.error('Unknown error during user registration', errorContext);
      }
    }

    // Pattern 4: Error correlation across services
    console.log('\n🔗 Pattern 4: Error Correlation Across Services');
    
    // Simulate a distributed operation
    const distributedOperation = async () => {
      try {
        logger.info('Starting distributed operation');
        
        // Simulate multiple service calls
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('Service A call completed');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('Service B call completed');
        
        // Simulate an error in the middle
        if (Math.random() > 0.5) {
          throw new Error('Service C failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('Service C call completed');
        
        logger.info('Distributed operation completed successfully');
      } catch (error) {
        logger.error('Distributed operation failed', {
          error: error instanceof Error ? error.message : String(error),
          correlationId,
          operation: 'distributed-operation'
        });
        throw error; // Re-throw to demonstrate propagation
      }
    };

    try {
      await distributedOperation();
    } catch (error) {
      logger.error('Error propagated from distributed operation', {
        error: error instanceof Error ? error.message : String(error),
        correlationId,
        operation: contextManager.get('operation')
      });
    }

    console.log('\n📊 Error Handling Pattern Summary:');
    console.log('✅ Simple: Basic try-catch with error logging');
    console.log('✅ Context Preservation: Errors logged with full context');
    console.log('✅ Async Operations: Error handling in complex async flows');
    console.log('✅ Correlation: Errors correlated across distributed services');

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