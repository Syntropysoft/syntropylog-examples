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
            serviceName: 'sales-service',
            serializerTimeoutMs: 100,
        },
    });
    const logger = syntropylog_1.syntropyLog.getLogger();
    logger.info('Sales service started and connected to NATS.');
    const broker = syntropylog_1.syntropyLog.getBroker('nats-broker');
    await broker.subscribe('sales.new', async (message, { ack }) => {
        try {
            const saleData = JSON.parse(message.payload.toString());
            logger.info('Processing new sale', { saleData });
            // Simulate some business logic for processing the sale
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const dispatchMessage = {
                payload: Buffer.from(JSON.stringify({
                    orderId: `ORD-${Date.now()}`,
                    items: saleData.items,
                })),
                headers: message.headers, // Propagate headers
            };
            await broker.publish('dispatch.process', dispatchMessage);
            logger.info('Sale processed and sent to dispatch', {
                orderId: JSON.parse(dispatchMessage.payload.toString()).orderId,
            });
            await ack(); // Acknowledge the message
        }
        catch (error) {
            logger.error('Error processing sale', {
                error: error instanceof Error ? error.message : String(error),
            });
            // In a real-world scenario, you might want to nack() the message
            // or move it to a dead-letter queue.
        }
    });
}
main().catch((err) => {
    const logger = syntropylog_1.syntropyLog.getLogger();
    logger.fatal('Sales service failed to start', {
        error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
});
//# sourceMappingURL=index.js.map