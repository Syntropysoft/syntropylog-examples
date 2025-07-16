"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFactory = void 0;
const Logger_1 = require("./Logger");
const ContextManager_1 = require("../context/ContextManager");
const ConsoleTransport_1 = require("./transports/ConsoleTransport");
const SerializerRegistry_1 = require("../serialization/SerializerRegistry");
const MaskingEngine_1 = require("../masking/MaskingEngine");
const SanitizationEngine_1 = require("../sanitization/SanitizationEngine");
/**
 * @class LoggerFactory
 * @description Manages the lifecycle and configuration of all logging components.
 * An instance of this factory is created by `syntropyLog.init()` and acts as the central
 * orchestrator for creating and managing logger instances and their dependencies.
 */
class LoggerFactory {
    /** @private The manager for handling asynchronous contexts. */
    contextManager;
    /** @private The array of transports to which logs will be dispatched. */
    transports;
    /** @private The global minimum log level for all created loggers. */
    globalLogLevel;
    /** @private The global service name, used as a default for loggers. */
    serviceName;
    /** @private The engine responsible for serializing complex objects. */
    serializerRegistry;
    /** @private The engine responsible for masking sensitive data. */
    maskingEngine;
    /** @private A pool to cache logger instances by name for performance. */
    loggerPool = new Map();
    /**
     * @constructor
     * @param {SyntropyLogConfig} config - The global configuration object.
     * @description Initializes all core logging engines and orchestrates transport setup.
     * It follows a key principle for transport configuration:
     * - **If `config.logger.transports` is provided:** The factory trusts the user's
     *   configuration completely and uses the provided transports as-is. It is the user's
     *   responsibility to configure them correctly (e.g., adding sanitization).
     * - **If no transports are provided:** The factory creates a single, production-safe
     *   `ConsoleTransport` by default, which includes a built-in `SanitizationEngine`.
     */
    constructor(config) {
        this.contextManager = new ContextManager_1.ContextManager();
        // Configure the context manager by passing the entire context config object.
        if (config.context) {
            this.contextManager.configure(config.context);
        }
        // Configure the HTTP manager if http instances are provided
        if (config.http?.instances) {
            // This block is not provided in the original file, so it's commented out.
            // If it were uncommented, it would likely involve configuring the HTTP manager
            // with the provided instances.
        }
        // If the user provides a specific list of transports, we use them directly.
        // We trust the user to have configured them correctly (e.g., providing a
        // SanitizationEngine to their production transports).
        if (config.logger?.transports) {
            this.transports = config.logger.transports;
        }
        else {
            // If no transports are provided, we create a safe, default production transport.
            // This transport includes a default sanitization engine.
            const sanitizationEngine = new SanitizationEngine_1.SanitizationEngine();
            this.transports = [new ConsoleTransport_1.ConsoleTransport({ sanitizationEngine })];
        }
        this.globalLogLevel = config.logger?.level ?? 'info';
        this.serviceName = config.logger?.serviceName ?? 'unknown-service';
        this.serializerRegistry = new SerializerRegistry_1.SerializerRegistry({
            serializers: config.logger?.serializers,
            timeoutMs: config.logger?.serializerTimeoutMs,
        });
        this.maskingEngine = new MaskingEngine_1.MaskingEngine({
            fields: config.masking?.fields,
            maskChar: config.masking?.maskChar,
            maxDepth: config.masking?.maxDepth,
        });
    }
    /**
     * Retrieves a logger instance by name. If the logger does not exist, it is created
     * and cached for subsequent calls.
     * @param {string} [name='default'] - The name of the logger to retrieve.
     * @returns {ILogger} The logger instance.
     */
    getLogger(name = 'default') {
        if (!this.loggerPool.has(name)) {
            const loggerOptions = {
                contextManager: this.contextManager,
                transports: this.transports,
                level: this.globalLogLevel,
                serviceName: name === 'default' ? this.serviceName : name,
                serializerRegistry: this.serializerRegistry,
                maskingEngine: this.maskingEngine,
            };
            const logger = new Logger_1.Logger(loggerOptions);
            this.loggerPool.set(name, logger);
        }
        return this.loggerPool.get(name);
    }
    /**
     * Returns the context manager instance.
     * @returns {IContextManager} The context manager.
     */
    getContextManager() {
        return this.contextManager;
    }
    /**
     * Calls the `flush` method on all configured transports to ensure buffered
     * logs are written before the application exits.
     */
    async flushAllTransports() {
        const flushPromises = this.transports.map((transport) => transport.flush().catch((err) => {
            console.error(`Error flushing transport ${transport.constructor.name}:`, err);
        }));
        await Promise.allSettled(flushPromises);
    }
}
exports.LoggerFactory = LoggerFactory;
