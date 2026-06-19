/**
 * Example 15: Testing Custom Serializers
 *
 * Custom serializers were removed from the main library config.
 * This example shows how to serialize non-JSON values (Date, Error, etc.)
 * in your code before passing them to the logger (logger only accepts JsonValue).
 */

import { syntropyLog } from 'syntropylog';
import { userSerializer, orderSerializer, dateSerializer, errorSerializer } from './serializers';

export async function initializeSyntropyLog() {
  console.log('🚀 Initializing SyntropyLog...');
  await syntropyLog.init({
    logger: {
      serviceName: 'serializer-example',
      level: 'info',
      serializerTimeoutMs: 100
    },
    context: {
      correlationIdHeader: 'X-Correlation-ID'
    }
  });
  console.log('✅ SyntropyLog initialized successfully!');
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

/**
 * Runs the serializer demo: get logger and log with all custom serializers.
 * Exported for testing so index.ts coverage is improved.
 */
export async function runDemo() {
  const logger = syntropyLog.getLogger('main');
  console.log('\n📝 Demonstrating serialization before logging...');

  const user = { id: 123, name: 'John Doe', email: 'john@example.com' };
  logger.info('User data', { user: userSerializer(user) });

  const order = { id: 'ORD-456', total: 99.99, items: ['item1', 'item2'] };
  logger.info('Order data', { order: orderSerializer(order) });

  const date = new Date();
  logger.info('Date data', { date: dateSerializer(date) });

  const error = new Error('Something went wrong');
  logger.error('Error occurred', { err: errorSerializer(error) });

  logger.info('Complex data', {
    user: userSerializer(user),
    order: orderSerializer(order),
    date: dateSerializer(date),
    correlationId: 'corr-789'
  });

  console.log('\n✅ All serializers demonstrated successfully!');
}

async function main() {
  try {
    await initializeSyntropyLog();
    await runDemo();
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