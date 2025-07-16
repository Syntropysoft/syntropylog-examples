"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrettyConsoleTransport = void 0;
const BaseConsolePrettyTransport_1 = require("./BaseConsolePrettyTransport");
/**
 * @class PrettyConsoleTransport
 * @description A transport that writes logs to the console in a human-readable, colorful format.
 * Ideal for use in development environments.
 * @extends {BaseConsolePrettyTransport}
 */
class PrettyConsoleTransport extends BaseConsolePrettyTransport_1.BaseConsolePrettyTransport {
    levelColorMap;
    /**
     * @constructor
     * @param {TransportOptions} [options] - Options for the transport, such as level or a formatter.
     */
    constructor(options) {
        super(options);
        this.levelColorMap = {
            fatal: this.chalk.bgRed.white.bold,
            error: this.chalk.red.bold,
            warn: this.chalk.yellow.bold,
            info: this.chalk.blue.bold,
            debug: this.chalk.green,
            trace: this.chalk.gray,
        };
    }
    /**
     * Formats the log object into a pretty, human-readable string.
     * @param {Record<string, any>} logObject - The log object to format.
     * @returns {string} The formatted string.
     */
    formatLogString(logObject) {
        const { timestamp, level, service, msg, ...rest } = logObject;
        const colorizer = this.levelColorMap[level] ||
            this.chalk.white;
        // Format the main log line
        const time = this.chalk.gray(new Date(timestamp).toLocaleTimeString());
        const levelString = colorizer(`[${level.toUpperCase()}]`);
        const serviceString = this.chalk.cyan(`(${service})`);
        const message = msg;
        let logString = `${time} ${levelString} ${serviceString}: ${message}`;
        // Handle additional metadata, ensuring it's not empty
        const metaKeys = Object.keys(rest);
        if (metaKeys.length > 0) {
            // Use a more subtle color for metadata
            const metaString = this.chalk.gray(JSON.stringify(rest, null, 2));
            logString += `\n${metaString}`;
        }
        return logString;
    }
}
exports.PrettyConsoleTransport = PrettyConsoleTransport;
