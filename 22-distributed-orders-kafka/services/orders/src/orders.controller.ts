import { Body, Controller, Get, Headers, Inject, NotFoundException, Param, Post } from '@nestjs/common';
import type { CreateOrderRequest, Tracer } from '@distributed/shared';
import { OrdersService } from './orders.service';
import { TRACER } from './observability';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    @Inject(TRACER) private readonly tracer: Tracer
  ) {}

  @Post()
  async create(
    @Body() body: CreateOrderRequest,
    @Headers() headers: Record<string, string>
  ): Promise<{ ok: true; order: unknown }> {
    // Continue the trace the gateway started (its traceparent rides the inbound headers).
    this.tracer.extract(headers);
    return this.tracer.withSpan(
      'POST /orders',
      { operation: 'create_order' },
      async () => ({ ok: true as const, order: await this.orders.createOrder(body) }),
      'server'
    );
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<unknown> {
    const order = await this.orders.getOrder(id);
    if (!order) throw new NotFoundException(`order ${id} not found`);
    return order;
  }
}
