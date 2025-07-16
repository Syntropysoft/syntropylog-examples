"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file src/logger/Logger.ts
 * @description The core implementation of the ILogger interface.
 */
const util_1 = require("util");
const levels_1 = require("./levels");
/**
 * @class Logger
 * @description The core logger implementation. It orchestrates the entire logging
 * pipeline, from argument parsing and level checking to serialization, masking,
 * and dispatching to transports.
 * @implements {ILogger}
 */
class Logger {
    /** @private The manager for handling asynchronous contexts. */
    contextManager;
    /** @private An array of transports to which logs will be dispatched. */
    transports;
    /** @private A set of key-value pairs included in every log entry. */
    bindings;
    /** @private The name of the service, included in every log entry. */
    serviceName;
    /** @private The current minimum log level for this logger instance. */
    level;
    /** @private The engine responsible for serializing complex objects. */
    serializerRegistry;
    /** @private The engine responsible for masking sensitive data. */
    maskingEngine;
    /**
     * @constructor
     * @param {LoggerOptions} opts - The configuration options for the logger.
     */
    constructor(opts) {
        this.contextManager = opts.contextManager;
        this.transports = opts.transports;
        this.level = opts.level ?? 'info';
        this.serviceName = opts.serviceName ?? 'any-service';
        this.bindings = opts.bindings || {};
        this.serializerRegistry = opts.serializerRegistry;
        this.maskingEngine = opts.maskingEngine;
    }
    /**
     * @private
     * The core asynchronous logging method that runs the full processing pipeline.
     * It handles argument parsing, level filtering, serialization, masking,
     * and finally dispatches the processed log entry to the appropriate transports.
     * @param {LogLevelName} level - The severity level of the log message.
     * @param {...any[]} args - The arguments to be logged, following the Pino-like signature (e.g., `(obj, msg, ...)` or `(msg, ...)`).
     * @returns {Promise<void>}
     */
    async _log(level, ...args) {
        const loggerLevelValue = levels_1.logLevels[this.level];
        const messageLevelValue = levels_1.logLevels[level];
        // Discard the log if the message's level is lower than the logger's level.
        if (messageLevelValue < loggerLevelValue) {
            return;
        }
        let meta = {};
        let messageArgs = args;
        // Parse arguments to separate the metadata object from the message and its format arguments.
        if (args.length > 0 &&
            typeof args[0] === 'object' &&
            args[0] !== null &&
            !Array.isArray(args[0])) {
            meta = { ...args[0] };
            messageArgs = args.slice(1);
        }
        // --- Processing Pipeline Execution ---
        // 1. Serialization (awaits the result as it can be async)
        const serializedMeta = await this.serializerRegistry.process(meta, this);
        // 2. Masking (runs on the now-serialized data)
        const maskedMeta = this.maskingEngine.process(serializedMeta);
        // --- End of Pipeline ---
        // Extract 'msg' from metadata if it exists, so it doesn't appear twice.
        const metaMessage = maskedMeta.msg ?? undefined;
        if (metaMessage)
            delete maskedMeta.msg;
        const formattedMessage = messageArgs.length > 0 ? (0, util_1.format)(...messageArgs) : '';
        const finalMessage = [metaMessage, formattedMessage]
            .filter(Boolean)
            .join(' ');
        const entry = {
            ...this.bindings,
            ...maskedMeta,
            context: this.contextManager.getAll(),
            timestamp: new Date().toISOString(),
            level,
            service: this.serviceName,
            msg: finalMessage,
        };
        // Dispatch the final log entry to all transports that are configured
        // to handle this log level.
        const promises = this.transports
            .filter((transport) => {
            if (!transport.level)
                return true;
            const transportLevelValue = levels_1.logLevels[transport.level];
            return messageLevelValue >= transportLevelValue;
        })
            .map((transport) => transport.log(entry));
        // Fire and forget the transport promises. Logging should not block the
        // application, and a failing transport should not crash the process.
        Promise.allSettled(promises).catch(() => {
            // This catch is a safeguard, but allSettled should not reject.
            // We intentionally do nothing here.
        });
    }
    /**
     * Logs a message at the 'info' level.
     * @param {object} obj - An object with properties to be included in the log.
     * @param {string} [message] - The log message, with optional format placeholders.
     * @param {...any[]} args - Values to substitute into the message placeholders.
     */
    info(...args) {
        this._log('info', ...args);
    }
    /**
     * Logs a message at the 'warn' level.
     * @param {object} obj - An object with properties to be included in the log.
     * @param {string} [message] - The log message, with optional format placeholders.
     * @param {...any[]} args - Values to substitute into the message placeholders.
     */
    warn(...args) {
        this._log('warn', ...args);
    }
    /**
     * Logs a message at the 'error' level.
     * @param {object} obj - An object with properties to be included in the log.
     * @param {string} [message] - The log message, with optional format placeholders.
     * @param {...any[]} args - Values to substitute into the message placeholders.
     */
    error(...args) {
        this._log('error', ...args);
    }
    /**
     * Logs a message at the 'debug' level.
     * @param {object} obj - An object with properties to be included in the log.
     * @param {string} [message] - The log message, with optional format placeholders.
     * @param {...any[]} args - Values to substitute into the message placeholders.
     */
    debug(...args) {
        this._log('debug', ...args);
    }
    /**
     * Logs a message at the 'trace' level.
     * @param {object} obj - An object with properties to be included in the log.
     * @param {string} [message] - The log message, with optional format placeholders.
     * @param {...any[]} args - Values to substitute into the message placeholders.
     */
    trace(...args) {
        this._log('trace', ...args);
    }
    /**
     * Logs a message at the 'fatal' level.
     * @param {object} obj - An object with properties to be included in the log.
     * @param {string} [message] - The log message, with optional format placeholders.
     * @param {...any[]} args - Values to substitute into the message placeholders.
     */
    fatal(...args) {
        this._log('fatal', ...args);
    }
    /**
     * Dynamically updates the minimum log level for this logger instance.
     * Any messages with a severity lower than the new level will be ignored.
     * @param {LogLevelName} level - The new minimum log level.
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * Creates a new child logger instance that inherits the parent's configuration
     * and adds a set of persistent key-value bindings.
     * @param {Record<string, JsonValue>} bindings - Key-value pairs to add to the child logger.
     * @returns {ILogger} A new logger instance with the combined bindings.
     */
    child(bindings) {
        return new Logger({
            ...this,
            bindings: { ...this.bindings, ...bindings },
        });
    }
    /**
     * Creates a new logger instance with a `source` field bound to it.
     * @param {string} source - The name of the source (e.g., 'redis', 'AuthModule').
     * @returns {ILogger} A new logger instance with the `source` binding.
     */
    withSource(source) {
        return this.child({ source });
    }
    /**
     * Creates a new logger instance with a `retention` field bound to it.
     * The provided rules object is deep-cloned to ensure immutability.
     * @param {Record<string, any>} rules - A JSON object containing the retention rules.
     * @returns {ILogger} A new logger instance with the `retention` binding.
     */
    withRetention(rules) {
        const safeRules = JSON.parse(JSON.stringify(rules));
        return this.child({ retention: safeRules });
    }
    /**
     * Creates a new logger instance with a `transactionId` field bound to it.
     * @param {string} transactionId - The unique ID of the transaction.
     * @returns {ILogger} A new logger instance with the `transactionId` binding.
     */
    withTransactionId(transactionId) {
        return this.child({ transactionId });
    }
}
exports.Logger = Logger;
