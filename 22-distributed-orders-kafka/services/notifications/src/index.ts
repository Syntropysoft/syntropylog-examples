/**
 * Notifications · worker (no HTTP server).
 * Consumes `payment.processed` and `stock.reserved`, "sends" an email, and
 * advances the order status in Redis. Closes the loop on the same correlation id.
 */
import {
  bootstrap,
  startConsumer,
  ensureTopics,
  createRedis,
  orderKey,
  createTracing,
  env,
  ALL_TOPICS,
  SVC_NOTIFICATIONS,
  GROUP_NOTIFICATIONS,
  TOPIC_PAYMENT_PROCESSED,
  TOPIC_STOCK_RESERVED,
  type PaymentProcessedEvent,
  type StockReservedEvent,
  type Order,
  type OrderStatus,
  type Redis,
} from '@distributed/shared';

async function updateStatus(redis: Redis, orderId: string, status: OrderStatus): Promise<void> {
  const raw = await redis.get(orderKey(orderId));
  if (!raw) return;
  const order = JSON.parse(raw) as Order;
  // Only promote to 'confirmed' if it was already paid.
  if (status === 'reserved' && order.status === 'paid') status = 'confirmed';
  order.status = status;
  order.updatedAt = new Date().toISOString();
  await redis.set(orderKey(orderId), JSON.stringify(order));
}

async function main(): Promise<void> {
  const { logger, contextManager, shutdown } = await bootstrap(SVC_NOTIFICATIONS);
  // Tracing: the trace crosses the broker here too — extract the traceparent the upstream
  // producer put on the message, open a consumer span. Additive; the log bus is untouched.
  const { tracer, shutdown: shutdownTracing } = createTracing(SVC_NOTIFICATIONS, env.COLLECTOR_URL);
  const redis = createRedis();
  await ensureTopics(`${SVC_NOTIFICATIONS}-admin`, ALL_TOPICS);

  const consumer = await startConsumer<PaymentProcessedEvent | StockReservedEvent>({
    clientId: `${SVC_NOTIFICATIONS}-consumer`,
    groupId: GROUP_NOTIFICATIONS,
    topics: [TOPIC_PAYMENT_PROCESSED, TOPIC_STOCK_RESERVED],
    contextManager,
    logger,
    eachEvent: async ({ topic, value, headers }) => {
      tracer.extract(headers); // continue the trace across Kafka
      await tracer.withSpan(
        `consume ${topic}`,
        { orderId: value.orderId },
        async () => {
          contextManager.set('orderId', value.orderId);
          contextManager.set('operation', 'notify');

          if (topic === TOPIC_PAYMENT_PROCESSED) {
            const e = value as PaymentProcessedEvent;
            if (e.approved) {
              logger.info({ orderId: e.orderId, channel: 'email', last4: e.last4 }, 'email sent: payment approved');
            } else {
              logger.warn({ orderId: e.orderId, channel: 'email', reason: e.reason ?? null }, 'email sent: payment declined');
            }
            await updateStatus(redis, e.orderId, e.approved ? 'paid' : 'payment_declined');
          } else {
            const e = value as StockReservedEvent;
            if (e.reserved) {
              logger.info({ orderId: e.orderId, channel: 'email' }, 'email sent: items reserved');
            } else {
              logger.warn({ orderId: e.orderId, channel: 'email' }, 'email sent: out of stock');
            }
            await updateStatus(redis, e.orderId, e.reserved ? 'reserved' : 'out_of_stock');
          }
        },
        'consumer'
      );
    },
  });

  logger.info({ operation: 'startup' }, 'notifications worker consuming payment.processed + stock.reserved');

  const stop = async (): Promise<void> => {
    await consumer.disconnect().catch(() => {});
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
  console.error('notifications failed to start:', err);
  process.exit(1);
});
