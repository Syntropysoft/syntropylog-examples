import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ALL_TOPICS, createProducer, ensureTopics, SVC_ORDERS } from '@distributed/shared';

type OrdersProducer = Awaited<ReturnType<typeof createProducer>>;

/** Holds one connected Kafka producer for the lifetime of the app. */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer: OrdersProducer | null = null;

  async onModuleInit(): Promise<void> {
    await ensureTopics(`${SVC_ORDERS}-admin`, ALL_TOPICS);
    this.producer = await createProducer(`${SVC_ORDERS}-producer`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer?.disconnect().catch(() => {});
  }

  get instance(): OrdersProducer {
    if (!this.producer) throw new Error('Kafka producer not initialized yet');
    return this.producer;
  }
}
