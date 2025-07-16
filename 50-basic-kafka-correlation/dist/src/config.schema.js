"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FILE: src/config.schema.ts
 * DESCRIPTION: Defines the Zod validation schemas for the entire library's configuration.
 * These schemas are the single source of truth for the configuration's structure and types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.syntropyLogConfigSchema = exports.brokerConfigSchema = exports.brokerInstanceConfigSchema = exports.httpConfigSchema = exports.httpInstanceConfigSchema = exports.redisConfigSchema = exports.redisInstanceConfigSchema = void 0;
const zod_1 = require("zod");
const Transport_1 = require("./logger/transports/Transport");
/**
 * @description Schema for logger-specific options, including serialization and transports.
 * @private
 */
const loggerOptionsSchema = zod_1.z
    .object({
    name: zod_1.z.string().optional(),
    level: zod_1.z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
        .optional(),
    serviceName: zod_1.z.string().optional(),
    /**
     * An array of transport instances to be used by the logger.
     */
    transports: zod_1.z.array(zod_1.z.instanceof(Transport_1.Transport)).optional(),
    /**
     * A dictionary of custom serializer functions. The key is the field
     * to look for in the log object, and the value is the function that transforms it.
     */
    serializers: zod_1.z
        .record(zod_1.z.string(), zod_1.z.function().args(zod_1.z.any()).returns(zod_1.z.string()))
        .optional(),
    /**
     * The maximum time in milliseconds a custom serializer can run before being timed out.
     * @default 50
     */
    serializerTimeoutMs: zod_1.z.number().int().positive().default(50),
    /** Configuration for pretty printing logs in development. */
    prettyPrint: zod_1.z
        .object({
        enabled: zod_1.z.boolean().optional().default(false),
    })
        .optional(),
})
    .optional();
/**
 * @description Reusable schema for retry options, commonly used in client configurations.
 * @private
 */
const retryOptionsSchema = zod_1.z
    .object({
    maxRetries: zod_1.z.number().int().positive().optional(),
    retryDelay: zod_1.z.number().int().positive().optional(),
})
    .optional();
/**
 * @description Schema for a single Redis instance, using a discriminated union for different connection modes.
 */
exports.redisInstanceConfigSchema = zod_1.z.discriminatedUnion('mode', [
    zod_1.z.object({
        mode: zod_1.z.literal('single'),
        instanceName: zod_1.z.string(),
        url: zod_1.z.string().url(),
        retryOptions: retryOptionsSchema,
        // --- NEW: Granular Logging Configuration for Redis ---
        logging: zod_1.z
            .object({
            /** Level for successful commands. @default 'debug' */
            onSuccess: zod_1.z.enum(['trace', 'debug', 'info']).default('debug'),
            /** Level for failed commands. @default 'error' */
            onError: zod_1.z.enum(['warn', 'error', 'fatal']).default('error'),
            /** Whether to log command parameters. @default true */
            logCommandValues: zod_1.z.boolean().default(true),
            /** Whether to log the return value of commands. @default false */
            logReturnValue: zod_1.z.boolean().default(false),
        })
            .optional(),
    }),
    // Apply the same 'logging' object structure to 'sentinel' and 'cluster' modes
    zod_1.z.object({
        mode: zod_1.z.literal('sentinel'),
        instanceName: zod_1.z.string(),
        name: zod_1.z.string(),
        sentinels: zod_1.z.array(zod_1.z.object({ host: zod_1.z.string(), port: zod_1.z.number() })),
        sentinelPassword: zod_1.z.string().optional(),
        retryOptions: retryOptionsSchema,
        logging: zod_1.z
            .object({
            onSuccess: zod_1.z.enum(['trace', 'debug', 'info']).default('debug'),
            onError: zod_1.z.enum(['warn', 'error', 'fatal']).default('error'),
            logCommandValues: zod_1.z.boolean().default(true),
            logReturnValue: zod_1.z.boolean().default(false),
        })
            .optional(),
    }),
    zod_1.z.object({
        mode: zod_1.z.literal('cluster'),
        instanceName: zod_1.z.string(),
        rootNodes: zod_1.z.array(zod_1.z.object({ host: zod_1.z.string(), port: zod_1.z.number() })),
        logging: zod_1.z
            .object({
            /** Level for successful commands. @default 'debug' */
            onSuccess: zod_1.z.enum(['trace', 'debug', 'info']).default('debug'),
            /** Level for failed commands. @default 'error' */
            onError: zod_1.z.enum(['warn', 'error', 'fatal']).default('error'),
            /** Whether to log command parameters. @default true */
            logCommandValues: zod_1.z.boolean().default(true),
            /** Whether to log the return value of commands. @default false */
            logReturnValue: zod_1.z.boolean().default(false),
        })
            .optional(),
    }),
]);
/**
 * @description Schema for the main Redis configuration block, containing all Redis instances.
 */
exports.redisConfigSchema = zod_1.z
    .object({
    instances: zod_1.z.array(exports.redisInstanceConfigSchema),
})
    .optional();
