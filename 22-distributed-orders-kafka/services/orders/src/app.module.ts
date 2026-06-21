import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { KafkaProducerService } from './kafka.provider';

// No `syntropylog/nestjs` module: we wire the logger directly to the main
// singleton (see syntropy-nest-logger.service.ts) — the echeq production pattern.
@Module({
  controllers: [OrdersController],
  providers: [OrdersService, KafkaProducerService],
})
export class AppModule {}
