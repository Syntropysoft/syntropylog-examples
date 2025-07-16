"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMiddleware = contextMiddleware;
const syntropylog_1 = require("syntropylog");
const crypto_1 = require("crypto");
const CORRELATION_ID_HEADER = 'x-correlation-id';
function contextMiddleware(req, res, next) {
    const contextManager = syntropylog_1.syntropyLog.getContextManager();
    contextManager.run(() => {
        const correlationId = req.headers[CORRELATION_ID_HEADER] || (0, crypto_1.randomUUID)();
        contextManager.set('correlationId', correlationId);
        next();
    });
}
//# sourceMappingURL=context.middleware.js.map