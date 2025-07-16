"use strict";
// =================================================================
//  ARCHIVO 1 (Corregido): src/KafkaAdapter.ts
//  RESPONSABILIDAD: Únicamente definir la clase adaptadora.
//  No sabe nada de singletons ni de cómo se crea la instancia de Kafka.
// =================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaAdapter = void 0;
/**
 * Helper function to normalize Kafka's complex IHeaders object into
 * the simple Record<string, string | Buffer> that our framework expects.
 * @param headers The headers object from a Kafka message.
 * @returns A normalized headers object.
 */
function normalizeKafkaHeaders(headers) {
    if (!headers) {
        return undefined;
    }
    const normalized = {};
    for (const key in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, key)) {
            const value = headers[key];
            // We only accept string or Buffer, and we discard undefined or arrays for simplicity.
            if (typeof value === 'string' || Buffer.isBuffer(value)) {
                normalized[key] = value;
            }
        }
    }
    return normalized;
}
class KafkaAdapter {
    producer;
    consumer;
    // El constructor ahora recibe la instancia de Kafka ya creada.
    // Esto lo hace más flexible y fácil de probar.
    constructor(kafkaInstance, groupId) {
        this.producer = kafkaInstance.producer();
        this.consumer = kafkaInstance.consumer({ groupId });
    }
    async connect() {
        await this.producer.connect();
        await this.consumer.connect();
    }
    async disconnect() {
        await this.producer.disconnect();
        await this.consumer.disconnect();
    }
    async publish(topic, message) {
        await this.producer.send({
            topic,
            messages: [{ value: message.payload, headers: message.headers }],
        });
    }
    async subscribe(topic, handler) {
        await this.consumer.subscribe({ topic, fromBeginning: true });
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const brokerMessage = {
                    payload: message.value,
                    headers: normalizeKafkaHeaders(message.headers),
                };
                const controls = {
                    ack: async () => {
                        await this.consumer.commitOffsets([
                            {
                                topic,
                                partition,
                                offset: (Number(message.offset) + 1).toString(),
                            },
                        ]);
                    },
                    nack: async () => {
                        console.log(`NACK received for message on topic ${topic}.`);
                    },
                };
                await handler(brokerMessage, controls);
            },
        });
    }
}
exports.KafkaAdapter = KafkaAdapter;
//# sourceMappingURL=KafkaAdapter.js.map