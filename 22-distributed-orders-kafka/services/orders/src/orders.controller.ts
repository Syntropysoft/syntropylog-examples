import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { CreateOrderRequest } from '@distributed/shared';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  async create(@Body() body: CreateOrderRequest): Promise<{ ok: true; order: unknown }> {
    const order = await this.orders.createOrder(body);
    return { ok: true, order };
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<unknown> {
    const order = await this.orders.getOrder(id);
    if (!order) throw new NotFoundException(`order ${id} not found`);
    return order;
  }
}
