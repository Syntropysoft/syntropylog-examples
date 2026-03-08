// =================================================================
//  config.ts - SyntropyLog Configuration for Koa Example
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { ClassicConsoleTransport, ConsoleTransport, SyntropyLogConfig } from 'syntropylog';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
    serviceName: 'http-redis-koa-example',
    serializerTimeoutMs: 100,
    transports: [
      new ClassicConsoleTransport(),
      new ConsoleTransport(),
    ],
  },
  redis: {
    instances: [
      {
        instanceName: 'product-cache',
        mode: 'single',
        url: 'redis://localhost:6379',
        logging: {
          onSuccess: 'info',
          onError: 'error',
          logCommandValues: true,
          logReturnValue: false,
        },
      },
    ],
  },
}; 