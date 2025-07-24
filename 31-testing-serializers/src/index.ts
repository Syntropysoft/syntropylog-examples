/**
 * Example 31: Testing Custom Serializers
 * 
 * This example demonstrates how to use custom serializers with SyntropyLog
 * and how to test them effectively.
 */

import { syntropyLog } from 'syntropylog';
import { userSerializer, orderSerializer, dateSerializer, errorSerializer } from './serializers';

export async function initializeSyntropyLog() {
  console.log('🚀 Initializing SyntropyLog with custom serializers...');
  
  return new Promise<void>((resolve, reject) => {
    syntropyLog.on('ready', () => {
      console.log('✅ SyntropyLog initialized successfully!');
      resolve();
    });
    
    syntropyLog.on('error', (err) => {
      console.error('❌ SyntropyLog initialization failed:', err);
      reject(err);
    });

    // Initialize with custom serializers
    syntropyLog.init({
      logger: {
        serviceName: 'serializer-example',
        level: 'info',
        serializers: {
          user: userSerializer,
          order: orderSerializer,
          date: dateSerializer,
          err: errorSerializer
        },
        serializerTimeoutMs: 100
      },
      context: {
        correlationIdHeader: 'X-Correlation-ID'
      }
    });
  });
}

export async function gracefulShutdown() {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
}

async function main() {
  try {
    // 1. Initialize SyntropyLog
    await initializeSyntropyLog();
    
    // 2. Get logger instance
    const logger = syntropyLog.getLogger('main');
    
    // 3. Demonstrate custom serializers
    console.log('\n📝 Demonstrating custom serializers...');
    
    // User serializer
    const user = { id: 123, name: 'John Doe', email: 'john@example.com' };
    logger.info('User data', { user });
    
    // Order serializer
    const order = { id: 'ORD-456', total: 99.99, items: ['item1', 'item2'] };
    logger.info('Order data', { order });
    
    // Date serializer
    const date = new Date();
    logger.info('Date data', { date });
    
    // Error serializer
    const error = new Error('Something went wrong');
    logger.error('Error occurred', { err: error });
    
    // Multiple serializers together
    logger.info('Complex data', { 
      user, 
      order, 
      date, 
      correlationId: 'corr-789' 
    });
    
    console.log('\n✅ All serializers demonstrated successfully!');
    
    // 4. Graceful shutdown
    await gracefulShutdown();
    
  } catch (err) {
    console.error('❌ Application failed:', err);
    process.exit(1);
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

// Run the application only when called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Example failed:', error);
      process.exit(1);
    });
} 