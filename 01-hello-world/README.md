<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>
## 📖 Table of Contents

# Example 01: Hello World - Basic Logging

This example demonstrates basic logging with SyntropyLog. It includes minimal initialization and graceful shutdown, focusing on logging concepts.

## Prerequisites

This example is self-contained, but for a deeper understanding of initialization patterns, see [Example 00: Setup & Initialization](./00-setup-initialization/README.md).

## Purpose

The goal of this example is to show:

1. **Getting a Logger**: How to obtain a logger instance
2. **Log Levels**: Using different log levels (info, warn, error)
3. **Structured Logging**: Adding metadata to your logs
4. **Error Logging**: Proper error logging with context

## Key Concepts

### Logger Instances
Each part of your application can have its own logger instance with a unique name, making it easier to identify where logs come from.

### Log Levels
Different log levels help categorize the importance and type of information being logged:
- **info**: General information about application flow
- **warn**: Warning conditions that don't stop execution
- **error**: Error conditions that need attention

### Structured Logging
Instead of string concatenation, use objects to add context to your logs. This makes logs more searchable and analyzable.

### Critical: Initialization & Shutdown
⚠️ **CRITICAL**: Initialization and shutdown are **essential** for log integrity:

- **Initialization**: Ensures SyntropyLog is ready to process logs
- **Shutdown**: **Guarantees all pending logs are sent before the process terminates**
- **Graceful Shutdown**: Prevents log loss when the pod dies or restarts

> **💡 Pro Tip**: In production, always implement signal handlers (SIGTERM, SIGINT) to ensure graceful shutdown. See [Example 00: Setup & Initialization](./00-setup-initialization/README.md) for advanced patterns.

## How to Run

1. **Install Dependencies**:
   From the `01-hello-world` directory, run:
   ```bash
   npm install --no-workspaces
   ```
   
   > **⚠️ Important**: Use `--no-workspaces` flag to avoid npm workspace conflicts when installing dependencies in individual examples.

2. **Run the Script**:
   ```bash
   npm run dev
   ```

## Expected Output

You should see output similar to this:

```
{"level":"info","timestamp":"2025-07-16T23:18:47.461Z","service":"syntropylog-main","message":"SyntropyLog framework initialized successfully."}
✅ Hello World example completed!
{"level":"info","timestamp":"2025-07-16T23:18:47.461Z","service":"hello-world","message":"Hello World from SyntropyLog!"}
{"level":"warn","timestamp":"2025-07-16T23:18:47.461Z","service":"hello-world","message":"This is a warning message."}
{"level":"error","timestamp":"2025-07-16T23:18:47.461Z","service":"hello-world","message":"This is an error message."}
{"level":"info","timestamp":"2025-07-16T23:18:47.461Z","service":"hello-world","message":"User logged in successfully {\n  userId: 'user-123',\n  tenantId: 'tenant-abc',\n  timestamp: '2025-07-16T23:18:47.461Z'\n}"}
{"level":"info","timestamp":"2025-07-16T23:18:47.462Z","service":"hello-world","message":"Processing user data {\n  user: { id: 123, name: 'John Doe', email: 'john@example.com' },\n  actions: [ 'login', 'profile_update' ],\n  metadata: { source: 'web', version: '1.0.0' }\n}"}
{"level":"error","timestamp":"2025-07-16T23:18:47.463Z","service":"hello-world","message":"An error occurred during processing {\n  error: 'Something went wrong',\n  stack: 'Error: Something went wrong\\n' +\n    '    at demonstrateLogging...',\n  context: 'user-authentication'\n}"}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"🔄 LifecycleManager.shutdown() called. Current state: READY"}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"🔄 State changed to SHUTTING_DOWN"}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"Shutting down SyntropyLog framework..."}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"📋 Executing 1 shutdown promises..."}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"✅ Shutdown promises completed"}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"🔍 Starting external process termination..."}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"Found 3 regex-test processes to terminate"}
{"level":"info","timestamp":"2025-07-16T23:18:47.463Z","service":"syntropylog-main","message":"Terminating 3 external processes..."}
{"level":"info","timestamp":"2025-07-16T23:18:47.665Z","service":"syntropylog-main","message":"✅ All regex-test processes terminated successfully"}
{"level":"info","timestamp":"2025-07-16T23:18:47.665Z","service":"syntropylog-main","message":"All managers have been shut down."}
{"level":"info","timestamp":"2025-07-16T23:18:47.665Z","service":"syntropylog-main","message":"✅ State changed to SHUTDOWN"}
```

