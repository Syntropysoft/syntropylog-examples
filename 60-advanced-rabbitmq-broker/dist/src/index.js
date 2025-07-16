"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// examples/05-advanced-brokers-rabbitmq/src/index.ts
const syntropylog_1 = require("syntropylog");
const node_crypto_1 = require("node:crypto");
// Note: RabbitMQAdapter would be implemented in a separate adapter package
// For this example, we'll use a mock adapter
const RabbitMQAdapter = class {
    constructor(url, exchange) {
        this.url = url;
        this.exchange = exchange;
    }
    url;
    exchange;
    async connect() { }
    async disconnect() { }
    async publish(topic, message) { }
    async subscribe(queue, handler) { }
};
const exchangeName = 'user-events';
const userCreatedTopic = 'user.created';
const userUpdatedTopic = 'user.updated';
const userQueue = 'user-service-queue';
async function main() {
    console.log('--- Running Advanced RabbitMQ Broker Example ---');
    syntropylog_1.syntropyLog.init({
        logger: {
            serviceName: 'rabbitmq-example',
            level: 'info',
            serializerTimeoutMs: 100,
        },
        brokers: {
            instances: [
                {
                    instanceName: 'rabbit-main',
                    adapter: new RabbitMQAdapter('amqp://user:password@localhost:5672', exchangeName),
                },
            ],
        },
    });
    const rabbitBroker = syntropylog_1.syntropyLog.getBroker('rabbit-main');
    await rabbitBroker.connect();
    // Subscribe to the queue before publishing
    await rabbitBroker.subscribe(userQueue, async (message, controls) => {
        const logger = syntropylog_1.syntropyLog.getLogger('consumer');
        logger.info('Received message:', {
            payload: message.payload.toString(),
            headers: message.headers,
        });
        await controls.ack();
    });
    // Create a context for the publishing operation
    await syntropylog_1.syntropyLog.getContextManager().run(async () => {
        const correlationId = (0, node_crypto_1.randomUUID)();
        syntropylog_1.syntropyLog.getContextManager().set('X-Correlation-ID', correlationId);
        const producerLogger = syntropylog_1.syntropyLog.getLogger('producer');
        producerLogger.info('Publishing user.created event...');
        const message = {
            payload: Buffer.from(JSON.stringify({ userId: 1, name: 'John Doe' })),
        };
        // The instrumented client calls the adapter's publish method
        await rabbitBroker.publish(userCreatedTopic, message);
        producerLogger.info('Message published.');
    });
    // Give some time for the message to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await rabbitBroker.disconnect();
    await syntropylog_1.syntropyLog.shutdown();
    console.log('✅ RabbitMQ example finished.');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map