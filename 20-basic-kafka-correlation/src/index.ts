// =================================================================
//  FILE: src/index.ts
//  RESPONSIBILITY: Orchestrate the application using standard boilerplate
// =================================================================

import { randomUUID } from 'node:crypto';
import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog, gracefulShutdown } from './boilerplate';

const TOPIC_NAME = 'syntropylog-test-topic';

async function main() {
  console.log('--- Running Broker Instrumentation Example ---');

  try {
    // Initialize SyntropyLog with boilerplate
    await initializeSyntropyLog();

    const broker = syntropyLog.getBroker('my-kafka-bus');
    const contextManager = syntropyLog.getContextManager();
    const logger = syntropyLog.getLogger('main');

    logger.info('🚀 Starting Kafka broker example...');

    await broker.connect();
    logger.info('✅ Connected to Kafka broker');

    await broker.subscribe(TOPIC_NAME, async (message, controls) => {
      const consumerLogger = syntropyLog.getLogger('consumer');
      consumerLogger.info(
        { payload: message.payload.toString() },
        'Message processed by consumer.'
      );
      await controls.ack();
    });

    logger.info('✅ Subscribed to topic:', TOPIC_NAME);

    await contextManager.run(async () => {
      const correlationId = randomUUID();
      contextManager.set(
        contextManager.getCorrelationIdHeaderName(),
        correlationId
      );

      const producerLogger = syntropyLog.getLogger('producer');
      producerLogger.info('Producer context created. Publishing message...');

      await broker.publish(TOPIC_NAME, {
        payload: Buffer.from('Hello, distributed world!'),
      });

      logger.info('✅ Message published successfully');

      // Wait a moment for the consumer to process the message
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    await broker.disconnect();
    logger.info('✅ Broker disconnected successfully');

  } catch (error) {
    console.error('❌ Error in broker example:', error);
    throw error;
  } finally {
    await gracefulShutdown();
    console.log('\n✅ Broker example finished.');
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
