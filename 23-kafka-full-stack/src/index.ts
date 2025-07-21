// =================================================================
//  index.ts - Kafka Full-Stack Correlation Example
//  RESPONSIBILITY: Demonstrate end-to-end correlation across Kafka producer and consumer
// =================================================================

import { randomUUID } from 'node:crypto';
import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog, shutdownSyntropyLog } from './boilerplate.js';

const TOPIC_NAME = 'syntropylog-test-topic';

async function main() {
  console.log('--- Running Kafka Full-Stack Correlation Example ---');

  try {
    // Initialize SyntropyLog with configuration
    await initializeSyntropyLog();

    const broker = syntropyLog.getBroker('my-kafka-bus');
    const contextManager = syntropyLog.getContextManager();

    // Connect to Kafka
    await broker.connect();
    console.log('✅ Connected to Kafka broker');

    // Subscribe to topic (consumer)
    await broker.subscribe(TOPIC_NAME, async (message, controls) => {
      const logger = syntropyLog.getLogger('consumer');
      logger.info(
        { payload: message.payload.toString() },
        'Message processed by consumer.'
      );
      await controls.ack();
    });

    console.log('✅ Subscribed to topic:', TOPIC_NAME);

    // Create producer context and publish message
    await contextManager.run(async () => {
      const correlationId = randomUUID();
      contextManager.set(
        contextManager.getCorrelationIdHeaderName(),
        correlationId
      );

      const logger = syntropyLog.getLogger('producer');
      logger.info('Producer context created. Publishing message...');

      await broker.publish(TOPIC_NAME, {
        payload: Buffer.from('Hello, distributed world!'),
      });

      console.log('✅ Message published with correlation ID:', correlationId);
      
      // Wait for consumer to process
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

  } catch (error) {
    console.error('❌ An error occurred:', error);
  } finally {
    // Graceful shutdown
    await shutdownSyntropyLog();
    console.log('\n✅ Kafka Full-Stack example finished.');
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
