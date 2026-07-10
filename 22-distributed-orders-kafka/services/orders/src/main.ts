import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { syntropyLog, correlationIdMiddleware } from 'syntropylog';
import { SyntropyNestLoggerService } from 'syntropylog/nestjs';
import { bootstrap as bootstrapSyntropy, env, SVC_ORDERS } from '@distributed/shared';
import { AppModule } from './app.module';
import { shutdownTracing } from './observability';

async function main(): Promise<void> {
  // Init SyntropyLog (singleton) + logbus BEFORE creating the Nest app.
  const { shutdown } = await bootstrapSyntropy(SVC_ORDERS);

  // bufferLogs holds Nest's early logs until we attach the logger, then flushes.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use the official SyntropyLog logger — resolved from SyntropyLogModule, bound to the
  // same initialized singleton — as Nest's app logger. Nest's own logs now route through
  // SyntropyLog's masking/matrix/logbus pipeline.
  app.useLogger(app.get(SyntropyNestLoggerService));

  // Open a correlation scope per request, picking up the id the gateway sent
  // on `x-correlation-id`. Mounted before the routes.
  app.use(correlationIdMiddleware());

  const log = syntropyLog.getLogger(SVC_ORDERS);
  await app.listen(env.ORDERS_PORT);
  log.info({ port: env.ORDERS_PORT, operation: 'startup' }, 'orders (NestJS) listening');

  const stop = async (): Promise<void> => {
    await app.close().catch(() => {});
    await shutdownTracing();
    await shutdown();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('orders failed to start:', err);
  process.exit(1);
});
