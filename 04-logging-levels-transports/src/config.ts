import { ClassicConsoleTransport, SyntropyLogConfig } from 'syntropylog';

export const config: SyntropyLogConfig = {
  logger: {
    serviceName: 'logging-levels-example',
    level: 'info',
    serializerTimeoutMs: 100,

  },
  context: {
    correlationIdHeader: 'x-correlation-id-test-04'
  }
}; 