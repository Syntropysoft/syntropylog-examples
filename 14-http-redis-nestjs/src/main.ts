import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { syntropyLog, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';

async function bootstrap() {
  console.log('🚀 Starting NestJS + SyntropyLog Example');

  // Initialize SyntropyLog
  await syntropyLog.init({
    logger: {
      serviceName: 'nestjs-example',
      level: 'info',
      serializerTimeoutMs: 100,
      transports: [new ClassicConsoleTransport(), new ConsoleTransport()],
    },
    context: {
      correlationIdHeader: 'x-correlation-id',
      transactionIdHeader: 'x-trace-id',
    },
    redis: {
      instances: [
        {
          mode: 'single',
          instanceName: 'product-cache',
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        },
      ],
    },
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`✅ Server running on http://localhost:${port}`);
  console.log('📋 Endpoints:');
  console.log(`   GET  /health`);
  console.log(`   GET  /products/:id`);
  console.log(`   POST /products`);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down...');
    await syntropyLog.shutdown();
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
