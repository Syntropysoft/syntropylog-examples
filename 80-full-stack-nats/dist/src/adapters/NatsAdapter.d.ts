import { IBrokerAdapter, BrokerMessage, MessageHandler } from 'syntropylog';
export declare class NatsAdapter implements IBrokerAdapter {
    private natsConnection;
    private codec;
    private subscriptions;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish(topic: string, message: BrokerMessage): Promise<void>;
    subscribe(topic: string, handler: MessageHandler): Promise<void>;
    private natsHeadersToRecord;
}
