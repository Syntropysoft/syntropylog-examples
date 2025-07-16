"use strict";
/**
 * @file src/logger/levels.ts
 * @description Defines the standard log levels, their names, and their numeric severity values.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLevels = void 0;
/**
 * @constant logLevels
 * @description Defines the numeric severity of log levels, based on the Pino logging library standard.
 * Higher numbers indicate higher severity.
 */
exports.logLevels = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
    /**
     * 'silent' is a special level used to disable logging. When a logger's level is set
     * to 'silent', no logs will be processed. Its value is set to Infinity to ensure
     * it is always the highest severity, meaning no log message can meet its threshold.
     */
    silent: Infinity,
};
