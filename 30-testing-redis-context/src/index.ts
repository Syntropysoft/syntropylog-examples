import { syntropyLog } from 'syntropylog';
import { randomUUID } from 'crypto';

/**
 * Example 30: Testing Redis Context Patterns
 * 
 * This example demonstrates how to test SyntropyLog applications
 * that use Redis for context management and correlation.
 * 
 * Key concepts:
 * - Testing context persistence across operations
 * - Testing correlation ID propagation
 * - Testing context isolation between requests
 * - Declarative testing of Redis context behavior
 */

// Reusable initialization boilerplate with Redis Mock
export async function initializeSyntropyLog(serviceName: string = 'redis-test-app') {
  await syntropyLog.init({
    logger: {
      serviceName,
      level: 'info',
      serializerTimeoutMs: 50,
    },
    redis: {
      instances: [
        {
          name: 'default',
          // SyntropyLog automatically uses BeaconRedisMock for testing
          // No need to configure host/port - it's all in-memory
        }
      ]
    },
    context: {
      correlationIdHeader: 'x-correlation-id',
      transactionIdHeader: 'x-transaction-id',
    },
  });
}

// Reusable shutdown boilerplate
export async function shutdownSyntropyLog() {
  await syntropyLog.shutdown();
}

// Service that uses Redis context for session management
export class SessionService {
  private logger: any;
  private contextManager: any;

  constructor() {
    // Initialize after SyntropyLog is ready
  }

  private getLogger() {
    if (!this.logger) {
      this.logger = syntropyLog.getLogger('session-service');
    }
    return this.logger;
  }

  private getContextManager() {
    if (!this.contextManager) {
      this.contextManager = syntropyLog.getContextManager();
    }
    return this.contextManager;
  }

  async createSession(userId: string, sessionData: any) {
    let result: any = null;
    
    await this.getContextManager().run(async () => {
      const correlationId = randomUUID();
      const transactionId = randomUUID();
      
      this.getContextManager().set(this.getContextManager().getCorrelationIdHeaderName(), correlationId);
      this.getContextManager().set(this.getContextManager().getTransactionIdHeaderName(), transactionId);
      
      this.getLogger().info('Creating user session', {
        userId,
        sessionData,
        correlationId,
        transactionId
      });

      // Simulate session creation
      const sessionId = randomUUID();
      
      this.getLogger().info('Session created successfully', {
        sessionId,
        userId,
        correlationId,
        transactionId
      });

      result = { sessionId, userId, correlationId, transactionId };
    });

    return result;
  }

  async getSession(sessionId: string) {
    let result: any = null;
    
    await this.getContextManager().run(async () => {
      const correlationId = randomUUID();
      const transactionId = randomUUID();
      
      this.getContextManager().set(this.getContextManager().getCorrelationIdHeaderName(), correlationId);
      this.getContextManager().set(this.getContextManager().getTransactionIdHeaderName(), transactionId);
      
      this.getLogger().info('Fetching session', {
        sessionId,
        correlationId,
        transactionId
      });

      // Simulate session not found
      if (sessionId === 'non-existent') {
        this.getLogger().warn('Session not found', {
          sessionId,
          correlationId,
          transactionId
        });
        result = null;
        return;
      }

      this.getLogger().info('Session found', {
        sessionId,
        correlationId,
        transactionId,
        session: { id: sessionId, userId: 'user-123', data: { role: 'admin' } }
      });

      result = { id: sessionId, userId: 'user-123', data: { role: 'admin' } };
    });

    return result;
  }

  async updateSession(sessionId: string, updates: any) {
    let result: any = null;
    
    await this.getContextManager().run(async () => {
      const correlationId = randomUUID();
      const transactionId = randomUUID();
      
      this.getContextManager().set(this.getContextManager().getCorrelationIdHeaderName(), correlationId);
      this.getContextManager().set(this.getContextManager().getTransactionIdHeaderName(), transactionId);
      
      this.getLogger().info('Updating session', {
        sessionId,
        updates,
        correlationId,
        transactionId
      });

      // Simulate validation error
      if (updates.role === 'invalid-role') {
        throw new Error('Invalid role specified');
      }

      this.getLogger().info('Session updated successfully', {
        sessionId,
        correlationId,
        transactionId
      });

      result = { sessionId, updated: true, correlationId, transactionId };
    });

    return result;
  }

  async deleteSession(sessionId: string) {
    let result: any = null;
    
    await this.getContextManager().run(async () => {
      const correlationId = randomUUID();
      const transactionId = randomUUID();
      
      this.getContextManager().set(this.getContextManager().getCorrelationIdHeaderName(), correlationId);
      this.getContextManager().set(this.getContextManager().getTransactionIdHeaderName(), transactionId);
      
      this.getLogger().info('Deleting session', {
        sessionId,
        correlationId,
        transactionId
      });

      // Simulate session not found
      if (sessionId === 'non-existent') {
        this.getLogger().warn('Session not found for deletion', {
          sessionId,
          correlationId,
          transactionId
        });
        result = { deleted: false, reason: 'not_found' };
        return;
      }

      this.getLogger().info('Session deleted successfully', {
        sessionId,
        correlationId,
        transactionId
      });

      result = { deleted: true, sessionId };
    });

    return result;
  }
}

// Main function - demonstrates the service
async function main() {
  try {
    await initializeSyntropyLog('redis-context-test-app');
    
    const sessionService = new SessionService();
    
    // Demonstrate session operations
    await sessionService.createSession('user-123', { role: 'admin' });
    await sessionService.getSession('session-123');
    await sessionService.updateSession('session-123', { role: 'user' });
    await sessionService.deleteSession('session-123');
    
    // Demonstrate error cases
    await sessionService.getSession('non-existent');
    await sessionService.updateSession('session-123', { role: 'invalid-role' }).catch(() => {});
    await sessionService.deleteSession('non-existent');
    
    await shutdownSyntropyLog();
    
    console.log('✅ Redis context testing example completed!');
  } catch (error) {
    console.error('❌ Error in Redis context testing example:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
} 