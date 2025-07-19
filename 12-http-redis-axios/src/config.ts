import { AxiosAdapter } from '@syntropylog/adapters/http';
// =================================================================
//  config.ts - SyntropyLog Configuration
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { SyntropyLogConfig } from 'syntropylog';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info', // ✅ Back to info, Redis will use its own logging config
    serviceName: 'http-redis-axios-example',
    serializerTimeoutMs: 100,
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID',
  },
  http: {
    instances: [
      {
        instanceName: 'my-axios-client',
        adapter: new AxiosAdapter({}),
      },
    ],
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
 