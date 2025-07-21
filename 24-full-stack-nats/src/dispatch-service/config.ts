// =================================================================
//  config.ts - SyntropyLog Configuration for Dispatch Service
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { SyntropyLogConfig } from 'syntropylog';
import { NatsAdapter } from '@syntropylog/adapters';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
  serviceName: 'dispatch-service',
    serializerTimeoutMs: 100,
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID',
  },
  brokers: {
    instances: [
      {
        instanceName: 'nats-broker',
        adapter: new NatsAdapter([process.env.NATS_SERVERS || 'nats://localhost:4222']),
        isDefault: true,
      },
    ],
  },
}; 