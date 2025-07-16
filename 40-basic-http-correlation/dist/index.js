"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
const http_1 = require("syntropylog/http");
const crypto_1 = require("crypto");
const nock_1 = __importDefault(require("nock"));
const axios_1 = __importDefault(require("axios"));
const MOCK_API_URL = 'https://api.example.com';
async function main() {
    // 1. Configure and initialize SyntropyLog.
    syntropylog_1.syntropyLog.init({
        logger: {
            serviceName: 'http-example',
            level: 'info',
            transports: [new syntropylog_1.CompactConsoleTransport()],
            serializerTimeoutMs: 100,
        },
        context: {
            // Define the header name for correlation ID propagation.
            correlationIdHeader: 'X-Correlation-ID',
        },
        http: {
            instances: [
                {
                    instanceName: 'my-axios-client',
                    // Here's the key: We instantiate the adapter.
                    // We can pass a pre-configured axios instance or a config object.
                    adapter: new http_1.AxiosAdapter(axios_1.default.create({ baseURL: MOCK_API_URL })),
                },
            ],
        },
    });
    const logger = syntropylog_1.syntropyLog.getLogger('main');
    logger.info('Initialized.');
    // 2. Mock the external API endpoint with Nock.
    (0, nock_1.default)(MOCK_API_URL)
        .get('/users/1')
        .reply(200, function (uri, requestBody) {
        const correlationHeader = this.req.headers['x-correlation-id'];
        if (!correlationHeader) {
            throw new Error('X-Correlation-ID header was not received!');
        }
        logger.info('Nock mock confirmed: Correlation ID received!', { correlationId: correlationHeader });
        return { id: 1, name: 'John Doe' };
    });
    // 3. Create a context for the operation using the ContextManager.
    const contextManager = syntropylog_1.syntropyLog.getContextManager();
    await contextManager.run(async () => {
        // Set the correlation ID for this context.
        const correlationId = (0, crypto_1.randomUUID)();
        contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
        logger.info('Context created. Making HTTP call...');
        // 4. Get the instrumented client.
        const apiClient = syntropylog_1.syntropyLog.getHttp('my-axios-client');
        // 5. Use the generic .request() method to make the call.
        try {
            await apiClient.request({
                method: 'GET',
                url: '/users/1', // The baseURL from the adapter config is used.
                headers: {}, // Headers can be added here.
            });
        }
        catch (error) {
            logger.error('API call failed', { error });
        }
        logger.info('Request finished.');
    });
    await syntropylog_1.syntropyLog.shutdown();
}
main();
