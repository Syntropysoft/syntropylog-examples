"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file src/redis/RedisCommandExecutor.ts
 * @description A thin wrapper around the native `node-redis` client that directly executes commands.
 * This class's sole responsibility is to pass commands to the underlying client.
 * It does not contain any logic for instrumentation, connection management, or error handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCommandExecutor = void 0;
/**
 * Executes Redis commands against a native `node-redis` client.
 * This class acts as a direct pass-through to the client's methods,
 * decoupling the command execution from the instrumentation and connection logic.
 */
class RedisCommandExecutor {
    client;
    /**
     * Constructs a new RedisCommandExecutor.
     * @param {NodeRedisClient} client The native `node-redis` client (single-node or cluster) to execute commands on.
     */
    constructor(client) {
        this.client = client;
    }
    // --- String Commands ---
    /**
     * Executes the native GET command.
     * @param {string} key The key to retrieve.
     * @returns {Promise<string | null>} The value of the key, or null if it does not exist.
     */
    get(key) {
        return this.client.get(key);
    }
    /**
     * Executes the native SET command.
     * @param {string} key The key to set.
     * @param {string} value The value to set.
     * @param {any} [options] Optional SET options (e.g., EX, NX).
     * @returns {Promise<string | null>} 'OK' if successful, or null.
     */
    set(key, value, options) {
        return this.client.set(key, value, options);
    }
    /**
     * Executes the native DEL command.
     * @param {string | string[]} keys The key or keys to delete.
     * @returns {Promise<number>} The number of keys deleted.
     */
    del(keys) {
        return this.client.del(keys);
    }
    /**
     * Executes the native EXISTS command.
     * @param {string | string[]} keys The key or keys to check.
     * @returns {Promise<number>} The number of keys that exist.
     */
    exists(keys) {
        return this.client.exists(keys);
    }
    /**
     * Executes the native EXPIRE command.
     * @param {string} key The key to set the expiration for.
     * @param {number} seconds The time-to-live in seconds.
     * @returns {Promise<boolean>} True if the timeout was set, false otherwise.
     */
    expire(key, seconds) {
        return this.client.expire(key, seconds);
    }
    /**
     * Executes the native TTL command.
     * @param {string} key The key to check.
     * @returns {Promise<number>} The remaining time to live in seconds.
     */
    ttl(key) {
        return this.client.ttl(key);
    }
    /**
     * Executes the native INCR command.
     * @param {string} key The key to increment.
     * @returns {Promise<number>} The value after the increment.
     */
    incr(key) {
        return this.client.incr(key);
    }
    /**
     * Executes the native DECR command.
     * @param {string} key The key to decrement.
     * @returns {Promise<number>} The value after the decrement.
     */
    decr(key) {
        return this.client.decr(key);
    }
    /**
     * Executes the native INCRBY command.
     * @param {string} key The key to increment.
     * @param {number} increment The amount to increment by.
     * @returns {Promise<number>} The value after the increment.
     */
    incrBy(key, increment) {
        return this.client.incrBy(key, increment);
    }
    /**
     * Executes the native DECRBY command.
     * @param {string} key The key to decrement.
     * @param {number} decrement The amount to decrement by.
     * @returns {Promise<number>} The value after the decrement.
     */
    decrBy(key, decrement) {
        return this.client.decrBy(key, decrement);
    }
    // --- Hash Commands ---
    /**
     * Executes the native HGET command.
     * @param {string} key The key of the hash.
     * @param {string} field The field to retrieve.
     * @returns {Promise<string | undefined>} The value of the field, or undefined if it does not exist.
     */
    hGet(key, field) {
        return this.client.hGet(key, field);
    }
    /**
     * Executes the native HSET command.
     * @param {string} key The key of the hash.
     * @param {string | Record<string, any>} fieldOrFields The field to set or an object of field-value pairs.
     * @param {any} [value] The value to set if a single field is provided.
     * @returns {Promise<number>} The number of fields that were added.
     */
    hSet(key, fieldOrFields, value) {
        if (typeof fieldOrFields === 'string') {
            return this.client.hSet(key, fieldOrFields, value);
        }
        // When fieldOrFields is an object, call the two-argument overload.
        return this.client.hSet(key, fieldOrFields);
    }
    /**
     * Executes the native HGETALL command.
     * @param {string} key The key of the hash.
     * @returns {Promise<Record<string, string>>} An object containing all fields and values.
     */
    hGetAll(key) {
        return this.client.hGetAll(key);
    }
    /**
     * Executes the native HDEL command.
     * @param {string} key The key of the hash.
     * @param {string | string[]} fields The field or fields to delete.
     * @returns {Promise<number>} The number of fields that were removed.
     */
    hDel(key, fields) {
        return this.client.hDel(key, fields);
    }
    /**
     * Executes the native HEXISTS command.
     * @param {string} key The key of the hash.
     * @param {string} field The field to check.
     * @returns {Promise<boolean>} True if the field exists, false otherwise.
     */
    hExists(key, field) {
        return this.client.hExists(key, field);
    }
    /**
     * Executes the native HINCRBY command.
     * @param {string} key The key of the hash.
     * @param {string} field The field to increment.
     * @param {number} increment The amount to increment by.
     * @returns {Promise<number>} The value of the field after the increment.
     */
    hIncrBy(key, field, increment) {
        return this.client.hIncrBy(key, field, increment);
    }
    // --- List Commands ---
    /**
     * Executes the native LPUSH command.
     * @param {string} key The key of the list.
     * @param {any | any[]} elements The element or elements to prepend.
     * @returns {Promise<number>} The length of the list after the operation.
     */
    lPush(key, elements) {
        return this.client.lPush(key, elements);
    }
    /**
     * Executes the native RPUSH command.
     * @param {string} key The key of the list.
     * @param {any | any[]} elements The element or elements to append.
     * @returns {Promise<number>} The length of the list after the operation.
     */
    rPush(key, elements) {
        return this.client.rPush(key, elements);
    }
    /**
     * Executes the native LPOP command.
     * @param {string} key The key of the list.
     * @returns {Promise<string | null>} The value of the first element, or null if the list is empty.
     */
    lPop(key) {
        return this.client.lPop(key);
    }
    /**
     * Executes the native RPOP command.
     * @param {string} key The key of the list.
     * @returns {Promise<string | null>} The value of the last element, or null if the list is empty.
     */
    rPop(key) {
        return this.client.rPop(key);
    }
    /**
     * Executes the native LRANGE command.
     * @param {string} key The key of the list.
     * @param {number} start The starting index.
     * @param {number} stop The ending index.
     * @returns {Promise<string[]>} An array of elements in the specified range.
     */
    lRange(key, start, stop) {
        return this.client.lRange(key, start, stop);
    }
    /**
     * Executes the native LLEN command.
     * @param {string} key The key of the list.
     * @returns {Promise<number>} The length of the list.
     */
    lLen(key) {
        return this.client.lLen(key);
    }
    /**
     * Executes the native LTRIM command.
     * @param {string} key The key of the list.
     * @param {number} start The starting index.
     * @param {number} stop The ending index.
     * @returns {Promise<string>} 'OK'.
     */
    lTrim(key, start, stop) {
        return this.client.lTrim(key, start, stop);
    }
    // --- Set Commands ---
    /**
     * Executes the native SADD command.
     * @param {string} key The key of the set.
     * @param {any | any[]} members The member or members to add.
     * @returns {Promise<number>} The number of members added to the set.
     */
    sAdd(key, members) {
        return this.client.sAdd(key, members);
    }
    /**
     * Executes the native SMEMBERS command.
     * @param {string} key The key of the set.
     * @returns {Promise<string[]>} An array of all members in the set.
     */
    sMembers(key) {
        return this.client.sMembers(key);
    }
    /**
     * Executes the native SISMEMBER command.
     * @param {string} key The key of the set.
     * @param {any} member The member to check for.
     * @returns {Promise<boolean>} True if the member is in the set, false otherwise.
     */
    sIsMember(key, member) {
        return this.client.sIsMember(key, member);
    }
    /**
     * Executes the native SREM command.
     * @param {string} key The key of the set.
     * @param {any | any[]} members The member or members to remove.
     * @returns {Promise<number>} The number of members removed from the set.
     */
    sRem(key, members) {
        return this.client.sRem(key, members);
    }
    /**
     * Executes the native SCARD command.
     * @param {string} key The key of the set.
     * @returns {Promise<number>} The cardinality of the set.
     */
    sCard(key) {
        return this.client.sCard(key);
    }
    // --- Sorted Set Commands ---
    /**
     * Executes the native ZADD command.
     * @param {string} key The key of the sorted set.
     * @param {any} scoreOrMembers The score for a single member, or an array of member-score objects.
     * @param {any} [member] The member to add if a single score is provided.
     * @returns {Promise<number>} The number of elements added to the sorted set.
     */
    zAdd(key, scoreOrMembers, member) {
        if (Array.isArray(scoreOrMembers)) {
            return this.client.zAdd(key, scoreOrMembers);
        }
        // For a single member, the native client expects a ZMember object or an array of them.
        return this.client.zAdd(key, { score: scoreOrMembers, value: member });
    }
    /**
     * Executes the native ZRANGE command.
     * @param {string} key The key of the sorted set.
     * @param {string | number} min The minimum index or score.
     * @param {string | number} max The maximum index or score.
     * @param {any} [options] Additional options (e.g., REV).
     * @returns {Promise<string[]>} An array of members in the specified range.
     */
    zRange(key, min, max, options) {
        return this.client.zRange(key, min, max, options);
    }
    /**
     * Executes the native ZRANGE command with the WITHSCORES option.
     * @param {string} key The key of the sorted set.
     * @param {string | number} min The minimum index or score.
     * @param {string | number} max The maximum index or score.
     * @param {any} [options] Additional options (e.g., REV).
     * @returns {Promise<RedisZMember[]>} An array of members and their scores.
     */
    zRangeWithScores(key, min, max, options) {
        return this.client.zRangeWithScores(key, min, max, options);
    }
    /**
     * Executes the native ZREM command.
     * @param {string} key The key of the sorted set.
     * @param {any | any[]} members The member or members to remove.
     * @returns {Promise<number>} The number of members removed.
     */
    zRem(key, members) {
        return this.client.zRem(key, members);
    }
    /**
     * Executes the native ZCARD command.
     * @param {string} key The key of the sorted set.
     * @returns {Promise<number>} The cardinality of the sorted set.
     */
    zCard(key) {
        return this.client.zCard(key);
    }
    /**
     * Executes the native ZSCORE command.
     * @param {string} key The key of the sorted set.
     * @param {any} member The member whose score to retrieve.
     * @returns {Promise<number | null>} The score of the member, or null if it does not exist.
     */
    zScore(key, member) {
        return this.client.zScore(key, member);
    }
    // --- Scripting and Pub/Sub Commands ---
    /**
     * Executes the native EVAL command.
     * @param {string} script The Lua script to execute.
     * @param {string[]} keys An array of key names.
     * @param {string[]} args An array of argument values.
     * @returns {Promise<any>} The result of the script execution.
     */
    eval(script, keys, args) {
        return this.client.eval(script, { keys, arguments: args });
    }
    /**
     * Executes the native SUBSCRIBE command.
     * @param {string} channel The channel to subscribe to.
     * @param {(message: string, channel: string) => void} listener The callback for received messages.
     * @returns {Promise<void>}
     */
    subscribe(channel, listener) {
        return this.client.subscribe(channel, listener);
    }
    /**
     * Executes the native UNSUBSCRIBE command.
     * @param {string} [channel] The channel to unsubscribe from. If omitted, unsubscribes from all.
     * @returns {Promise<void>}
     */
    unsubscribe(channel) {
        if (channel) {
            return this.client.unsubscribe(channel);
        }
        return this.client.unsubscribe();
    }
    /**
     * Executes the native PUBLISH command.
     * @param {string} channel The channel to publish to.
     * @param {string} message The message to publish.
     * @returns {Promise<number>} The number of clients that received the message.
     */
    publish(channel, message) {
        return this.client.publish(channel, message);
    }
}
exports.RedisCommandExecutor = RedisCommandExecutor;
