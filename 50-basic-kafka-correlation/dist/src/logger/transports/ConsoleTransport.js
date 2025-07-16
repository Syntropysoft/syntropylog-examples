"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleTransport = void 0;
const Transport_1 = require("./Transport");
/**
 * @class ConsoleTransport
 * @description A transport that writes logs to the console as a single, serialized JSON string.
 * This format is ideal for log aggregation systems that can parse JSON.
 * @extends {Transport}
 */
class ConsoleTransport extends Transport_1.Transport {
    /**
     * @constructor
     * @param {TransportOptions} [options] - Options for the transport, including level, formatter, and a sanitization engine.
     */
    constructor(options) {
        super(options);
    }
    /**
     * Logs a structured entry to the console as a single JSON string.
     * The entry is first formatted (if a formatter is provided) and then sanitized
     * before being written to the console.
     * @param {LogEntry} entry - The log entry to process.
     * @returns {Promise<void>}
     */
    async log(entry) {
        if (entry.level === 'silent') {
            return;
        }
        // First, apply the formatter if it exists.
        const formattedEntry = this.formatter
            ? this.formatter.format(entry)
            : entry;
        // Then, sanitize the result using the injected engine, if it was provided.
        const sanitizedEntry = this.sanitizationEngine
            ? this.sanitizationEngine.process(formattedEntry)
            : formattedEntry;
        const logString = JSON.stringify(sanitizedEntry);
        switch (formattedEntry.level) {
            case 'fatal':
            case 'error':
                console.error(logString);
                break;
            case 'warn':
                console.warn(logString);
                break;
            default:
                console.log(logString);
                break;
        }
    }
}
exports.ConsoleTransport = ConsoleTransport;
