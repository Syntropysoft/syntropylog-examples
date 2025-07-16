"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMiddleware = contextMiddleware;
const syntropylog_1 = require("syntropylog");
const crypto_1 = require("crypto");
function contextMiddleware(req, res, next) {
    const contextManager = syntropylog_1.syntropyLog.getContextManager();
    contextManager.run(() => {
        // 1. Restore the entire context from incoming headers.
        // This is a more robust approach that makes no assumptions about which
        // headers are present.
        for (const key in req.headers) {
            if (typeof req.headers[key] === 'string') {
                contextManager.set(key, req.headers[key]);
            }
        }
        // 2. Normalize the 'correlationId' and 'transactionId' keys for consistent access within the logger.
        const correlationIdHeaderName = contextManager.getCorrelationIdHeaderName();
        let correlationId = contextManager.get(correlationIdHeaderName);
        // Ensure a correlation ID exists, creating one if it wasn't in the headers.
        if (!correlationId) {
            correlationId = (0, crypto_1.randomUUID)();
            contextManager.set(correlationIdHeaderName, correlationId);
        }
        // Set the normalized key.
        contextManager.set('correlationId', correlationId);
        const transactionIdHeaderName = contextManager.getTransactionIdHeaderName();
        const transactionId = contextManager.get(transactionIdHeaderName);
        if (transactionId) {
            // Set the normalized key.
            contextManager.set('transactionId', transactionId);
        }
        next();
    });
}
//# sourceMappingURL=context.middleware.js.map