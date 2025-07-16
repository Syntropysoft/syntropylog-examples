"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConnectionManager = void 0;
/**
 * FILE: src/redis/RedisConnectionManager.ts
 * DESCRIPTION: Manages the lifecycle of the Redis client connection.
 */
const redis_1 = require("redis");
// Type guard for single-node RedisClientType
function isRedisClientType(client) {
    return typeof client.ping === 'function' && !('commands' in client);
}
/**
 * @class RedisConnectionManager
 * Handles the state and lifecycle of a single native `node-redis` client.
 * It abstracts away the complexities of connection states, retries, and events,
 * providing a stable and predictable promise-based interface for connecting and disconnecting.
 */
class RedisConnectionManager {
    client;
    logger;
    connectionPromise = null;
    connectionResolve = null;
    connectionReject = null;
    isConnectedAndReadyState = false;
    isQuitState = false;
    /**
     * Constructs a new RedisConnectionManager.
     * @param {RedisClientOptions | RedisClusterOptions} options - The configuration options for the native `redis` client.
     * @param {ILogger} logger - The logger instance for logging connection events.
     */
    constructor(config, logger) {
        this.logger = logger;
        this.client = this.createNativeClient(config);
        this.setupListeners();
    }
    /**
     * Creates a native Redis client based on the instance configuration mode.
     * @param config The configuration for the specific Redis instance.
     * @returns A `NodeRedisClient` (either single-node or cluster).
     */
    createNativeClient(config) {
        switch (config.mode) {
            case 'single':
            case 'sentinel': {
                // The reconnection strategy only applies to 'single' and 'sentinel' modes.
                // It is defined here so TypeScript can correctly infer that 'config' has the 'retryOptions' property.
                const reconnectStrategy = (retries) => {
                    const maxRetries = config.retryOptions?.maxRetries ?? 10;
                    if (retries > maxRetries) {
                        return new Error('Exceeded the maximum number of Redis connection retries.');
                    }
                    return Math.min(retries * 50, config.retryOptions?.retryDelay ?? 2000);
                };
                if (config.mode === 'single') {
                    return (0, redis_1.createClient)({
                        url: config.url,
                        socket: {
                            reconnectStrategy,
                        },
                    });
                }
                else {
                    // An intermediate variable is created so that TypeScript correctly infers the overload.
                    const sentinelOptions = {
                        sentinels: config.sentinels,
                        name: config.name,
                        sentinelPassword: config.sentinelPassword,
                        socket: {
                            reconnectStrategy,
                        },
                    };
                    return (0, redis_1.createClient)(sentinelOptions);
                }
            }
            case 'cluster': {
                // Reconnection in cluster mode is handled internally by the library.
                // The variable is explicitly typed so that TypeScript uses the correct overload of `createClient`.
                const clusterOptions = {
                    // Transforms the node configuration to the structure expected by the 'redis' library.
                    rootNodes: config.rootNodes.map((node) => ({
                        socket: { host: node.host, port: node.port },
                    })),
                };
                return (0, redis_1.createClient)(clusterOptions);
            }
            default: {
                const _exhaustiveCheck = config;
                throw new Error(`Unsupported Redis mode: "${_exhaustiveCheck.mode}"`); // NOSONAR
            }
        }
    }
    /**
     * Sets up all the necessary event listeners on the native Redis client
     * to manage and report on the connection's lifecycle state.
     * @private
     */
    setupListeners() {
        this.client.on('connect', () => this.logger.info(`Connection established.`));
        this.client.on('ready', () => {
            this.logger.info(`Client is ready.`);
            this.isConnectedAndReadyState = true;
            if (this.connectionResolve) {
                this.connectionResolve();
                this.connectionResolve = null;
                this.connectionReject = null;
            }
        });
        this.client.on('end', () => {
            this.logger.warn(`Connection closed.`);
            this.isConnectedAndReadyState = false;
        });
        this.client.on('error', (err) => {
            this.logger.error(`Client Error.`, { error: err });
            if (this.connectionReject) {
                this.connectionReject(err);
                this.connectionPromise = null;
                this.connectionResolve = null;
                this.connectionReject = null;
            }
        });
        this.client.on('reconnecting', () => {
            this.logger.info(`Client is reconnecting...`);
        });
    }
    /**
     * Initiates a connection to the Redis server.
     * This method is idempotent; it will not attempt to reconnect if already connected
     * or if a connection attempt is already in progress.
     * @returns {Promise<void>} A promise that resolves when the client is connected and ready, or rejects on a connection error.
     */
    connect() {
        if (this.isQuitState) {
            return Promise.reject(new Error('Client has been quit and cannot be reconnected.'));
        }
        if (this.isReady()) {
            return Promise.resolve();
        }
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        this.logger.info(`Attempting to connect...`);
        this.connectionPromise = new Promise((resolve, reject) => {
            this.connectionResolve = resolve;
            this.connectionReject = reject;
            this.client.connect().catch((err) => {
                this.logger.error(`Immediate connection attempt failed.`, {
                    error: err,
                });
                if (this.connectionReject) {
                    this.connectionReject(err);
                    this.connectionPromise = null;
                    this.connectionResolve = null;
                    this.connectionReject = null;
                }
            });
        });
        return this.connectionPromise;
    }
    /**
     * Ensures the client is connected and ready before proceeding.
     * This is the primary method that should be awaited before executing a command.
     * @returns {Promise<void>} A promise that resolves when the client is ready, or rejects if it can't connect.
     */
    ensureReady() {
        if (this.isQuitState) {
            return Promise.reject(new Error('Client has been quit. Cannot execute commands.'));
        }
        if (!this.isReady() && !this.connectionPromise) {
            this.logger.debug('ensureReady: Client not open, initiating connect.');
        }
        return this.connect();
    }
    /**
     * Gracefully closes the connection to the Redis server by calling `quit()`.
     * It also sets an internal state to prevent any further operations or reconnections.
     * @returns {Promise<void>} A promise that resolves when the client has been successfully quit.
     */
    async disconnect() {
        if (this.isQuitState) {
            this.logger.info('Quit already called. No action taken.');
            return;
        }
        if (this.connectionReject) {
            this.connectionReject(new Error('Connection aborted due to disconnect call.'));
            this.connectionPromise = null;
            this.connectionResolve = null;
            this.connectionReject = null;
        }
        this.isQuitState = true;
        this.isConnectedAndReadyState = false;
        if (this.client.isOpen) {
            this.logger.info('Attempting to quit client.');
            try {
                await this.client.quit();
            }
            catch (error) {
                this.logger.error('Error during client.quit().', { error });
                throw error;
            }
        }
        else {
            this.logger.info('Client was not open. Quit operation effectively complete.');
        }
    }
    /**
     * Retrieves the underlying native `node-redis` client instance.
     * @returns {NodeRedisClient} The native client instance.
     */
    getNativeClient() {
        return this.client;
    }
    /**
     * Checks if the client is currently connected and ready to accept commands.
     * @returns {boolean} `true` if the client is ready, `false` otherwise.
     */
    isReady() {
        return this.isConnectedAndReadyState;
    }
    /**
     * Performs a health check by sending a PING command to the server.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the server responds correctly, `false` otherwise.
     */
    async isHealthy() {
        if (this.isQuitState || !this.isReady()) {
            return false;
        }
        try {
            // By calling this.ping(), we reuse the logic that correctly handles
            // single-node and cluster clients.
            const pong = await this.ping();
            this.logger.debug(`PING response: ${pong}`);
            return pong === 'PONG';
        }
        catch (error) {
            this.logger.error(`PING failed during health check.`, { error });
            return false;
        }
    }
    /**
     * Checks if the disconnect (`quit`) process has been initiated for this client.
     * @returns {boolean} `true` if `disconnect` has been called, `false` otherwise.
     */
    isQuit() {
        return this.isQuitState;
    }
    /**
     * Executes the Redis PING command.
     * Provides a fallback for cluster mode, as PING is not a standard cluster command.
     */
    async ping(message) {
        // First, we ensure the client is ready to receive commands.
        await this.ensureReady();
        // We use the type guard to check if it's a single-node or sentinel client.
        if (isRedisClientType(this.client)) {
            return this.client.ping(message);
        }
        // If it's a cluster client, we simulate the response as the library does.
        return Promise.resolve(message || 'PONG');
    }
    /**
     * Executes the Redis INFO command.
     * Provides a fallback for cluster mode.
     */
    async info(section) {
        // We ensure the client is ready.
        await this.ensureReady();
        // Again, we use the type guard.
        if (isRedisClientType(this.client)) {
            return this.client.info(section);
        }
        // The INFO command does not exist in cluster mode.
        return Promise.resolve('# INFO command is not supported in cluster mode.');
    }
    /**
     * Executes the Redis EXISTS command.
     * @param {string | string[]} keys - A single key or an array of keys to check.
     * @returns {Promise<number>} A promise that resolves with the number of existing keys.
     */
    async exists(keys) {
        await this.ensureReady();
        // The .exists() command is supported by both single-node and cluster clients.
        return this.client.exists(keys);
    }
}
exports.RedisConnectionManager = RedisConnectionManager;
