"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConsolePrettyTransport = void 0;
const Transport_1 = require("./Transport");
const chalk_1 = require("chalk");
/**
 * @class BaseConsolePrettyTransport
 * @description Provides common functionality for "pretty" console transports,
 * including color handling and console method selection. Subclasses must
 * implement the `formatLogString` method to define the final output format.
 * @extends {Transport}
 */
class BaseConsolePrettyTransport extends Transport_1.Transport {
    chalk;
    constructor(options) {
        super(options);
        // Instantiate Chalk for coloring console output.
        this.chalk = new chalk_1.Chalk();
    }
    /**
     * The core log method. It handles common logic and delegates specific
     * formatting to the subclass.
     * @param {LogEntry} entry - The log entry to process.
     * @returns {Promise<void>}
     */
    async log(entry) {
        if (entry.level === 'silent') {
            return;
        }
        // Apply the formatter first if it exists.
        const finalObject = this.formatter ? this.formatter.format(entry) : entry;
        // Let the subclass format the final string.
        const logString = this.formatLogString(finalObject);
        // Select the appropriate console method based on the log level.
        const consoleMethod = this.getConsoleMethod(finalObject.level);
        consoleMethod(logString);
    }
    /**
     * Determines which console method to use based on the log level.
     * @param {LogLevelName} level - The log level.
     * @returns {Function} The corresponding console method (e.g., console.log).
     */
    getConsoleMethod(level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        switch (level) {
            case 'fatal':
            case 'error':
                return console.error;
            case 'warn':
                return console.warn;
            default:
                return console.log;
        }
    }
}
exports.BaseConsolePrettyTransport = BaseConsolePrettyTransport;
