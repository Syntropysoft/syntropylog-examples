"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
async function main() {
    // 1. Initialize the logger using the singleton instance.
    syntropylog_1.syntropyLog.init({
        logger: {
            serviceName: 'my-app',
            level: 'info',
            serializerTimeoutMs: 100,
        },
    });
    const logger = syntropylog_1.syntropyLog.getLogger('main');
    // 2. Log your first messages!
    logger.info('Hello World from SyntropyLog!');
    logger.warn('This is a warning message.');
    logger.error('This is an error message.');
    // 3. You can also add structured data to your logs.
    // This is useful for adding context to your records.
    logger.info('User logged in successfully', {
        userId: 'user-123',
        tenantId: 'tenant-abc',
    });
    // 4. Shutdown the framework to allow the process to exit gracefully.
    await syntropylog_1.syntropyLog.shutdown();
}
main();
//# sourceMappingURL=index.js.map