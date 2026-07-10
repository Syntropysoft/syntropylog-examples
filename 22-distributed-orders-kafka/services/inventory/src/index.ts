/**
 * Inventory · Express.
 * Consumes `order.created`, reserves stock in Redis, publishes `stock.reserved`.
 * Same correlation id, rehydrated from the Kafka headers. SKU-WATCH is seeded at
 * 0 so some orders deterministically hit the out-of-stock path.
 */
import express from 'express';
import {
  bootstrap,
  env,
  startConsumer,
  createProducer,
  ensureTopics,
  publishEvent,
  createRedis,
  createTracing,
  stockKey,
  ALL_TOPICS,
  SVC_INVENTORY,
  GROUP_INVENTORY,
  TOPIC_ORDER_CREATED,
  TOPIC_STOCK_RESERVED,
  type OrderCreatedEvent,
  type StockReservedEvent,
} from '@distributed/shared';

const SEED_STOCK: Record<string, number> = {
  'SKU-LAPTOP': 10,
  'SKU-PHONE': 25,
  'SKU-HEADPHONES': 100,
  'SKU-WATCH': 0,
};

async function main(): Promise<void> {
  const { logger, contextManager, shutdown } = await bootstrap(SVC_INVENTORY);
  const { tracer, shutdown: shutdownTracing } = createTracing(SVC_INVENTORY, env.COLLECTOR_URL);
  const redis = createRedis();

  // Seed stock once (NX = only if absent).
  for (const [sku, qty] of Object.entries(SEED_STOCK)) {
    await redis.set(stockKey(sku), String(qty), 'NX');
  }

  await ensureTopics(`${SVC_INVENTORY}-admin`, ALL_TOPICS);
  const producer = await createProducer(`${SVC_INVENTORY}-producer`);

  const consumer = await startConsumer<OrderCreatedEvent>({
    clientId: `${SVC_INVENTORY}-consumer`,
    groupId: GROUP_INVENTORY,
    topics: [TOPIC_ORDER_CREATED],
    contextManager,
    logger,
    eachEvent: async ({ value: order, headers }) => {
      tracer.extract(headers); // continue the trace across Kafka
      await tracer.withSpan(
        'consume order.created',
        { orderId: order.orderId },
        () => reserveStock(order),
        'consumer'
      );
    },
  });

  async function reserveStock(order: OrderCreatedEvent): Promise<void> {
    contextManager.set('orderId', order.orderId);
    contextManager.set('operation', 'reserve_stock');
    logger.info({ orderId: order.orderId, itemCount: order.items.length }, 'reserving stock');

    const shortages: StockReservedEvent['shortages'] = [];
    for (const item of order.items) {
      const available = Number((await redis.get(stockKey(item.sku))) ?? 0);
      if (available >= item.qty) {
        await redis.decrby(stockKey(item.sku), item.qty);
      } else {
        shortages.push({ sku: item.sku, requested: item.qty, available });
      }
    }

    const reserved = shortages.length === 0;
    if (reserved) {
      logger.info({ orderId: order.orderId }, 'stock reserved');
    } else {
      logger.warn({ orderId: order.orderId, shortageCount: shortages.length }, 'stock shortage');
    }

    const event: StockReservedEvent = { orderId: order.orderId, reserved, shortages };
    await tracer.withSpan(
      'publish stock.reserved',
      { orderId: order.orderId },
      async () => {
        const traceHeaders: Record<string, string> = {};
        tracer.inject(traceHeaders);
        await publishEvent(producer, TOPIC_STOCK_RESERVED, order.orderId, event, contextManager, traceHeaders);
      },
      'producer'
    );
  }

  const app = express();
  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: SVC_INVENTORY });
  });
  app.get('/stock', async (_req, res) => {
    const out: Record<string, number> = {};
    for (const sku of Object.keys(SEED_STOCK)) {
      out[sku] = Number((await redis.get(stockKey(sku))) ?? 0);
    }
    res.json(out);
  });
  app.listen(env.INVENTORY_PORT, () => {
    logger.info(
      { port: env.INVENTORY_PORT, operation: 'startup' },
      'inventory (Express) listening + consuming order.created'
    );
  });

  const stop = async (): Promise<void> => {
    await consumer.disconnect().catch(() => {});
    await producer.disconnect().catch(() => {});
    await redis.quit().catch(() => {});
    await shutdownTracing();
    await shutdown();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('inventory failed to start:', err);
  process.exit(1);
});
