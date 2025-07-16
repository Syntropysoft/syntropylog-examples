"use strict";
/**
 * FILE: src/brokers/BrokerManager.ts
 * DESCRIPTION:
 * Manages the lifecycle and creation of multiple instrumented broker client instances,
 * following the same pattern as HttpManager and RedisManager.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerManager = void 0;
const InstrumentedBrokerClient_1 = require("./InstrumentedBrokerClient");
/**
 * @class BrokerManager
 * @description Manages the lifecycle and creation of multiple instrumented broker client instances.
 * It reads the configuration, creates an `InstrumentedBrokerClient` for each defined
 * instance, and provides a way to retrieve them and shut them down gracefully.
 */
class BrokerManager {
    options;
    instances = new Map();
    logger;
    /**
     * @constructor
     * @param {BrokerManagerOptions} options - The configuration options for the manager.
     */
    constructor(options) {
        this.options = options;
        this.logger = this.options.loggerFactory.getLogger('broker-manager');
        const brokerInstances = this.options.config.brokers?.instances || [];
        if (brokerInstances.length === 0) {
            this.logger.debug('BrokerManager initialized, but no broker instances were defined.');
            return;
        }
        for (const instanceConfig of brokerInstances) {
            try {
                const childLogger = this.options.loggerFactory.getLogger(instanceConfig.instanceName);
                // Create the instrumented client, passing the user-provided adapter.
                const instrumentedClient = new InstrumentedBrokerClient_1.InstrumentedBrokerClient(instanceConfig.adapter, // The adapter is injected by the user via config.
                childLogger, this.options.contextManager);
                this.instances.set(instanceConfig.instanceName, instrumentedClient);
                this.logger.info(`Broker client instance "${instanceConfig.instanceName}" created successfully via adapter.`);
            }
            catch (error) {
                this.logger.error(`Failed to create broker client instance "${instanceConfig.instanceName}"`, { error });
                // A potential improvement here is to implement a "failing client" for brokers,
                // which would allow `getInstance` to return a client that always fails,
                // preventing null checks elsewhere in the application.
            }
        }
    }
    /**
     * Retrieves a managed and instrumented broker client instance by its name.
     * @param {string} name - The name of the broker instance to retrieve.
     * @returns {InstrumentedBrokerClient} The requested broker client instance.
     * @throws {Error} If no instance with the given name is found.
     */
    getInstance(name) {
        const instance = this.instances.get(name);
        if (!instance) {
            // Throwing an error is appropriate here. The application expects the instance
            // to be configured and available. Failing fast is better than returning null.
            throw new Error(`Broker client instance with name "${name}" was not found. Check your configuration.`);
        }
        return instance;
    }
    /**
     * Gracefully disconnects all managed broker connections. This is typically
     * called during application shutdown.
     * @returns {Promise<void[]>} A promise that resolves when all clients have
     * attempted to disconnect. It uses `Promise.all` to run disconnections in parallel.
     */
    async shutdown() {
        this.logger.info('Disconnecting all broker clients...');
        const shutdownPromises = Array.from(this.instances.values()).map((instance) => instance.disconnect());
        return Promise.all(shutdownPromises);
    }
}
exports.BrokerManager = BrokerManager;