### Performance Notes

⚡ **Notice the Speed**: The entire example runs in just **2 milliseconds** (from 47.461Z to 47.463Z)! This demonstrates SyntropyLog's high-performance design:

- **Non-blocking operations**: Logging doesn't block your application
- **Efficient serialization**: Fast JSON serialization of log data

## ⚠️ **IMPORTANT: Context Management in Examples**

### **🔍 Why Context is Manual in Examples**

In SyntropyLog, **context management is asynchronous** and uses Node.js `AsyncLocalStorage`. This means:

1. **Context is NOT global by default** - it only exists within `contextManager.run()` blocks
2. **Examples are quick demonstrations** - they don't have HTTP requests or message queues that automatically create context
3. **Manual context creation** - we must wrap our logging operations in `contextManager.run()` to get correlation IDs

### **🎯 The Solution: Global Context Wrapper**

```typescript
// ❌ WITHOUT context (no correlationId)
logger.info('Hello World!'); // No correlationId

// ✅ WITH context (has correlationId)
await contextManager.run(async () => {
  logger.info('Hello World!'); // Has correlationId automatically
});
```

### **🔮 The Magic Middleware (2 Lines of Code)**

In production applications, you'll use this simple middleware:

```typescript
app.use(async (req, res, next) => {
  await contextManager.run(async () => {
    // 🎯 MAGIC: Just 2 lines!
    const correlationId = contextManager.getCorrelationId(); // Detects or generates
    contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId); // Sets in context
    
    next();
  });
});
```

**Why this is marvelous:**
- **Intelligent Detection**: `getCorrelationId()` uses existing ID or generates new one
- **Automatic Configuration**: `getCorrelationIdHeaderName()` reads your config
- **Automatic Propagation**: Once set, it propagates to all logs and operations

### **🚀 In Real Applications**

In production applications, context is automatically created by:
- **HTTP middleware** (Express, Fastify, etc.)
- **Message queue handlers** (Kafka, RabbitMQ, etc.)
- **Background job processors**
- **API gateways**

### **📚 Key Takeaway**

**For examples and quick tests**: Wrap all logging in `contextManager.run()`  
**For production apps**: Use SyntropyLog's HTTP/broker adapters for automatic context
- **Optimized shutdown**: Quick cleanup of resources
- **Minimal overhead**: Framework adds negligible latency to your operations

## Code Structure

### Boilerplate (Reusable)
- **`initializeSyntropyLog()`**: Standard initialization - **ALWAYS REQUIRED**
- **`shutdownSyntropyLog()`**: Graceful shutdown - **CRITICAL for production**

### Example Logic
- **`demonstrateLogging()`**: Example-specific logic (logging)
- **`main()`**: Orchestration of steps

### Why This Structure?
- **Separation of concerns**: Boilerplate vs specific logic
- **Reusability**: Initialization functions can be copied to other examples
- **Clarity**: It's obvious what's critical vs what's example-specific

## Best Practices

1. **Use Descriptive Logger Names**: Choose names that identify the component or module
2. **Add Context**: Always include relevant metadata with your logs
3. **Structured Data**: Use objects instead of string concatenation
4. **Error Context**: Include error details and context when logging errors
5. **🚨 ALWAYS Initialize and Shutdown**: Never skip initialization or shutdown - this guarantees log integrity
6. **Handle Process Signals**: In production, implement SIGTERM/SIGINT handlers for graceful shutdown
7. **Copy Boilerplate**: Use the initialization/shutdown functions as templates for your applications

## Next Steps

After understanding basic logging, proceed to [Example 10: Basic Context](./10-basic-context/README.md) to learn about automatic context propagation. 