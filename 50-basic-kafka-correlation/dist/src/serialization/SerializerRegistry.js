"use strict";
/**
 * @file src/serialization/SerializerRegistry.ts
 * @description Manages and safely applies custom log object serializers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializerRegistry = void 0;
/**
 * @class SerializerRegistry
 * @description Manages and applies custom serializer functions to log metadata.
 * It ensures that serializers are executed safely, with timeouts and error handling,
 * to prevent them from destabilizing the logging pipeline.
 */
class SerializerRegistry {
    /** @private A map of field names to their corresponding serializer functions. */
    serializers;
    /** @private The timeout in milliseconds for each serializer execution. */
    timeoutMs;
    /**
     * @constructor
     * @param {SerializerRegistryOptions} [options] - Configuration options for the registry.
     */
    constructor(options) {
        this.serializers = options?.serializers || {};
        this.timeoutMs = options?.timeoutMs || 50; // Default to a 50ms timeout
        // Add a default, built-in serializer for Error objects if one isn't provided.
        if (!this.serializers['err']) {
            this.serializers['err'] = this.defaultErrorSerializer;
        }
    }
    /**
     * Processes a metadata object, applying any matching serializers.
     * @param {Record<string, unknown>} meta - The metadata object from a log call.
     * @param {ILogger} logger - A logger instance to report errors from the serialization process itself.
     * @returns {Promise<Record<string, unknown>>} A new metadata object with serialized values.
     */
    async process(meta, logger) {
        const processedMeta = { ...meta };
        for (const key in processedMeta) {
            if (Object.prototype.hasOwnProperty.call(this.serializers, key)) {
                const serializerFn = this.serializers[key];
                const valueToSerialize = processedMeta[key];
                try {
                    // Execute the serializer within the secure executor
                    const serializedValue = await this.secureExecute(serializerFn, valueToSerialize);
                    processedMeta[key] = serializedValue;
                }
                catch (error) {
                    logger.warn(`Custom serializer for key "${key}" failed or timed out.`, { error: error instanceof Error ? error.message : String(error) });
                    processedMeta[key] =
                        `[SERIALIZER_ERROR: Failed to process key '${key}']`;
                }
            }
        }
        return processedMeta;
    }
    /**
     * @private
     * Safely executes a serializer function with a timeout.
     * @param {(value: unknown) => string} serializerFn - The serializer function to execute.
     * @param {unknown} value - The value to pass to the function.
     * @returns {Promise<string>} A promise that resolves with the serialized string.
     * @throws An error if the serializer throws an exception or times out.
     */
    secureExecute(serializerFn, value) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Serializer function timed out after ${this.timeoutMs}ms.`));
            }, this.timeoutMs);
            try {
                // We use Promise.resolve() to handle both sync and async serializers.
                Promise.resolve(serializerFn(value))
                    .then((result) => {
                    clearTimeout(timer);
                    resolve(result);
                })
                    .catch((err) => {
                    clearTimeout(timer);
                    reject(err);
                });
            }
            catch (err) {
                clearTimeout(timer);
                reject(err);
            }
        });
    }
    /**
     * @private
     * The default serializer for Error objects. It creates a JSON string representation
     * of the error, explicitly including common properties like name, message, and stack.
     * @param {unknown} err - The value to serialize, expected to be an Error.
     * @returns {string} A JSON string representing the error.
     */
    defaultErrorSerializer(err) {
        if (!(err instanceof Error)) {
            // For non-Error objects, a simple stringify is the best we can do.
            return JSON.stringify(err);
        }
        // For Error objects, explicitly pull out known, safe properties.
        const serializedError = {
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
        // Include common additional properties if they exist.
        if ('cause' in err)
            serializedError.cause = err.cause;
        if ('code' in err)
            serializedError.code = err.code;
        return JSON.stringify(serializedError, null, 2);
    }
}
exports.SerializerRegistry = SerializerRegistry;