/** Schema for a single HTTP client instance. */
/**
 * @description Schema for a single HTTP client instance.
 */
exports.httpInstanceConfigSchema = zod_1.z.object({
    instanceName: zod_1.z.string(),
    adapter: zod_1.z.custom((val) => {
        return (typeof val === 'object' &&
            val !== null &&
            'request' in val &&
            typeof val.request === 'function');
    }, "The provided adapter is invalid. It must be an object with a 'request' method."),
    /**
     * Logging settings specific to this HTTP client instance.
     */
    logging: zod_1.z
        .object({
        onSuccess: zod_1.z.enum(['trace', 'debug', 'info']).default('info'),
        onError: zod_1.z.enum(['warn', 'error', 'fatal']).default('error'),
        logSuccessBody: zod_1.z.boolean().default(false),
        logSuccessHeaders: zod_1.z.boolean().default(false),
        onRequest: zod_1.z.enum(['trace', 'debug', 'info']).default('info'),
        logRequestBody: zod_1.z.boolean().default(false),
        logRequestHeaders: zod_1.z.boolean().default(false),
    })
        .partial() // Makes all properties within the logging object optional.
        .optional(),
});
/**
 * @description Schema for the main HTTP configuration block.
 */
exports.httpConfigSchema = zod_1.z
    .object({
    /** An array of HTTP client instance configurations. */
    instances: zod_1.z.array(exports.httpInstanceConfigSchema),
})
    .optional();
/**
 * @description Schema for a single field's masking configuration.
 * @private
 */
const fieldMaskConfigSchema = zod_1.z.object({
    /** The path to the field (e.g., "user.password") or a RegExp to match field names. */
    path: zod_1.z.union([zod_1.z.string(), zod_1.z.instanceof(RegExp)]),
    /** The masking strategy: 'full' or 'partial'. */
    type: zod_1.z.enum(['full', 'partial']),
    /** For 'partial' masking, the number of characters to show at the end. @default 4 */
    showLast: zod_1.z.number().int().positive().optional(),
});
/**
 * @description Schema for the main data masking configuration block.
 */
const maskingConfigSchema = zod_1.z
    .object({
    /** An array of sensitive field names or RegExp. */
    fields: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.instanceof(RegExp)])).optional(),
    /** The character(s) to use for masking. If `style` is 'preserve-length', only the first character is used. */
    maskChar: zod_1.z.string().optional(),
    /** The maximum recursion depth for masking nested objects. Defaults to 3. */
    maxDepth: zod_1.z.number().int().positive().optional(),
    /**
     * The masking style.
     * - `fixed`: (Default) Replaces the value with a fixed-length string ('******'). Maximum security.
     * - `preserve-length`: Replaces the value with a mask string of the same length. Leaks length metadata.
     */
    style: zod_1.z.enum(['fixed', 'preserve-length']).optional(),
})
    .optional();
/**
 * @description Schema for a single message broker client instance.
 * It validates that a valid `IBrokerAdapter` is provided.
 * @private
 */
exports.brokerInstanceConfigSchema = zod_1.z.object({
    instanceName: zod_1.z.string(),
    adapter: zod_1.z.custom((val) => {
        return (typeof val === 'object' &&
            val !== null &&
            typeof val.publish === 'function' &&
            typeof val.subscribe === 'function');
    }, 'The provided broker adapter is invalid.'),
});
/**
 * @description Schema for the main message broker configuration block.
 */
exports.brokerConfigSchema = zod_1.z
    .object({
    /** An array of broker client instance configurations. */
    instances: zod_1.z.array(exports.brokerInstanceConfigSchema),
})
    .optional();
/**
 * @description The main schema for the entire SyntropyLog configuration.
 * This is the single source of truth for validating the user's configuration object.
 */
exports.syntropyLogConfigSchema = zod_1.z.object({
    /** Logger-specific configuration. */
    logger: loggerOptionsSchema,
    /** Redis client configuration. */
    redis: exports.redisConfigSchema,
    /** HTTP client configuration. */
    http: exports.httpConfigSchema,
    /** Message broker client configuration. */
    brokers: exports.brokerConfigSchema,
    /** Centralized data masking configuration. */
    masking: maskingConfigSchema,
    /** Context propagation configuration. */
    context: zod_1.z
        .object({
        /** The HTTP header name to use for the correlation ID. @default 'x-correlation-id' */
        correlationIdHeader: zod_1.z.string().optional(),
    })
        .optional(),
    /**
     * The maximum time in milliseconds to wait for a graceful shutdown before timing out.
     * @default 5000
     */
    shutdownTimeout: zod_1.z
        .number({
        description: 'The maximum time in ms to wait for a graceful shutdown.',
    })
        .int()
        .positive()
        .optional(),
    /** Configuration for the `syntropylog doctor` CLI tool. */
    doctor: zod_1.z
        .object({
        /** An array of rule IDs to disable during a diagnostic run. */
        disableRules: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
