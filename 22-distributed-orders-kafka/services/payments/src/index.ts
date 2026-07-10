/**
 * Payments · Fastify.
 * Consumes `order.created`, "charges" the card (PII masked automatically),
 * and publishes `payment.processed`. Every log here carries the same
 * correlation id that started in the browser — rehydrated from the Kafka headers.
 */
import Fastify from 'fastify';
import {
  bootstrap,
  env,
  startConsumer,
  createProducer,
  ensureTopics,
  publishEvent,
  createTracing,
  ALL_TOPICS,
  SVC_PAYMENTS,
  GROUP_PAYMENTS,
  TOPIC_ORDER_CREATED,
  TOPIC_PAYMENT_PROCESSED,
  type OrderCreatedEvent,
  type PaymentProcessedEvent,
} from '@distributed/shared';

const APPROVAL_LIMIT = 5000;

async function main(): Promise<void> {
  const { logger, contextManager, shutdown } = await bootstrap(SVC_PAYMENTS);
  // Tracing: the trace crosses the broker here — extract the traceparent orders put on
  // the Kafka message, open a consumer span.
  const { tracer, shutdown: shutdownTracing } = createTracing(SVC_PAYMENTS, env.COLLECTOR_URL);
  await ensureTopics(`${SVC_PAYMENTS}-admin`, ALL_TOPICS);
  const producer = await createProducer(`${SVC_PAYMENTS}-producer`);

  const consumer = await startConsumer<OrderCreatedEvent>({
    clientId: `${SVC_PAYMENTS}-consumer`,
    groupId: GROUP_PAYMENTS,
    topics: [TOPIC_ORDER_CREATED],
    contextManager,
    logger,
    eachEvent: async ({ value: order, headers }) => {
      tracer.extract(headers); // continue the trace across Kafka
      await tracer.withSpan(
        'consume order.created',
        { orderId: order.orderId },
        () => processPayment(order),
        'consumer'
      );
    },
  });

  async function processPayment(order: OrderCreatedEvent): Promise<void> {
      contextManager.set('orderId', order.orderId);
      contextManager.set('operation', 'process_payment');

      // cardNumber + cvv are masked by field name before any transport.
      logger.info(
        {
          orderId: order.orderId,
          cardNumber: order.payment.cardNumber,
          cvv: order.payment.cvv,
          cardHolder: order.payment.cardHolder,
          amount: order.total,
        },
        'processing payment'
      );

      const approved = order.total <= APPROVAL_LIMIT;
      const last4 = order.payment.cardNumber.replace(/\D/g, '').slice(-4);
      const result: PaymentProcessedEvent = {
        orderId: order.orderId,
        approved,
        amount: order.total,
        last4,
        reason: approved ? undefined : 'amount_exceeds_limit',
      };

      if (approved) {
        logger.info({ orderId: order.orderId, last4, amount: order.total }, 'payment approved');
      } else {
        logger.warn({ orderId: order.orderId, amount: order.total }, 'payment declined');
      }

      await tracer.withSpan(
        'publish payment.processed',
        { orderId: order.orderId },
        async () => {
          const traceHeaders: Record<string, string> = {};
          tracer.inject(traceHeaders);
          await publishEvent(
            producer,
            TOPIC_PAYMENT_PROCESSED,
            order.orderId,
            result,
            contextManager,
            traceHeaders
          );
        },
        'producer'
      );
  }

  const app = Fastify();
  app.get('/health', async () => ({ ok: true, service: SVC_PAYMENTS }));
  await app.listen({ port: env.PAYMENTS_PORT, host: '0.0.0.0' });
  logger.info(
    { port: env.PAYMENTS_PORT, operation: 'startup' },
    'payments (Fastify) listening + consuming order.created'
  );

  const stop = async (): Promise<void> => {
    await consumer.disconnect().catch(() => {});
    await producer.disconnect().catch(() => {});
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
  console.error('payments failed to start:', err);
  process.exit(1);
});
