import { Kafka } from 'kafkajs';
import { IBrokerAdapter, BrokerMessage, MessageHandler } from 'syntropylog';
export declare class KafkaAdapter implements IBrokerAdapter {
    private readonly producer;
    private readonly consumer;
    constructor(kafkaInstance: Kafka, groupId: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish(topic: string, message: BrokerMessage): Promise<void>;
    subscribe(topic: string, handler: MessageHandler): Promise<void>;
}
