"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file src/redis/BeaconRedis.ts
 * @description Implementation of IBeaconRedis that wraps a native `redis` client.
 * It centralizes command execution to add instrumentation (logging, metrics, etc.).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeaconRedis = void 0;
/**
 * The primary implementation of the `IBeaconRedis` interface.
 * This class wraps a native `redis` client and uses a central logger
 * to provide instrumentation for all commands. It delegates connection
 * management and command execution to specialized classes.
 * @implements {IBeaconRedis}
 */
class BeaconRedis {
    config;
    /** @private The logger instance for this specific Redis client. */
    logger;
    /** @private Manages the connection state and lifecycle of the native client. */
    connectionManager;
    /** @private Executes the actual commands against the native client. */
    commandExecutor;
    /**
     * Constructs a new BeaconRedis instance.
     * @param {RedisInstanceConfig} config - The configuration specific to this Redis instance.
     * @param {RedisConnectionManager} connectionManager - The manager for the client's connection lifecycle.
     * @param {RedisCommandExecutor} commandExecutor - The executor for sending commands to Redis.
     * @param {ILogger} logger - The pre-configured logger instance for this client.
     */
    constructor(config, connectionManager, commandExecutor, logger) {
        this.config = config;
        this.logger = logger;
        this.connectionManager = connectionManager;
        this.commandExecutor = commandExecutor;
    }
    // --- Lifecycle and Management Methods ---
    /**
     * @inheritdoc
     */
    getInstanceName() {
        return this.config.instanceName;
    }
    /**
     * @inheritdoc
     */
    async connect() {
        return this.connectionManager.ensureReady();
    }
    /**
     * @inheritdoc
     */
    async quit() {
        return this.connectionManager.disconnect();
    }
    /**
     * @inheritdoc
     */
    updateConfig(newConfig) {
        this.logger.info('Dynamically updating Redis instance configuration...', {
            newConfig,
        });
        Object.assign(this.config, newConfig);
    }
    /**
     * @inheritdoc
     * @throws {Error} This method is not yet implemented.
     */
    multi() {
        // TODO: Implement a fully instrumented transaction class.
        // This would need a more complex implementation to queue commands and log them on exec().
        throw new Error('The multi() method is not yet implemented.');
    }
    /**
     * A centralized method for executing and instrumenting any Redis command.
     * It ensures the client is ready, executes the command, logs the outcome
     * (success or failure) with timing information, and handles errors.
     * @private
     * @template T The expected return type of the command.
     * @param {string} commandName - The name of the Redis command (e.g., 'GET', 'HSET').
     * @param {() => Promise<T>} commandFn - A function that, when called, executes the native Redis command.
     * @param {...any[]} params - The parameters passed to the original command, used for logging.
     * @returns {Promise<T>} A promise that resolves with the result of the command.
     * @throws The error from the native command is re-thrown after being logged.
     */
    async _executeCommand(commandName, commandFn, ...params) {
        const startTime = Date.now();
        // Use a base logger with the source pre-set for this command.
        const commandLogger = this.logger.withSource('redis');
        try {
            // 1. Ensure the client is connected and ready before executing.
            await this.connectionManager.ensureReady();
            // 2. Execute the command by calling the provided function.
            const result = await commandFn();
            const durationMs = Date.now() - startTime;
            // 3. On success, log the execution details.
            // Determine the log level from the instance's specific configuration.
            const logLevel = this.config.logging?.onSuccess ?? 'debug';
            const logPayload = {
                command: commandName,
                instance: this.getInstanceName(),
                durationMs,
            };
            // Conditionally add command parameters and return value to the log payload.
            if (this.config.logging?.logCommandValues) {
                logPayload.params = params;
            }
            if (this.config.logging?.logReturnValue) {
                logPayload.result = result;
            }
            // The log is sent to the central pipeline where serialization and masking occur.
            commandLogger[logLevel](logPayload, `Redis command [${commandName}] executed successfully.`);
            return result;
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const errorLogLevel = this.config.logging?.onError ?? 'error';
            // The error object will be serialized by the central SerializerRegistry.
            commandLogger[errorLogLevel]({
                command: commandName,
                instance: this.getInstanceName(),
                durationMs,
                err: error,
                params: this.config.logging?.logCommandValues ? params : undefined,
            }, `Redis command [${commandName}] failed.`);
            throw error;
        }
    }
    // --- Public Command Methods ---
    // Each command now simply calls _executeCommand. The structure remains the same.
    /**
     * @inheritdoc
     */
    async get(key) {
        return this._executeCommand('GET', () => this.commandExecutor.get(key), key);
    }
    /**
     * @inheritdoc
     */
    async set(key, value, ttlSeconds) {
        const options = ttlSeconds ? { EX: ttlSeconds } : undefined;
        return this._executeCommand('SET', () => this.commandExecutor.set(key, value, options), key, value, ttlSeconds);
    }
    /**
     * @inheritdoc
     */
    async del(keys) {
        return this._executeCommand('DEL', () => this.commandExecutor.del(keys), keys);
    }
    /**
     * @inheritdoc
     */
    async exists(keys) {
        return this._executeCommand('EXISTS', () => this.commandExecutor.exists(keys), keys);
    }
    /**
     * @inheritdoc
     */
    async expire(key, seconds) {
        return this._executeCommand('EXPIRE', () => this.commandExecutor.expire(key, seconds), key, seconds);
    }
    /**
     * @inheritdoc
     */
    async ttl(key) {
        return this._executeCommand('TTL', () => this.commandExecutor.ttl(key), key);
    }
    /**
     * @inheritdoc
     */
    async incr(key) {
        return this._executeCommand('INCR', () => this.commandExecutor.incr(key), key);
    }
    /**
     * @inheritdoc
     */
    async decr(key) {
        return this._executeCommand('DECR', () => this.commandExecutor.decr(key), key);
    }
    /**
     * @inheritdoc
     */
    async incrBy(key, increment) {
        return this._executeCommand('INCRBY', () => this.commandExecutor.incrBy(key, increment), key, increment);
    }
    /**
     * @inheritdoc
     */
    async decrBy(key, decrement) {
        return this._executeCommand('DECRBY', () => this.commandExecutor.decrBy(key, decrement), key, decrement);
    }
    /**
     * @inheritdoc
     */
    async hGet(key, field) {
        return this._executeCommand('HGET', async () => (await this.commandExecutor.hGet(key, field)) ?? null, key, field);
    }
    async hSet(key, fieldOrFields, value) {
        if (typeof fieldOrFields === 'string') {
            // Handle single field-value pair.
            return this._executeCommand('HSET', () => this.commandExecutor.hSet(key, fieldOrFields, value), key, fieldOrFields, value);
        }
        // Handle object of field-value pairs.
        return this._executeCommand('HSET', () => this.commandExecutor.hSet(key, fieldOrFields), key, fieldOrFields);
    }
    /**
     * @inheritdoc
     */
    async hGetAll(key) {
        return this._executeCommand('HGETALL', () => this.commandExecutor.hGetAll(key), key);
    }
    /**
     * @inheritdoc
     */
    async hDel(key, fields) {
        return this._executeCommand('HDEL', () => this.commandExecutor.hDel(key, fields), key, fields);
    }
    /**
     * @inheritdoc
     */
    async hExists(key, field) {
        return this._executeCommand('HEXISTS', () => this.commandExecutor.hExists(key, field), key, field);
    }
    /**
     * @inheritdoc
     */
    async hIncrBy(key, field, increment) {
        return this._executeCommand('HINCRBY', () => this.commandExecutor.hIncrBy(key, field, increment), key, field, increment);
    }
    async lPush(key, elementOrElements) {
        return this._executeCommand('LPUSH', () => this.commandExecutor.lPush(key, elementOrElements), key, elementOrElements);
    }
    async rPush(key, elementOrElements) {
        return this._executeCommand('RPUSH', () => this.commandExecutor.rPush(key, elementOrElements), key, elementOrElements);
    }
    /**
     * @inheritdoc
     */
    async lPop(key) {
        return this._executeCommand('LPOP', () => this.commandExecutor.lPop(key), key);
    }
    /**
     * @inheritdoc
     */
    async rPop(key) {
        return this._executeCommand('RPOP', () => this.commandExecutor.rPop(key), key);
    }
    /**
     * @inheritdoc
     */
    async lRange(key, start, stop) {
        return this._executeCommand('LRANGE', () => this.commandExecutor.lRange(key, start, stop), key, start, stop);
    }
    /**
     * @inheritdoc
     */
    async lLen(key) {
        return this._executeCommand('LLEN', () => this.commandExecutor.lLen(key), key);
    }
    /**
     * @inheritdoc
     */
    async lTrim(key, start, stop) {
        return this._executeCommand('LTRIM', () => this.commandExecutor.lTrim(key, start, stop), key, start, stop);
    }
    async sAdd(key, memberOrMembers) {
        return this._executeCommand('SADD', () => this.commandExecutor.sAdd(key, memberOrMembers), key, memberOrMembers);
    }
    /**
     * @inheritdoc
     */
    async sMembers(key) {
        return this._executeCommand('SMEMBERS', () => this.commandExecutor.sMembers(key), key);
    }
    /**
     * @inheritdoc
     */
    async sIsMember(key, member) {
        return this._executeCommand('SISMEMBER', () => this.commandExecutor.sIsMember(key, member), key, member);
    }
    async sRem(key, memberOrMembers) {
        return this._executeCommand('SREM', () => this.commandExecutor.sRem(key, memberOrMembers), key, memberOrMembers);
    }
    /**
     * @inheritdoc
     */
    async sCard(key) {
        return this._executeCommand('SCARD', () => this.commandExecutor.sCard(key), key);
    }
    async zAdd(key, scoreOrMembers, member) {
        // Check if we are using the array overload for multiple members.
        if (Array.isArray(scoreOrMembers)) {
            return this._executeCommand('ZADD', () => this.commandExecutor.zAdd(key, scoreOrMembers), key, scoreOrMembers);
        }
        // Handle single score-member pair.
        return this._executeCommand('ZADD', () => this.commandExecutor.zAdd(key, scoreOrMembers, member), key, scoreOrMembers, member);
    }
    /**
     * @inheritdoc
     */
    async zRange(key, min, max, options) {
        return this._executeCommand('ZRANGE', () => this.commandExecutor.zRange(key, min, max, options), key, min, max, options);
    }
    /**
     * @inheritdoc
     */
    async zRangeWithScores(key, min, max, options) {
        return this._executeCommand('ZRANGE_WITHSCORES', () => this.commandExecutor.zRangeWithScores(key, min, max, options), key, min, max, options);
    }
    /**
     * @inheritdoc
     */
    async zRem(key, members) {
        return this._executeCommand('ZREM', () => this.commandExecutor.zRem(key, members), key, members);
    }
    /**
     * @inheritdoc
     */
    async zCard(key) {
        return this._executeCommand('ZCARD', () => this.commandExecutor.zCard(key), key);
    }
    /**
     * @inheritdoc
     */
    async zScore(key, member) {
        return this._executeCommand('ZSCORE', () => this.commandExecutor.zScore(key, member), key, member);
    }
    /**
     * Subscribes the client to a channel to listen for messages.
     * Note: This is a long-lived command. The initial subscription action is logged,
     * but individual messages received by the listener are not logged by this wrapper.
     * The listener itself should handle any required logging for received messages.
     * @param {string} channel - The channel to subscribe to.
     * @param {(message: string, channel: string) => void} listener - The function to call when a message is received.
     * @returns {Promise<void>} A promise that resolves when the subscription is successful.
     */
    async subscribe(channel, listener) {
        return this._executeCommand('SUBSCRIBE', () => this.commandExecutor.subscribe(channel, listener), channel);
    }
    /**
     * Unsubscribes the client from a channel, or all channels if none is specified.
     * @param {string} [channel] - The optional channel to unsubscribe from.
     * @returns {Promise<void>} A promise that resolves when the unsubscription is successful.
     */
    async unsubscribe(channel) {
        return this._executeCommand('UNSUBSCRIBE', () => this.commandExecutor.unsubscribe(channel), channel);
    }
    /**
     * @inheritdoc
     */
    async ping(message) {
        return this._executeCommand('PING', () => this.connectionManager.ping(message), message);
    }
    /**
     * @inheritdoc
     */
    async info(section) {
        return this._executeCommand('INFO', () => this.connectionManager.info(section), section);
    }
    /**
     * Executes a Lua script on the server.
     * @param {string} script - The Lua script to execute.
     * @param {string[]} keys - An array of key names used by the script, accessible via the `KEYS` table in Lua.
     * @param {string[]} args - An array of argument values for the script, accessible via the `ARGV` table in Lua.
     * @returns {Promise<any>} A promise that resolves with the result of the script execution.
     */
    async eval(script, keys, args) {
        return this._executeCommand('EVAL', () => this.commandExecutor.eval(script, keys, args), script, keys, args);
    }
}
exports.BeaconRedis = BeaconRedis;
