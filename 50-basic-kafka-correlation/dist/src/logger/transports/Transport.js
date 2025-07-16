"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = void 0;
/**
 * @class Transport
 * @description Abstract base class for all transports.
 * A transport is responsible for sending a log entry to a specific destination,
 * such as the console, a file, or a remote service.
 */
class Transport {
    /** The minimum log level this transport will process. */
    level;
    /** The formatter instance to transform log entries. */
    formatter;
    /** The engine used to sanitize sensitive data. */
    sanitizationEngine;
    /**
     * @constructor
     * @param {TransportOptions} [options] - The configuration options for this transport.
     */
    constructor(options) {
        this.level = options?.level;
        this.formatter = options?.formatter;
        this.sanitizationEngine = options?.sanitizationEngine;
    }
    /**
     * A method to ensure all buffered logs are written before the application exits.
     * Subclasses should override this if they perform I/O buffering.
     * @returns {Promise<void>} A promise that resolves when flushing is complete.
     */
    async flush() {
        // Default implementation does nothing, assuming no buffering.
        return Promise.resolve();
    }
}
exports.Transport = Transport;
