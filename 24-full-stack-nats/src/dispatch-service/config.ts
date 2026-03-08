// =================================================================
//  config.ts - SyntropyLog Configuration for Dispatch Service
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { SyntropyLogConfig, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';
import { NatsAdapter } from '@syntropylog/adapters';


// ✅ Using official framework types with default values
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
    serviceName: 'dispatch-service',
    serializerTimeoutMs: 100,
    transports: [new ClassicConsoleTransport(), new ConsoleTransport()]
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID-test',
  },
  brokers: {
    instances: [
      {
        instanceName: 'nats-broker',
        adapter: new NatsAdapter([process.env.NATS_SERVERS || 'nats://localhost:4222']),
        isDefault: true,
        propagate: ['*'], // Propagar todo el contexto
      },
    ],
  },
}; 