"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
async function main() {
    syntropylog_1.syntropyLog.on('ready', async () => {
        const logger = syntropylog_1.syntropyLog.getLogger('sales-service');
        const broker = syntropylog_1.syntropyLog.getBroker('nats-main');
        logger.info('Sales service is ready and listening for orders.');
        await broker.subscribe('orders.create', async (err, msg, controls) => {
            if (err) {
                logger.error({ err }, 'Error receiving message from NATS');
                return;
            }
            const { payload: order } = msg.payload;
            logger.info({ order }, 'Received a new order to process.');
            // Simulate processing
            await new Promise((resolve) => setTimeout(resolve, 500));
            logger.info({ orderId: order.id }, 'Order processed successfully.');
            await broker.publish('orders.processed', { payload: { order } });
            logger.info({ orderId: order.id }, 'Order processed event published.');
            if (controls?.ack) {
                await controls.ack();
            }
        });
    });
    syntropylog_1.syntropyLog.on('error', (err) => {
        console.error('Failed to initialize SyntropyLog in Sales Service', err);
        process.exit(1);
    });
    const { NatsAdapter } = await import('../adapters/NatsAdapter.js');
    await syntropylog_1.syntropyLog.init({
        logger: {
            serviceName: 'sales-service',
            serializerTimeoutMs: 100,
        },
        brokers: {
            instances: [
                {
                    instanceName: 'nats-main',
                    adapter: new NatsAdapter(),
                    isDefault: true,
                },
            ],
        },
        context: {
            correlationIdHeader: 'x-correlation-id',
            transactionIdHeader: 'x-trace-id',
        },
    });
}
main().catch((err) => {
    console.error('Failed to start Sales Service', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map