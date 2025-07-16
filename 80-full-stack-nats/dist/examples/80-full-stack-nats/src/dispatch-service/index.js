"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
const NatsAdapter_1 = require("../../../../external-adapters/brokers/NatsAdapter");
async function main() {
    syntropylog_1.syntropyLog.init({
        logger: {
            serviceName: 'dispatch-service',
            serializerTimeoutMs: 100,
        },
        loggingMatrix: {
            // By default, only log the correlationId and transactionId from the context.
            default: ['correlationId', 'transactionId'],
            // On error or fatal, log the entire context.
            error: ['*'],
            fatal: ['*'],
        },
        context: {
            correlationIdHeader: 'x-correlation-id',
            transactionIdHeader: 'x-trace-id',
        },
        brokers: {
            instances: [
                {
                    instanceName: 'nats-default',
                    adapter: new NatsAdapter_1.NatsAdapter('nats://nats-server:4222'),
                },
            ],
        },
    });
    const logger = syntropylog_1.syntropyLog.getLogger('dispatch-service');
    try {
        const instrumentedNats = syntropylog_1.syntropyLog.getBroker('nats-default');
        // Explicitly connect the broker client
        await instrumentedNats.connect();
        logger.info('Broker client connected successfully.');
        await instrumentedNats.subscribe('sales.processed', async (message, controls) => {
            // The BrokerManager wraps this callback in a context, so 'correlationId' is available.
            try {
                const payload = message.payload.toString();
                const data = JSON.parse(payload);
                logger.info({ orderId: data.customer.id }, 'Received processed sale. Dispatching order...');
            }
            catch (err) {
                logger.error({ err, payload: message.payload.toString('base64') }, 'Failed to parse message payload.');
            }
            // Nats Core doesn't support ack/nack, so controls are no-ops, but we call ack for consistency.
            await controls.ack();
        });
        logger.info("Subscribed to 'sales.processed'");
        // Keep the process alive to listen for messages
        process.stdin.resume();
    }
    catch (err) {
        logger.error({ err }, 'Failed to connect or subscribe to NATS topic');
        process.exit(1);
    }
}
main().catch((err) => {
    // Use console.error for unhandled promise rejections before logger is even available
    console.error('Fatal error during dispatch-service startup:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map