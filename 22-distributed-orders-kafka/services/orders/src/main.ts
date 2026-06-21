import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { syntropyLog, correlationIdMiddleware } from 'syntropylog';
import { bootstrap as bootstrapSyntropy, env, SVC_ORDERS } from '@distributed/shared';
import { AppModule } from './app.module';
import { SyntropyNestLoggerService } from './syntropy-nest-logger.service';

async function main(): Promise<void> {
  // Init SyntropyLog (singleton) + logbus BEFORE creating the Nest app.
  const { shutdown } = await bootstrapSyntropy(SVC_ORDERS);

  const app = await NestFactory.create(AppModule, {
    // bufferLogs holds Nest's early logs until our logger is attached, then flushes.
    bufferLogs: true,
    // Local logger wrapping the SAME initialized singleton (echeq production pattern).
    logger: new SyntropyNestLoggerService(),
  });

  // Open a correlation scope per request, picking up the id the gateway sent
  // on `x-correlation-id`. Mounted before the routes.
  app.use(correlationIdMiddleware());

  const log = syntropyLog.getLogger(SVC_ORDERS);
  await app.listen(env.ORDERS_PORT);
  log.info({ port: env.ORDERS_PORT, operation: 'startup' }, 'orders (NestJS) listening');

  const stop = async (): Promise<void> => {
    await app.close().catch(() => {});
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
