"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syntropylog_1 = require("syntropylog");
// --- SCENARIO 1: Secure by Default (Fixed-Length Masking) ---
console.log('\n--- 1. Testing Default "fixed" Masking Style ---');
syntropylog_1.syntropyLog.init({
    logger: {
        serviceName: 'secure-payment-processor',
        level: 'info',
        transports: [new syntropylog_1.ConsoleTransport()], // Use the default JSON transport for clarity
        serializerTimeoutMs: 50, // This is required
    },
    masking: {
        // Only need to declare sensitive field names.
        // The engine will find and mask them anywhere in the object.
        fields: ['creditCardNumber', 'apiToken', 'ssn'],
        // style: 'fixed' is the default, so we don't need to specify it.
    },
});
const logger = syntropylog_1.syntropyLog.getLogger('main');
const paymentDetails = {
    transactionId: 'txn_12345abc',
    customer: {
        id: 'cust_67890',
        ssn: '123-45-6789', // Sensitive field
    },
    paymentMethod: {
        type: 'credit_card',
        creditCardNumber: '4111-1111-1111-1111', // Sensitive field
    },
    metadata: {
        source: 'web-checkout',
        apiToken: 'sk_live_abcdef123456', // Sensitive field
    },
    requestPath: '/api/v1/user/ssn/123-45-6789/details', // Path with sensitive data
};
logger.info({ payload: paymentDetails }, 'New payment received (Fixed Masking)');
console.log('Notice how `ssn`, `creditCardNumber`, `apiToken`, and the path are masked with "******".');
// --- SCENARIO 2: Preserve-Length Masking ---
console.log('\n--- 2. Testing "preserve-length" Masking Style ---');
// Reset the singleton state for demonstration purposes.
// DO NOT do this in a real application.
syntropylog_1.syntropyLog._resetForTesting();
// Re-initializing is not typical, but we do it here to demonstrate the other style.
syntropylog_1.syntropyLog.init({
    logger: {
        serviceName: 'secure-payment-processor',
        level: 'info',
        transports: [new syntropylog_1.ConsoleTransport()],
        serializerTimeoutMs: 50, // This is required
    },
    masking: {
        fields: ['creditCardNumber', 'apiToken', 'ssn'],
        // Explicitly set the style to preserve length
        style: 'preserve-length',
        maskChar: '*',
    },
});
const loggerPreserve = syntropylog_1.syntropyLog.getLogger('main-preserve');
loggerPreserve.info({ payload: paymentDetails }, 'New payment received (Preserve-Length Masking)');
console.log('Now notice how the masks match the length of the original secrets.');
