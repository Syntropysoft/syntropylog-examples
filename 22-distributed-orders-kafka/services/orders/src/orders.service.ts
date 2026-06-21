import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { syntropyLog } from 'syntropylog';
import {
  createRedis,
  publishEvent,
  orderKey,
  SVC_ORDERS,
  TOPIC_ORDER_CREATED,
  type CreateOrderRequest,
  type Order,
  type OrderCreatedEvent,
} from '@distributed/shared';
import { KafkaProducerService } from './kafka.provider';

@Injectable()
export class OrdersService {
  private readonly redis = createRedis();
  // Per-class logger bound to its source — the singleton is initialized before
  // Nest constructs this provider, so getLogger() here is safe.
  private readonly log = syntropyLog.getLogger(SVC_ORDERS).withSource('OrdersService');

  constructor(private readonly kafka: KafkaProducerService) {}

  async createOrder(req: CreateOrderRequest): Promise<Order> {
    const cm = syntropyLog.getContextManager();
    cm.set('customerId', req.customer.id);
    cm.set('operation', 'create_order');

    const total = req.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
    const now = new Date().toISOString();
    const order: Order = {
      id: `ORD-${randomUUID().slice(0, 8)}`,
      status: 'created',
      customer: req.customer,
      items: req.items,
      total,
      createdAt: now,
      updatedAt: now,
    };
    cm.set('orderId', order.id);

    // `email` is masked automatically (by field name) before any transport.
    this.log.info(
      {
        orderId: order.id,
        customerId: req.customer.id,
        email: req.customer.email,
        total,
        itemCount: req.items.length,
      },
      'order received'
    );

    await this.redis.set(orderKey(order.id), JSON.stringify(order));
    this.log.info({ orderId: order.id }, 'order persisted to Redis');

    const event: OrderCreatedEvent = {
      orderId: order.id,
      customer: req.customer,
      items: req.items,
      total,
      payment: req.payment,
    };
    // Correlation id travels in the Kafka message headers (getPropagationHeaders('kafka')).
    await publishEvent(this.kafka.instance, TOPIC_ORDER_CREATED, order.id, event, cm);
    this.log.info(
      { orderId: order.id, topic: TOPIC_ORDER_CREATED },
      'order.created published to Kafka'
    );

    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    const raw = await this.redis.get(orderKey(id));
    return raw ? (JSON.parse(raw) as Order) : null;
  }
}
