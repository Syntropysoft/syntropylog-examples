"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const syntropylog_1 = require("syntropylog");
const NatsAdapter_js_1 = require("../adapters/NatsAdapter.js");
const uuid_1 = require("uuid");
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
            serviceName: 'api-gateway',
            serializerTimeoutMs: 100,
        },
    });
    const logger = syntropylog_1.syntropyLog.getLogger();
    const app = (0, express_1.default)();
    const port = process.env.PORT || 3000;
    // Middleware to attach logger to request
    app.use((req, res, next) => {
        req.logger = logger;
        next();
    });
    app.use(express_1.default.json());
    // Endpoint to create a new sale
    app.post('/sales', async (req, res) => {
        const saleData = req.body;
        const correlationId = req.logger.getCorrelationId?.();
        const saleMessage = {
            payload: saleData,
            headers: { 'x-correlation-id': correlationId || (0, uuid_1.v4)() },
        };
        try {
            logger.info('Received new sale request', { saleData });
            const broker = syntropylog_1.syntropyLog.getBroker('nats-broker');
            await broker.publish('sales.new', saleMessage);
            logger.info('Sale event published to NATS', { saleData });
            res.status(202).json({ message: 'Sale processing started' });
        }
        catch (error) {
            logger.error('Failed to publish sale event', {
                error: error instanceof Error ? error.message : String(error),
            });
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
    app.listen(port, () => {
        logger.info(`API Gateway listening on port ${port}`);
    });
}
main().catch((err) => {
    const logger = syntropylog_1.syntropyLog.getLogger();
    logger.fatal('API Gateway failed to start', {
        error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
});
//# sourceMappingURL=index.js.map