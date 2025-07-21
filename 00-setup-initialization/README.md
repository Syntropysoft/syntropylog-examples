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

# Example 00: Setup & Initialization

This example demonstrates the **foundation of SyntropyLog**: proper initialization with event handling and graceful shutdown. This is the **essential boilerplate** that every SyntropyLog application needs.

## Why This Example Matters

**Initialization is the most critical part** of using SyntropyLog. Without proper initialization:

- ❌ **Logs won't work** - The framework isn't ready to handle logging
- ❌ **Context won't propagate** - Correlation IDs and context data won't travel between services
- ❌ **Shutdown will be messy** - Pending logs might be lost
- ❌ **Errors won't be handled** - Your app might start in an inconsistent state

## Purpose

The goal of this example is to show:

1. **Proper Initialization**: How to initialize SyntropyLog with event handling
2. **Configuration**: Basic configuration options for the logger
3. **Graceful Shutdown**: How to properly shut down the framework
4. **Error Handling**: Handling initialization and shutdown errors
5. **Process Signals**: Responding to SIGINT and SIGTERM signals
6. **Boilerplate Foundation**: The reusable code that other examples will build upon

## Key Concepts

### Event-Driven Initialization
SyntropyLog uses events to signal when it's ready or if initialization fails. This ensures your application doesn't start logging before the framework is fully initialized.

### Graceful Shutdown
Proper shutdown ensures that all pending log messages are flushed before the process exits, preventing data loss.

### Error Handling
Robust error handling during initialization and shutdown prevents your application from starting in an inconsistent state.

## What is Boilerplate?

**Boilerplate** is the reusable code that every SyntropyLog application needs. This example shows the **essential boilerplate** that you'll see in every other example:

### Core Boilerplate Functions

```typescript
// 1. Initialization with event handling
async function initializeSyntropyLog() {
  return new Promise<void>((resolve, reject) => {
    syntropyLog.on('ready', () => resolve());
    syntropyLog.on('error', (err) => reject(err));
    syntropyLog.init(config);
  });
}

// 2. Graceful shutdown
async function gracefulShutdown() {
  await syntropyLog.shutdown();
}

// 3. Signal handlers
process.on('SIGINT', async () => {
  await gracefulShutdown();
  process.exit(0);
});
```

### Why Boilerplate is Essential

- **Consistency**: Every app initializes and shuts down the same way
- **Reliability**: Event-driven initialization prevents race conditions
- **Maintainability**: Centralized error handling and shutdown logic
- **Reusability**: The same code works for any SyntropyLog application
- **Production Safety**: Ensures logs are flushed before process termination

### Required in ALL Environments

**This boilerplate is NOT optional** - it's **required** in every environment:

```typescript
// Signal handlers ensure graceful shutdown
process.on('SIGTERM', async () => {  // Kubernetes sends SIGTERM
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await gracefulShutdown();  // Flushes pending logs
  process.exit(0);
});

process.on('SIGINT', async () => {   // Ctrl+C in development
  console.log('\n🛑 Received SIGINT, shutting down...');
  await gracefulShutdown();  // Flushes pending logs
  process.exit(0);
});
```

**What happens without proper shutdown:**
- ❌ **Logs lost** - Pending messages never reach your logging system
- ❌ **Correlation broken** - Incomplete traces in distributed systems
- ❌ **Debugging impossible** - Missing context for failed requests
- ❌ **Framework hangs** - SyntropyLog might not terminate properly

**What happens with proper shutdown:**
- ✅ **All logs flushed** - Every pending message is sent before exit
- ✅ **Context preserved** - Complete traces for debugging
- ✅ **Clean termination** - No data loss during restarts
- ✅ **Framework shutdown** - SyntropyLog terminates gracefully

**This pattern is mandatory** - your application won't start or terminate properly without it.

## Security & Best Practices

**This boilerplate is also about security and development best practices:**

### Security
- **Data integrity** - Ensures no sensitive information is lost during shutdown
- **Audit trails** - Complete logs for security monitoring and compliance
- **Resource cleanup** - Prevents memory leaks and resource exhaustion

### Development Best Practices
- **Defensive programming** - Handle all possible termination scenarios
- **Observability** - Always know what your application is doing
- **Reliability** - Applications that start and stop predictably
- **Maintainability** - Consistent patterns across all services

**In later examples**, you'll see this boilerplate extracted into separate files (`boilerplate.ts`) to keep the main application code clean and focused on business logic.

## How to Run

1. **Install Dependencies**:
   From the `00-setup-initialization` directory, run:
   ```bash
   npm install --no-workspaces
   ```
   
   > **⚠️ Important**: Use `--no-workspaces` flag to avoid npm workspace conflicts when installing dependencies in individual examples.

2. **Run the Script**:
   ```bash
   npm run dev
   ```

3. **Test Graceful Shutdown**:
   Press `Ctrl+C` to test the graceful shutdown behavior.

## Expected Output

You should see output similar to this:

```
🚀 Initializing SyntropyLog...
{"level":"info","timestamp":"2025-07-16T23:16:58.879Z","service":"syntropylog-main","message":"SyntropyLog framework initialized successfully."}
✅ SyntropyLog initialized successfully!
{"level":"info","timestamp":"2025-07-16T23:16:58.879Z","service":"main","message":"Application startup complete { serviceName: 'my-app', version: '1.0.0', environment: 'development' }"}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"main","message":"Application is ready to handle requests"}
🔄 Shutting down SyntropyLog gracefully...
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"🔄 LifecycleManager.shutdown() called. Current state: READY"}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"🔄 State changed to SHUTTING_DOWN"}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"Shutting down SyntropyLog framework..."}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"📋 Executing 1 shutdown promises..."}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"✅ Shutdown promises completed"}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"🔍 Starting external process termination..."}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"Found 3 regex-test processes to terminate"}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"syntropylog-main","message":"Terminating 3 external processes..."}
✅ SyntropyLog shutdown completed
{"level":"info","timestamp":"2025-07-16T23:16:59.082Z","service":"syntropylog-main","message":"✅ All regex-test processes terminated successfully"}
{"level":"info","timestamp":"2025-07-16T23:16:59.082Z","service":"syntropylog-main","message":"All managers have been shut down."}
{"level":"info","timestamp":"2025-07-16T23:16:59.082Z","service":"syntropylog-main","message":"✅ State changed to SHUTDOWN"}
```

### What You're Seeing

This output demonstrates several key features:

1. **Structured JSON Logging**: All logs are in JSON format with timestamps, levels, and service names
2. **Lifecycle Management**: Clear state transitions (READY → SHUTTING_DOWN → SHUTDOWN)
3. **Graceful Shutdown**: Proper cleanup of external processes and promises
4. **Framework Logging**: SyntropyLog logs its own internal operations for transparency
5. **Process Management**: Automatic termination of external processes (regex-test in this case)

## Code Structure

- **`initializeSyntropyLog()`**: Handles initialization with event listeners
- **`gracefulShutdown()`**: Manages proper shutdown
- **`main()`**: Orchestrates the application lifecycle
- **Signal Handlers**: Respond to process termination signals

## Next Steps

After understanding this essential boilerplate, you can proceed to:

- **[Example 01: Hello World](./01-hello-world/README.md)** - Learn basic logging with the initialized framework
- **[Example 02: Basic Context](./02-basic-context/README.md)** - See how context propagation works after proper initialization
- **[Example 20: Kafka Correlation](./20-basic-kafka-correlation/README.md)** - See the boilerplate in action with message brokers

**Remember**: Every SyntropyLog application starts with this initialization pattern. Once you understand this, you can build any observability solution with confidence. 