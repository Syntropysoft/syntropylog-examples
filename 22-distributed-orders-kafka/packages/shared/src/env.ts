/** Tiny env reader with defaults pointing at the docker-compose infra. */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const env = {
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  LOG_LEVEL: (process.env.LOG_LEVEL ?? 'info') as LogLevel,

  GATEWAY_PORT: Number(process.env.GATEWAY_PORT ?? 3000),
  ORDERS_PORT: Number(process.env.ORDERS_PORT ?? 3001),
  PAYMENTS_PORT: Number(process.env.PAYMENTS_PORT ?? 3002),
  INVENTORY_PORT: Number(process.env.INVENTORY_PORT ?? 3003),

  ORDERS_URL: process.env.ORDERS_URL ?? 'http://localhost:3001',

  // The .NET AOT traceability collector — where spans (and later logs) are pushed.
  COLLECTOR_URL: process.env.COLLECTOR_URL ?? 'http://localhost:9317',
};
