"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const syntropylog_1 = require("syntropylog");
const crypto_1 = require("crypto");
async function main() {
    syntropylog_1.syntropyLog.on('ready', () => {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        const logger = syntropylog_1.syntropyLog.getLogger('api-gateway');
        const contextManager = syntropylog_1.syntropyLog.getContextManager();
        const broker = syntropylog_1.syntropyLog.getBroker('nats-main');
        // Middleware must be declared before routes
        app.use((req, res, next) => {
            const correlationId = req.headers['x-correlation-id'] || (0, crypto_1.randomUUID)();
            contextManager.set('correlationId', correlationId);
            next();
        });
        app.post('/orders', async (req, res) => {
            logger.info({ order: req.body }, 'Received request to create a new order.');
            try {
                await broker.publish('orders.create', {
                    payload: { payload: req.body },
                });
                logger.info('Order successfully published to NATS for processing.');
                const correlationId = contextManager.get('correlationId');
                res.status(202).send({
                    message: 'Order creation request received and is being processed.',
                    correlationId,
                });
            }
            catch (error) {
                logger.error({ err: error.message, stack: error.stack }, 'Failed to publish order to NATS.');
                const correlationId = contextManager.get('correlationId');
                res.status(500).send({
                    message: 'Internal server error while processing the order.',
                    correlationId,
                });
            }
        });
        const port = 3000;
        app.listen(port, () => {
            logger.info(`API Gateway listening at http://localhost:${port}`);
        });
    });
    syntropylog_1.syntropyLog.on('error', (err) => {
        console.error('Failed to initialize SyntropyLog', err);
        process.exit(1);
    });
    // Dynamic import of the adapter
    const { NatsAdapter } = await import('../../../../external-adapters/brokers/NatsAdapter.js');
    await syntropylog_1.syntropyLog.init({
        logger: {
            serviceName: 'api-gateway',
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
    console.error('Failed to start service', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map