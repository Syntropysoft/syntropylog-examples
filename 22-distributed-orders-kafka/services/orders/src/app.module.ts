import { Module } from '@nestjs/common';
import { SyntropyLogModule } from 'syntropylog/nestjs';
import { syntropyLog } from 'syntropylog';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { KafkaProducerService } from './kafka.provider';

// Official `syntropylog/nestjs` integration. `forRoot({ syntropyLog })` binds the
// module to the ONE runtime singleton we initialize in main.ts — so Nest's own logs
// (startup banner, route mapping) flow through the same masking/matrix/logbus pipeline
// as the app code, and `@InjectLogger()` is available everywhere (the module is global).
// This replaces the earlier hand-rolled SyntropyNestLoggerService workaround, which
// existed only because pre-1.3.0 the subpath bundled a *second*, uninitialized singleton
// ("Logger Factory not available"). Fixed in syntropylog 1.3.0.
@Module({
  imports: [SyntropyLogModule.forRoot({ syntropyLog })],
  controllers: [OrdersController],
  providers: [OrdersService, KafkaProducerService],
})
export class AppModule {}
