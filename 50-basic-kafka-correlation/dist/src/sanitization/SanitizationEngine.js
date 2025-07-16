"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file src/sanitization/SanitizationEngine.ts
 * @description Final security layer that sanitizes log entries before they are written by a transport.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationEngine = void 0;
/**
 * @class SanitizationEngine
 * A security engine that makes log entries safe for printing by stripping
 * potentially malicious control characters, such as ANSI escape codes.
 * This prevents log injection attacks that could exploit terminal vulnerabilities.
 */
class SanitizationEngine {
    maskingEngine;
    /** @private This regex matches ANSI escape codes used for colors, cursor movement, etc. */
    // prettier-ignore
    // eslint-disable-next-line no-control-regex
    ansiRegex = /[\x1b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    /**
     * @constructor
     * The engine is currently not configurable, but the constructor is in place for future enhancements.
     */
    constructor(maskingEngine) {
        this.maskingEngine = maskingEngine;
    }
    /**
     * Processes a log metadata object, sanitizing all its string values.
     * @param {Record<string, any>} meta - The metadata object to sanitize.
     * @returns {Record<string, any>} A new, sanitized metadata object.
     */
    process(meta) {
        let sanitized = this.sanitizeRecursively(meta);
        if (this.maskingEngine) {
            sanitized = this.maskingEngine.process(sanitized);
        }
        return sanitized;
    }
    /**
     * @private
     * Recursively traverses an object or array to sanitize all string values.
     * @param {any} data - The data to process.
     * @returns {any} The sanitized data.
     */
    sanitizeRecursively(data) {
        if (typeof data === 'string') {
            return data.replace(this.ansiRegex, '');
        }
        if (Array.isArray(data)) {
            return data.map((item) => this.sanitizeRecursively(item));
        }
        // Clave: Solo procesar objetos planos para no corromper instancias de clases.
        if (typeof data === 'object' &&
            data !== null &&
            data.constructor === Object) {
            const sanitizedObject = {};
            for (const key in data) {
                // hasOwnProperty sigue siendo una buena práctica aquí.
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    sanitizedObject[key] = this.sanitizeRecursively(data[key]);
                }
            }
            return sanitizedObject;
        }
        // Devuelve cualquier otro tipo de dato (números, booleans, instancias, etc.) sin modificar.
        return data;
    }
}
exports.SanitizationEngine = SanitizationEngine;
