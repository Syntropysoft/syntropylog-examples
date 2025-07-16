"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syntropyLog = exports.SyntropyLog = void 0;
/**
 * @file src/SyntropyLog.ts
 * @description The main singleton class for the SyntropyLog framework.
 * It orchestrates the initialization and shutdown of all managers.
 */
const zod_1 = require("zod");
const config_schema_1 = require("./config.schema");
const LoggerFactory_1 = require("./logger/LoggerFactory");
const RedisManager_1 = require("./redis/RedisManager");
const sanitizeConfig_1 = require("./utils/sanitizeConfig");
const HttpManager_1 = require("./http/HttpManager");
const BrokerManager_1 = require("./brokers/BrokerManager");
/**
 * @class SyntropyLog
 * @description The main entry point and orchestrator for the framework.
 * It follows the Singleton pattern to ensure a single, consistent instance
 * throughout the application's lifecycle.
 */
class SyntropyLog {
    /** @private The singleton instance. */
    static instance;
    /** @private A flag to ensure the framework is initialized only once. */
    _isInitialized = false;
    /** @private The parsed and sanitized configuration for the framework. */
    config;
    /** @private The factory for creating and managing logger instances. */
    loggerFactory;
    /** @private The manager for Redis client instances. */
    redisManager;
    /** @private The manager for HTTP client instances. */
    httpManager;
    /** @private The manager for message broker client instances. */
    brokerManager;
    /** @private The constructor is private to enforce the singleton pattern. */
    constructor() { }
    /**
     * Gets the singleton instance of the SyntropyLog class.
     * @returns {SyntropyLog} The singleton instance.
     */
    static getInstance() {
        if (!SyntropyLog.instance) {
            SyntropyLog.instance = new SyntropyLog();
        }
        return SyntropyLog.instance;
    }
    /**
     * Initializes the framework with the provided configuration.
     * This method sets up all managers and must be called before any other method.
     * @param {SyntropyLogConfig} config - The configuration object for the framework.
     * @returns {Promise<void>}
     */
    async init(config) {
        if (this._isInitialized) {
            console.warn('[SyntropyLog] Warning: Framework has already been initialized. Ignoring subsequent init() call.');
            return;
        }
        try {
            const parsedConfig = config_schema_1.syntropyLogConfigSchema.parse(config);
            const sanitizedConfig = (0, sanitizeConfig_1.sanitizeConfig)(parsedConfig);
            this.config = sanitizedConfig; // Store the config for later use (e.g., in shutdown)
            this.loggerFactory = new LoggerFactory_1.LoggerFactory(sanitizedConfig);
            const mainLogger = this.loggerFactory.getLogger('syntropylog-main');
            this.redisManager = new RedisManager_1.RedisManager({
                config: sanitizedConfig.redis,
                logger: this.loggerFactory.getLogger('redis-manager'),
            });
            this.httpManager = new HttpManager_1.HttpManager({
                config: sanitizedConfig,
                loggerFactory: this.loggerFactory,
                contextManager: this.loggerFactory.getContextManager(),
            });
            this.brokerManager = new BrokerManager_1.BrokerManager({
                config: sanitizedConfig,
                loggerFactory: this.loggerFactory,
                contextManager: this.loggerFactory.getContextManager(),
            });
            this._isInitialized = true;
            mainLogger.info('SyntropyLog framework initialized successfully.');
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                console.error('[SyntropyLog] Configuration validation failed:', error.errors);
            }
            else {
                console.error('[SyntropyLog] Failed to initialize framework:', error);
            }
            throw error;
        }
    }
    /**
     * Resets the singleton's state.
     * **FOR TESTING AND DEMONSTRATION PURPOSES ONLY.**
     * This is not intended for production use.
     * @private
     */
    _resetForTesting() {
        this._isInitialized = false;
        this.config = undefined;
        this.loggerFactory = undefined;
        this.redisManager = undefined;
        this.httpManager = undefined;
        this.brokerManager = undefined;
    }
    /**
     * Retrieves a logger instance by name.
     * @param {string} [name='default'] - The name of the logger.
     * @returns {ILogger} The logger instance.
     */
    getLogger(name = 'default') {
        this.ensureInitialized();
        // @ts-ignore
        return this.loggerFactory.getLogger(name);
    }
    /**
     * Retrieves a managed Redis client instance by name.
     * @param {string} name - The name of the Redis instance.
     * @returns {IBeaconRedis} The Redis client instance.
     */
    getRedis(name) {
        this.ensureInitialized();
        // @ts-ignore
        return this.redisManager.getInstance(name);
    }
    /**
     * Retrieves a managed and instrumented HTTP client instance by name.
     * @param {string} name - The name of the HTTP client instance.
     * @returns {InstrumentedHttpClient} The HTTP client instance.
     */
    getHttp(name) {
        this.ensureInitialized();
        // @ts-ignore
        return this.httpManager.getInstance(name);
    }
    /**
     * Retrieves the context manager instance.
     * @returns {IContextManager} The context manager.
     */
    getContextManager() {
        this.ensureInitialized();
        // @ts-ignore
        return this.loggerFactory.getContextManager();
    }
    /**
     * Retrieves a managed and instrumented message broker client instance by name.
     * @param {string} name - The name of the broker client instance.
     * @returns {InstrumentedBrokerClient} The broker client instance.
     */
    getBroker(name) {
        this.ensureInitialized();
        // @ts-ignore
        return this.brokerManager.getInstance(name);
    }
    /**
     * Gracefully shuts down all managed clients and flushes log transports.
     * @returns {Promise<void>}
     */
    async shutdown() {
        if (!this._isInitialized || !this.loggerFactory || !this.config || !this.redisManager || !this.httpManager || !this.brokerManager)
            return;
        const mainLogger = this.loggerFactory.getLogger('syntropylog-main');
        mainLogger.info('Shutting down SyntropyLog framework...');
        const timeout = this.config.shutdownTimeout ?? 5000;
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Shutdown timed out after ${timeout}ms`)), timeout));
        try {
            const shutdownWork = Promise.allSettled([
                this.redisManager.shutdown(),
                this.httpManager.shutdown(),
                this.brokerManager.shutdown(),
                this.loggerFactory.flushAllTransports(),
            ]);
            await Promise.race([shutdownWork, timeoutPromise]);
            mainLogger.info('SyntropyLog shut down successfully.');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            mainLogger.warn('Shutdown process timed out.', {
                detail: 'Some resources may not have been released correctly.',
                error: error.message,
            });
        }
        finally {
            this._isInitialized = false;
        }
    }
    /**
     * @private
     * Throws an error if the framework has not been initialized.
     */
    ensureInitialized() {
        if (!this._isInitialized) {
            throw new Error('SyntropyLog has not been initialized. Call init() before accessing clients or loggers.');
        }
    }
}
exports.SyntropyLog = SyntropyLog;
/** The singleton instance of the SyntropyLog framework. */
exports.syntropyLog = SyntropyLog.getInstance();
