"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
const NatsAdapter_js_1 = require("../adapters/NatsAdapter.js");
async function main() {
    const natsAdapter = new NatsAdapter_js_1.NatsAdapter();
    await natsAdapter.connect();
    await syntropylog_1.syntropyLog.init({
        brokers: {
            instances: [
                {
                    instanceName: 'nats-broker',
                    adapter: natsAdapter,
                    isDefault: true,
                },
            ],
        },
        logger: {
            level: 'trace',
            serviceName: 'dispatch-service',
            serializerTimeoutMs: 100,
        },
    });
    const logger = syntropylog_1.syntropyLog.getLogger();
    logger.info('Dispatch service started and connected to NATS.');
    const broker = syntropylog_1.syntropyLog.getBroker('nats-broker');
    await broker.subscribe('dispatch.process', async (message, { ack }) => {
        try {
            const order = JSON.parse(message.payload.toString());
            logger.info('Processing dispatch for order', { orderId: order.orderId });
            // Simulate dispatch processing
            await new Promise((resolve) => setTimeout(resolve, 2000));
            logger.info('Dispatch for order completed', { orderId: order.orderId });
            await ack();
        }
        catch (error) {
            logger.error('Error processing dispatch', {
                error: error instanceof Error ? error.message : String(error),
            });
            // In a real scenario, you might nack() or send to a dead-letter queue.
        }
    });
}
main().catch((err) => {
    const logger = syntropylog_1.syntropyLog.getLogger();
    logger.fatal('Dispatch service failed to start', {
        error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
});
//# sourceMappingURL=index.js.map