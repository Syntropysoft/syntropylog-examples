# Example 00: Setup & Initialization

This example demonstrates how to properly initialize SyntropyLog with event handling and graceful shutdown.

## Purpose

The goal of this example is to show:

1. **Proper Initialization**: How to initialize SyntropyLog with event handling
2. **Configuration**: Basic configuration options for the logger
3. **Graceful Shutdown**: How to properly shut down the framework
4. **Error Handling**: Handling initialization and shutdown errors
5. **Process Signals**: Responding to SIGINT and SIGTERM signals

## Key Concepts

### Event-Driven Initialization
SyntropyLog uses events to signal when it's ready or if initialization fails. This ensures your application doesn't start logging before the framework is fully initialized.

### Graceful Shutdown
Proper shutdown ensures that all pending log messages are flushed before the process exits, preventing data loss.

### Error Handling
Robust error handling during initialization and shutdown prevents your application from starting in an inconsistent state.

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

After understanding initialization, proceed to [Example 01: Hello World](./01-hello-world/README.md) to learn basic logging. 