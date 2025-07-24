import { randomUUID } from 'crypto';

/**
 * Simple user service that we'll test
 * This version doesn't import syntropylog directly to avoid Jest/Vitest conflicts
 */
export class UserService {
  private logger: any;
  private contextManager: any;
  private syntropyInstance: any;

  constructor(syntropyInstance: any) {
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

      // Simulate successful user retrieval
      const user = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString()
      };

      this.getLogger().info('User retrieved successfully', {
        userId,
        user,
        correlationId
      });

      return user;
    });
  }
} 