"use strict";
// =================================================================
//  FILE: src/index.ts
//  RESPONSIBILITY: Orchestrate the application. It no longer knows
//  how the adapter is created; it simply imports and uses it.
// =================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
const syntropylog_1 = require("syntropylog");
// --- The Magic! ---
// We import the singleton instance of the adapter from our centralized file.
const kafka_client_1 = require("./kafka-client");
const TOPIC_NAME = 'syntropylog-test-topic';
async function main() {
    console.log('--- Running Broker Instrumentation Example ---');
    // The configuration is now much cleaner and clearer.
    syntropylog_1.syntropyLog.init({
        logger: {
            level: 'info',
            serviceName: 'broker-example',
            transports: [new syntropylog_1.ClassicConsoleTransport()],
            serializerTimeoutMs: 100,
        },
        context: {
            correlationIdHeader: 'X-Correlation-ID',
        },
        brokers: {
            instances: [
                {
                    instanceName: 'my-kafka-bus',
                    adapter: kafka_client_1.myKafkaBusAdapter, // We use the imported instance
                },
            ],
        },
    });
    const broker = syntropylog_1.syntropyLog.getBroker('my-kafka-bus');
    const contextManager = syntropylog_1.syntropyLog.getContextManager();
    try {
        await broker.connect();
        await broker.subscribe(TOPIC_NAME, async (message, controls) => {
            const logger = syntropylog_1.syntropyLog.getLogger('consumer');
            logger.info({ payload: message.payload.toString() }, 'Message processed by consumer.');
            await controls.ack();
        });
        await contextManager.run(async () => {
            const correlationId = (0, node_crypto_1.randomUUID)();
            contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
            const logger = syntropylog_1.syntropyLog.getLogger('producer');
            logger.info('Producer context created. Publishing message...');
            await broker.publish(TOPIC_NAME, {
                payload: Buffer.from('Hello, distributed world!'),
            });
            // Wait a moment for the consumer to process the message
            await new Promise((resolve) => setTimeout(resolve, 2000));
        });
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
    finally {
        await broker.disconnect();
        await syntropylog_1.syntropyLog.shutdown();
        console.log('\n✅ Broker example finished.');
    }
}
main();
