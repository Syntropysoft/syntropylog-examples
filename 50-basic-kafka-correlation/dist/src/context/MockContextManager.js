"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * @file src/context/MockContextManager.ts
 * @description Provides a mock implementation of the IContextManager interface,
 * designed specifically for use in testing environments.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockContextManager = void 0;
/**
 * @class MockContextManager
 * @description A mock implementation of `IContextManager` for testing purposes.
 * It uses a simple in-memory object instead of AsyncLocalStorage,
 * making context management predictable and synchronous in tests.
 * @implements {IContextManager}
 */
class MockContextManager {
    /** @private The in-memory key-value store for the context. */
    store = {};
    /** @private The HTTP header name used for the correlation ID. */
    correlationIdHeader = 'x-correlation-id';
    /** @private The key used for storing the transaction ID in the context. */
    transactionIdKey = 'transactionId';
    /**
     * Configures the mock context manager.
     * @param options The configuration options.
     * @param options.correlationIdHeader The custom header name to use for the correlation ID.
     * @param options.transactionIdKey The custom key to use for the transaction ID.
     */
    configure(options) {
        if (options?.correlationIdHeader) {
            this.correlationIdHeader = options.correlationIdHeader;
        }
        if (options?.transactionIdKey) {
            this.transactionIdKey = options.transactionIdKey;
        }
    }
    /**
     * Simulates running a function within a new, isolated context.
     * It saves the current context, creates a new one inheriting the parent's values,
     * runs the callback, and then restores the original context. This process
     * correctly handles both synchronous and asynchronous callbacks.
     * @template T The return type of the callback.
     * @param {() => T} callback The function to execute within the new context.
     * @returns {T} The result of the callback.
     */
    run(callback) {
        const originalStore = this.store;
        // Create a new store that inherits from the parent context.
        this.store = { ...originalStore };
        let result;
        try {
            result = callback();
        }
        catch (e) {
            // Restore store on synchronous error and re-throw.
            this.store = originalStore;
            throw e;
        }
        // If the callback is async, restore the store after the promise settles.
        if (result instanceof Promise) {
            return result.finally(() => {
                this.store = originalStore;
            });
        }
        // For synchronous callbacks, restore the store immediately.
        this.store = originalStore;
        return result;
    }
    /**
     * Gets a value from the mock context by its key.
     * @template T The expected type of the value.
     * @param {string} key The key of the value to retrieve.
     * @returns The value, or `undefined` if not found.
     */
    get(key) {
        return this.store[key];
    }
    /**
     * Gets a shallow copy of the entire mock context store.
     * @returns {Record<string, any>} An object containing all context data.
     */
    getAll() {
        // Return a shallow copy to prevent direct mutation of the internal store.
        return { ...this.store };
    }
    /**
     * Sets a key-value pair in the mock context.
     * @param {string} key The key for the value.
     * @param {any} value The value to store.
     * @returns {void}
     */
    set(key, value) {
        this.store[key] = value;
    }
    /**
     * Clears the in-memory store.
     * Useful for resetting state between tests (e.g., in a `beforeEach` hook).
     * @returns {void}
     */
    clear() {
        this.store = {};
    }
    /**
     * A convenience method to get the correlation ID from the mock context.
     * @returns {string | undefined} The correlation ID, or undefined if not set.
     */
    getCorrelationId() {
        return this.get(this.correlationIdHeader);
    }
    /**
     * A convenience method to get the transaction ID from the mock context.
     * @returns {string | undefined} The transaction ID, or undefined if not set.
     */
    getTransactionId() {
        return this.get(this.transactionIdKey);
    }
    /**
     * A convenience method to set the transaction ID in the mock context.
     * @param transactionId The transaction ID to set.
     */
    setTransactionId(transactionId) {
        this.set(this.transactionIdKey, transactionId);
    }
    /**
     * Gets the configured HTTP header name used for the correlation ID.
     * @returns {string} The header name.
     */
    getCorrelationIdHeaderName() {
        return this.correlationIdHeader;
    }
    /**
     * Mock implementation for getting trace context headers.
     * In a real tracing scenario, this would be populated.
     * @returns `undefined` as this mock does not implement tracing.
     */
    getTraceContextHeaders() {
        // This mock does not propagate trace headers.
        // It can be extended or spied on in tests if needed.
        return undefined;
    }
}
exports.MockContextManager = MockContextManager;
