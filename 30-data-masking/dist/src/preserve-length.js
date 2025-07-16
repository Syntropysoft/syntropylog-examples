"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
console.log('\\n--- Testing "preserve-length" Masking Style ---');
syntropylog_1.syntropyLog.init({
    logger: {
        serviceName: 'secure-payment-processor',
        level: 'info',
        transports: [new syntropylog_1.ConsoleTransport()],
        serializerTimeoutMs: 50,
    },
    masking: {
        fields: ['creditCardNumber', 'apiToken', 'ssn'],
        style: 'preserve-length',
        maskChar: '*',
    },
});
const logger = syntropylog_1.syntropyLog.getLogger('main-preserve');
const paymentDetails = {
    transactionId: 'txn_12345abc',
    customer: {
        id: 'cust_67890',
        ssn: '123-45-6789',
    },
    paymentMethod: {
        type: 'credit_card',
        creditCardNumber: '4111-1111-1111-1111',
    },
    metadata: {
        source: 'web-checkout',
        apiToken: 'sk_live_abcdef123456',
    },
    requestPath: '/api/v1/user/ssn/123-45-6789/details',
};
logger.info({ payload: paymentDetails }, 'New payment received (Preserve-Length Masking)');
console.log('Now notice how the masks match the length of the original secrets.');
//# sourceMappingURL=preserve-length.js.map