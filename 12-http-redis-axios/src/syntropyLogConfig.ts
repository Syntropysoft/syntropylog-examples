import { SyntropyLogConfig } from 'syntropylog';
import { AxiosAdapter } from '@syntropylog/adapters/http';

export const syntropyConfig: SyntropyLogConfig = {
  logger: {
    level: 'info',
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
        instanceName: 'ventas-redis',
        mode: 'single',
        url: 'redis://localhost:6379',
      },
      {
        instanceName: 'delivery-redis',
        mode: 'cluster',
        rootNodes: [
          { host: 'localhost', port: 7001 },
          { host: 'localhost', port: 7002 },
          { host: 'localhost', port: 7003 },
        ],
      },
    ],
  },
};
