import { syntropyLog } from 'syntropylog';
import { randomUUID } from 'crypto';

/**
 * Example 28: Testing Patterns
 * 
 * This example demonstrates how to test SyntropyLog applications
 * using declarative testing patterns that focus on behavior, not implementation.
 * 
 * Key concepts:
 * - Testing what the system produces, not how it works internally
 * - Declarative tests that read like specifications
 * - Testing behavior, not external dependencies
 * - Simple, readable test patterns
 */

// Reusable initialization boilerplate
export async function initializeSyntropyLog(serviceName: string = 'test-app') {
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

// Reusable shutdown boilerplate
export async function shutdownSyntropyLog() {
  await syntropyLog.shutdown();
}

// Simple user service that we'll test
export class UserService {
  private logger: any;
  private contextManager: any;
  private syntropyInstance: any;

  constructor(syntropyInstance: any = syntropyLog) {
    this.syntropyInstance = syntropyInstance;
  }

  private getLogger() {
    if (!this.logger) {
      this.logger = this.syntropyInstance.getLogger('user-service');
    }
    return this.logger;
  }

  private getContextManager() {
    if (!this.contextManager) {
      this.contextManager = this.syntropyInstance.getContextManager();
    }
    return this.contextManager;
  }

  async createUser(userData: { name: string; email: string }) {
    return await this.getContextManager().run(async () => {
      const correlationId = randomUUID();
      this.getContextManager().set(this.getContextManager().getCorrelationIdHeaderName(), correlationId);
      
      this.getLogger().info('Creating new user', {
        userData,
        correlationId,
        timestamp: new Date().toISOString()
      });

      // Simulate some processing
      if (!userData.email.includes('@')) {
        throw new Error('Invalid email format');
      }

      const userId = randomUUID();
      
      this.getLogger().info('User created successfully', {
        userId,
        userData,
        correlationId
      });

      return { userId, ...userData };
    });
  }

  async getUserById(userId: string) {
    return await this.getContextManager().run(async () => {
      const correlationId = randomUUID();
      this.getContextManager().set(this.getContextManager().getCorrelationIdHeaderName(), correlationId);
      
      this.getLogger().info('Fetching user by ID', {
        userId,
        correlationId
      });

      // Simulate user not found
      if (userId === 'non-existent') {
        this.getLogger().warn('User not found', {
          userId,
          correlationId
        });
        return null;
      }

      const user = { id: userId, name: 'John Doe', email: 'john@example.com' };
      
      this.getLogger().info('User found', {
        userId,
        correlationId,
        user
      });

      return user;
    });
  }
}

// Main function - demonstrates the service
async function main() {
  try {
    await initializeSyntropyLog('testing-patterns-app');
    
    const userService = new UserService(syntropyLog);
    
    // Demonstrate successful user creation
    await userService.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    // Demonstrate user retrieval
    await userService.getUserById('user-123');
    await userService.getUserById('non-existent');
    
    await shutdownSyntropyLog();
    
    console.log('✅ Testing patterns example completed!');
  } catch (error) {
    console.error('❌ Error in testing patterns example:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
} 