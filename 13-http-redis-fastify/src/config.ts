// =================================================================
//  config.ts - SyntropyLog Configuration for Fastify Example
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { ClassicConsoleTransport, SyntropyLogConfig } from 'syntropylog';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info', // ✅ Back to info, Redis will use its own logging config
    serviceName: 'http-redis-fastify-example',
    serializerTimeoutMs: 100,
    transports: [
      new ClassicConsoleTransport(),
    ],
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID',
  },
  redis: {
    instances: [
      {
        instanceName: 'product-cache',
        mode: 'single',
        url: 'redis://localhost:6379',
        logging: {
          onSuccess: 'info', // ✅ Show Redis operations at info level
          onError: 'error',
          logCommandValues: true, // ✅ Show what keys we're accessing
          logReturnValue: false, // ❌ Don't show values (security)
        },
      },
    ],
  },
};
 