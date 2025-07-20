// =================================================================
//  config.ts - SyntropyLog Configuration
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { SyntropyLogConfig } from 'syntropylog';
import { KafkaAdapter } from '@syntropylog/adapters/brokers';
import { Kafka, logLevel as kafkaLogLevel } from 'kafkajs';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
    serviceName: 'kafka-correlation-example',
    serializerTimeoutMs: 100,
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID',
  },
  brokers: {
    instances: [
      {
        instanceName: 'my-kafka-bus',
        adapter: new KafkaAdapter(
          new Kafka({
            clientId: 'my-app-client',
            brokers: ['localhost:9092'],
            logLevel: kafkaLogLevel.ERROR,
            retry: {
              initialRetryTime: 100,
              retries: 8
            }
          }),
          'my-app-group'
        ),
      },
    ],
  },
}; 