// =================================================================
//  config.ts - SyntropyLog Configuration for Kafka Full-Stack Example
//  RESPONSIBILITY: Define configuration using official framework types
// =================================================================

import { SyntropyLogConfig } from 'syntropylog';
import { KafkaAdapter } from '@syntropylog/adapters/brokers';
import { Kafka, logLevel as kafkaLogLevel } from 'kafkajs';

// ✅ Using official framework types
export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
    serviceName: 'kafka-full-stack',
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
            clientId: 'syntropylog-example-23',
            brokers: ['localhost:9092'],
            logLevel: kafkaLogLevel.ERROR,
            retry: {
              initialRetryTime: 100,
              retries: 8
            }
          }),
          'syntropylog-example-23-group'
        ),
      },
    ],
  },
}; 