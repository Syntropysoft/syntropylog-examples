"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsAdapter = void 0;
const nats_1 = require("nats");
class NatsAdapter {
    natsConnection;
    codec = (0, nats_1.JSONCodec)();
    subscriptions = [];
    constructor() {
        // Constructor is now empty, configuration is passed to connect.
    }
    async connect() {
        if (this.natsConnection)
            return;
        // For this example, we'll connect to a default server
        this.natsConnection = await (0, nats_1.connect)({ servers: 'nats://localhost:4222' });
    }
    async disconnect() {
        if (this.natsConnection) {
            await Promise.all(this.subscriptions.map((sub) => sub.drain()));
            await this.natsConnection.drain();
        }
    }
    async publish(topic, message) {
        if (!this.natsConnection) {
            throw new Error('NATS client not connected.');
        }
        const natsHeaders = (0, nats_1.headers)();
        if (message.headers) {
            for (const [key, value] of Object.entries(message.headers)) {
                if (value !== undefined) {
                    natsHeaders.append(key, value.toString());
                }
            }
        }
        this.natsConnection.publish(topic, this.codec.encode(message.payload), {
            headers: natsHeaders,
        });
    }
    async subscribe(topic, handler) {
        if (!this.natsConnection) {
            throw new Error('NATS client not connected.');
        }
        const sub = this.natsConnection.subscribe(topic);
        this.subscriptions.push(sub);
        (async () => {
            for await (const m of sub) {
                try {
                    const msg = {
                        payload: Buffer.from(this.codec.decode(m.data)),
                        headers: this.natsHeadersToRecord(m.headers),
                    };
                    // Call handler with the correct 2-argument signature
                    await handler(msg, {
                        ack: async () => {
                            /* NOP for core NATS */
                        },
                        nack: async () => {
                            /* NOP for core NATS */
                        },
                    });
                }
                catch (err) {
                    // If there's an error (e.g., JSON parsing), we can't process the message,
                    // but we don't want to crash the whole service. We'll log it.
                    // A more robust implementation might publish to a dead-letter queue.
                    console.error(`Failed to process message from topic ${topic}`, err);
                }
            }
        })();
    }
    natsHeadersToRecord(natsHeaders) {
        const record = {};
        if (natsHeaders) {
            for (const key of natsHeaders.keys()) {
                const values = natsHeaders.get(key);
                if (values && values.length > 0) {
                    // Convert arrays to strings for simplicity
                    record[key] = Array.isArray(values) ? values.join(',') : values;
                }
            }
        }
        return record;
    }
}
exports.NatsAdapter = NatsAdapter;
//# sourceMappingURL=NatsAdapter.js.map