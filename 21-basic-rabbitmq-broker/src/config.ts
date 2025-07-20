// =================================================================
//  config.ts - SyntropyLog Configuration
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { PrettyConsoleTransport, SyntropyLogConfig } from 'syntropylog';
import { RabbitMQAdapter } from '@syntropylog/adapters';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
    serviceName: 'rabbitmq-correlation-example',
    serializerTimeoutMs: 100,
    transports: [new PrettyConsoleTransport()],
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID',
  },
  brokers: {
    instances: [
      {
        instanceName: 'my-rabbitmq-bus',
        adapter: new RabbitMQAdapter(
          'amqp://admin:admin123@localhost:5672',
          'syntropylog-exchange'
        ),
      },
    ],
  },
}; 