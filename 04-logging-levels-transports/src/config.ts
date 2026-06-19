import { ClassicConsoleTransport, ConsoleTransport, SyntropyLogConfig } from 'syntropylog';

export const config: SyntropyLogConfig = {
  logger: {
    serviceName: 'logging-levels-example',
    level: 'info',
    serializerTimeoutMs: 100,
    transports: [new ClassicConsoleTransport(), new ConsoleTransport()],
  },
  context: {
    correlationIdHeader: 'x-correlation-id-test-04'
  }
}; 