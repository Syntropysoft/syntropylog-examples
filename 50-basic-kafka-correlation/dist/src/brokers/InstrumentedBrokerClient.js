"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentedBrokerClient = void 0;
/**
 * @class InstrumentedBrokerClient
 * @description Wraps a user-provided broker adapter to automatically handle
 * logging, context propagation, and distributed tracing.
 */
class InstrumentedBrokerClient {
    adapter;
    logger;
    contextManager;
    /**
     * @constructor
     * @param {IBrokerAdapter} adapter - The concrete broker adapter implementation (e.g., for RabbitMQ, Kafka).
     * @param {ILogger} logger - The logger instance for this client.
     * @param {IContextManager} contextManager - The manager for handling asynchronous contexts.
     */
    constructor(adapter, logger, contextManager) {
        this.adapter = adapter;
        this.logger = logger;
        this.contextManager = contextManager;
    }
    /**
     * Establishes a connection to the broker, wrapping the adapter's connect
     * method with logging.
     * @returns {Promise<void>}
     */
    async connect() {
        this.logger.info('Connecting to broker...');
        await this.adapter.connect();
        this.logger.info('Successfully connected to broker.');
    }
    /**
     * Disconnects from the broker, wrapping the adapter's disconnect method
     * with logging.
     * @returns {Promise<void>}
     */
    async disconnect() {
        this.logger.info('Disconnecting from broker...');
        await this.adapter.disconnect();
        this.logger.info('Successfully disconnected from broker.');
    }
    /**
     * Publishes a message, automatically injecting the current `correlation-id`
     * from the active context into the message headers.
     * @param {string} topic - The destination topic or routing key for the message.
     * @param {BrokerMessage} message - The message to be published. The `correlation-id`
     * will be added to its headers if not present.
     * @returns {Promise<void>}
     */
    async publish(topic, message) {
        const correlationId = this.contextManager.getCorrelationId();
        if (correlationId) {
            // Ensure headers object exists
            if (!message.headers) {
                message.headers = {};
            }
            // Inject the correlation ID
            message.headers[this.contextManager.getCorrelationIdHeaderName()] =
                correlationId;
        }
        this.logger.info({ topic, messageId: message.headers?.['id'] }, 'Publishing message...');
        await this.adapter.publish(topic, message);
        this.logger.info({ topic, messageId: message.headers?.['id'] }, 'Message published successfully.');
    }
    /**
     * Subscribes to a topic. It wraps the user's message handler to automatically
     * create a new asynchronous context for each incoming message. If a `correlation-id`
     * is found in the message headers, it is used to initialize the new context.
     * @param {string} topic - The topic or queue to subscribe to.
     * @param {MessageHandler} handler - The user-provided function to process incoming messages.
     * @returns {Promise<void>}
     */
    async subscribe(topic, handler) {
        this.logger.info({ topic }, 'Subscribing to topic...');
        // Wrap the user's handler to implement automatic context propagation.
        const instrumentedHandler = async (message, controls) => {
            const headerName = this.contextManager.getCorrelationIdHeaderName();
            const correlationId = message.headers?.[headerName]?.toString();
            // This is the core of the instrumentation: run the handler within a new context.
            await this.contextManager.run(async () => {
                if (correlationId) {
                    this.contextManager.set(headerName, correlationId);
                }
                this.logger.info({ topic, correlationId }, 'Received message.');
                // Also wrap the lifecycle controls to add logging for ack/nack actions.
                const instrumentedControls = {
                    ack: async () => {
                        await controls.ack();
                        this.logger.debug({ topic, correlationId }, 'Message acknowledged (ack).');
                    },
                    nack: async (requeue) => {
                        await controls.nack(requeue);
                        this.logger.warn({ topic, correlationId, requeue }, 'Message negatively acknowledged (nack).');
                    },
                };
                // Execute the original user-provided handler.
                await handler(message, instrumentedControls);
            });
        };
        await this.adapter.subscribe(topic, instrumentedHandler);
        this.logger.info({ topic }, 'Successfully subscribed to topic.');
    }
}
exports.InstrumentedBrokerClient = InstrumentedBrokerClient;
