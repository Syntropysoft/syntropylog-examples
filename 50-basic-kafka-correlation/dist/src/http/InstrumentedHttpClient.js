"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file src/http/InstrumentedHttpClient.ts
 * @description This class is the heart of the HTTP instrumentation architecture.
 * It wraps any adapter that complies with `IHttpClientAdapter` and adds a centralized
 * layer of instrumentation (logging, context, timers).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentedHttpClient = void 0;
/**
 * @class InstrumentedHttpClient
 * @description Wraps an `IHttpClientAdapter` to provide automatic logging,
 * context propagation, and timing for all HTTP requests.
 */
class InstrumentedHttpClient {
    adapter;
    logger;
    contextManager;
    options;
    /**
     * @constructor
     * @param {IHttpClientAdapter} adapter - The underlying HTTP client adapter (e.g., AxiosAdapter).
     * @param {ILogger} logger - The logger instance for this client.
     * @param {IContextManager} contextManager - The manager for handling asynchronous contexts.
     * @param {InstrumentorOptions} [options={}] - Configuration options for instrumentation.
     */
    constructor(adapter, logger, contextManager, options = {}) {
        this.adapter = adapter;
        this.logger = logger;
        this.contextManager = contextManager;
        this.options = options;
    }
    /**
     * The single public method. It executes an HTTP request through the wrapped
     * adapter, applying all instrumentation logic.
     * @template T The expected type of the response data.
     * @param {AdapterHttpRequest} request - The generic HTTP request to execute.
     * @returns {Promise<AdapterHttpResponse<T>>} A promise that resolves with the normalized response.
     * @throws {AdapterHttpError | Error} Throws the error from the adapter, which is re-thrown after being logged.
     */
    async request(request) {
        const startTime = Date.now();
        if (!request.headers) {
            request.headers = {};
        }
        // 1. Inject the Correlation ID generically.
        const correlationId = this.contextManager.getCorrelationId();
        if (correlationId) {
            request.headers[this.contextManager.getCorrelationIdHeaderName()] =
                correlationId;
        }
        // 2. Log the start of the request.
        this.logRequestStart(request);
        try {
            // 3. Delegate execution to the adapter.
            const response = await this.adapter.request(request);
            const durationMs = Date.now() - startTime;
            // 4. Log the successful completion of the request.
            this.logRequestSuccess(request, response, durationMs);
            return response;
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            // 5. Log the failure of the request.
            this.logRequestFailure(request, error, durationMs);
            // 6. Re-throw the error so the user's code can handle it.
            throw error;
        }
    }
    /**
     * @private
     * Logs the start of an HTTP request, respecting the configured options.
     * @param {AdapterHttpRequest} request - The outgoing request.
     */
    logRequestStart(request) {
        const logLevel = this.options.logLevel?.onRequest ?? 'info';
        const logPayload = {
            method: request.method,
            url: request.url,
        };
        if (this.options.logRequestHeaders) {
            logPayload.headers = request.headers;
        }
        if (this.options.logRequestBody) {
            logPayload.body = request.body;
        }
        this.logger[logLevel](logPayload, 'Starting HTTP request');
    }
    /**
     * @private
     * Logs the successful completion of an HTTP request.
     * @template T
     * @param {AdapterHttpRequest} request - The original request.
     * @param {AdapterHttpResponse<T>} response - The received response.
     * @param {number} durationMs - The total duration of the request in milliseconds.
     */
    logRequestSuccess(request, response, durationMs) {
        const logLevel = this.options.logLevel?.onSuccess ?? 'info';
        const logPayload = {
            statusCode: response.statusCode,
            url: request.url,
            method: request.method,
            durationMs,
        };
        if (this.options.logSuccessHeaders) {
            logPayload.headers = response.headers;
        }
        if (this.options.logSuccessBody) {
            logPayload.body = response.data;
        }
        this.logger[logLevel](logPayload, 'HTTP response received');
    }
    /**
     * @private
     * Logs the failure of an HTTP request.
     * @param {AdapterHttpRequest} request - The original request.
     * @param {unknown} error - The error that was thrown.
     * @param {number} durationMs - The total duration of the request until failure.
     */
    logRequestFailure(request, error, durationMs) {
        const logLevel = this.options.logLevel?.onError ?? 'error';
        // Use the normalized adapter error if available for richer logging.
        if (error && error.isAdapterError) {
            const adapterError = error;
            const logPayload = {
                err: adapterError, // The logger's serializer will handle this.
                url: request.url,
                method: request.method,
                durationMs,
                response: adapterError.response
                    ? {
                        statusCode: adapterError.response.statusCode,
                        headers: adapterError.response.headers,
                        body: adapterError.response.data,
                    }
                    : 'No response',
            };
            this.logger[logLevel](logPayload, 'HTTP request failed');
        }
        else {
            // If it's an unexpected error, log it as well.
            this.logger[logLevel]({ err: error, url: request.url, method: request.method, durationMs }, 'HTTP request failed with an unexpected error');
        }
    }
}
exports.InstrumentedHttpClient = InstrumentedHttpClient;
