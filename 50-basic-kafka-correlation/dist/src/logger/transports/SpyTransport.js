"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpyTransport = void 0;
const Transport_1 = require("./Transport");
/**
 * @class SpyTransport
 * A transport designed for testing. It captures log entries in memory,
 * allowing you to make assertions on what has been logged.
 * @extends {Transport}
 */
class SpyTransport extends Transport_1.Transport {
    entries = [];
    /**
     * @constructor
     * @param {TransportOptions} [options] - Options for the transport, such as level.
     */
    constructor(options) {
        super(options);
    }
    /**
     * Stores the log entry in an in-memory array.
     * @param {LogEntry} entry - The log entry to capture.
     * @returns {Promise<void>}
     */
    async log(entry) {
        this.entries.push(entry);
    }
    /**
     * Returns all log entries captured by this transport.
     * @returns {LogEntry[]} A copy of all captured log entries.
     */
    getEntries() {
        return [...this.entries];
    }
    /**
     * Finds log entries where the properties match the given predicate.
     * Note: This performs a shallow comparison on the entry's properties.
     * @param {Partial<LogEntry> | ((entry: LogEntry) => boolean)} predicate - An object with properties to match or a function that returns true for matching entries.
     * @returns {LogEntry[]} An array of matching log entries.
     */
    findEntries(predicate) {
        if (typeof predicate === 'function') {
            // If the predicate is a function, use it directly with filter.
            return this.entries.filter(predicate);
        }
        // If the predicate is an object, perform a shallow property comparison.
        return this.entries.filter((entry) => {
            return Object.keys(predicate).every((key) => {
                const k = key;
                return predicate[k] === entry[k];
            });
        });
    }
    /**
     * Clears all captured log entries. Call this in your test setup
     * (e.g., `beforeEach`) to ensure test isolation.
     * @returns {void}
     */
    clear() {
        this.entries = [];
    }
    /**
     * Returns the first log entry that was captured.
     * @returns {LogEntry | undefined} The first entry, or undefined if none were captured.
     */
    getFirstEntry() {
        return this.entries[0];
    }
    /**
     * Returns the most recent log entry that was captured.
     * @returns {LogEntry | undefined} The last entry, or undefined if none were captured.
     */
    getLastEntry() {
        return this.entries[this.entries.length - 1];
    }
}
exports.SpyTransport = SpyTransport;
