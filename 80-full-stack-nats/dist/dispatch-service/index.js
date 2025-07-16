"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
async function main() {
    syntropylog_1.syntropyLog.on('ready', async () => {
        const logger = syntropylog_1.syntropyLog.getLogger('dispatch-service');
        const broker = syntropylog_1.syntropyLog.getBroker('nats-main');
        logger.info('Dispatch service is ready and listening for processed orders.');
        await broker.subscribe('orders.processed', async (err, msg, controls) => {
            if (err) {
                logger.error({ err }, 'Error receiving message from NATS');
                return;
            }
            const { order } = msg.payload;
            logger.info({ order }, 'Received a processed order. Preparing for dispatch.');
            // Simulate dispatch logic
            await new Promise((resolve) => setTimeout(resolve, 1000));
            logger.info({ orderId: order.id }, 'Order dispatched.');
            if (controls?.ack) {
                await controls.ack();
            }
        });
    });
    syntropylog_1.syntropyLog.on('error', (err) => {
        console.error('Failed to initialize SyntropyLog in Dispatch Service', err);
        process.exit(1);
    });
    const { NatsAdapter } = await import('../adapters/NatsAdapter.js');
    await syntropylog_1.syntropyLog.init({
        logger: {
            serviceName: 'dispatch-service',
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
    console.error('Failed to start Dispatch Service', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map