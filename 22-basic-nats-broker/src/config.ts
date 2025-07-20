// =================================================================
//  config.ts - SyntropyLog Configuration
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { ClassicConsoleTransport, SyntropyLogConfig } from 'syntropylog';
import { NatsAdapter } from '@syntropylog/adapters';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
    serviceName: 'nats-correlation-example',
    serializerTimeoutMs: 100,
    transports: [new ClassicConsoleTransport()],
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID',
  },
  brokers: {
    instances: [
      {
        instanceName: 'my-nats-bus',
        adapter: new NatsAdapter(['nats://localhost:4222']),
      },
    ],
  },
}; 