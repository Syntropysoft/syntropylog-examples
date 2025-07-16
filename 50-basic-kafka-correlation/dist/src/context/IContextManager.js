"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * @file src/context/IContextManager.ts
 * @description Defines the public interface for an asynchronous context manager.
 * Any class that manages context (such as propagating correlation-id or tracing)
 * must implement this interface. This ensures that different context management
 * strategies (e.g., `AsyncLocalStorage` for production, a simple mock for tests)
 * can be used interchangeably.
 */
Object.defineProperty(exports, "__esModule", { value: true });
