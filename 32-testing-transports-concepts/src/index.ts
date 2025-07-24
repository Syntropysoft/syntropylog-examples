/**
 * Example 32: Testing Transports Concepts
 * 
 * This example demonstrates the CONCEPTUAL understanding of transports:
 * - Transports are essentially SPIES that capture log entries
 * - They don't need complex mocks, just spy functions
 * - How to test them with framework agnostic patterns
 * - How to combine all testing patterns together
 * 
 * Key concepts:
 * - Transports = Spies for log entries
 * - Framework agnostic testing
 * - Boilerplate testing
 * - Declarative testing patterns
 */

import { syntropyLog } from 'syntropylog';

// Reusable initialization boilerplate
export async function initializeSyntropyLog(serviceName: string = 'transports-concepts-app') {
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

// Simple service that demonstrates transport concepts
export class NotificationService {
  private logger: any;
  private contextManager: any;
  private syntropyInstance: any;

  constructor(syntropyInstance: any = syntropyLog) {
    this.syntropyInstance = syntropyInstance;
  }

  private getLogger() {
    if (!this.logger) {
      this.logger = this.syntropyInstance.getLogger('notification-service');
    }
    return this.logger;
  }

  private getContextManager() {
    if (!this.contextManager) {
      this.contextManager = this.syntropyInstance.getContextManager();
    }
    return this.contextManager;
  }

  async sendNotification(userId: string, message: string, type: 'email' | 'sms' | 'push') {
    return await this.getContextManager().run(async () => {
      // Log the notification attempt
      this.getLogger().info('Sending notification', {
        userId,
        message,
        type,
        timestamp: new Date().toISOString()
      });

      // Simulate some validation
      if (!userId || !message) {
        this.getLogger().error('Invalid notification data', {
          userId,
          message,
          type
        });
        throw new Error('Invalid notification data');
      }

      // Simulate sending
      const notificationId = `notif-${Date.now()}`;
      
      this.getLogger().info('Notification sent successfully', {
        notificationId,
        userId,
        type
      });

      return { notificationId, userId, message, type };
    });
  }

  async getNotificationHistory(userId: string) {
    return await this.getContextManager().run(async () => {
      this.getLogger().info('Fetching notification history', {
        userId
      });

      // Simulate empty history
      if (userId === 'new-user') {
        this.getLogger().warn('No notification history found', {
          userId
        });
        return [];
      }

      const history = [
        { id: 'notif-1', message: 'Welcome!', type: 'email' },
        { id: 'notif-2', message: 'Reminder', type: 'sms' }
      ];

      this.getLogger().info('Notification history retrieved', {
        userId,
        count: history.length
      });

      return history;
    });
  }
}

// Main function - demonstrates the concepts
async function main() {
  try {
    await initializeSyntropyLog('transports-concepts-app');
    
    const notificationService = new NotificationService(syntropyLog);
    
    // Demonstrate notification sending
    await notificationService.sendNotification('user-123', 'Hello world!', 'email');
    
    // Demonstrate history retrieval
    await notificationService.getNotificationHistory('user-123');
    await notificationService.getNotificationHistory('new-user');
    
    await shutdownSyntropyLog();
    
    console.log('✅ Transports concepts example completed!');
  } catch (error) {
    console.error('❌ Error in transports concepts example:', error);
    process.exit(1);
  }
}

// Run the example only when called directly
if (require.main === module) {
  main();
} 