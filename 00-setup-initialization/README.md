<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 00: Setup & Initialization

This example demonstrates the **foundation of SyntropyLog**: proper initialization and graceful shutdown. This is the **essential boilerplate** that every SyntropyLog application needs.

## Why This Example Matters

**Initialization is the most critical part** of using SyntropyLog. Without proper initialization:

- ❌ **Logs won't work** — the framework isn't ready to handle logging
- ❌ **Context won't propagate** — correlation IDs won't travel between services
- ❌ **Shutdown will be messy** — pending logs might be lost
- ❌ **Errors won't be handled** — your app might start in an inconsistent state

## Purpose

The goal of this example is to show:

1. **Proper Initialization**: `await syntropyLog.init(config)` — one line, no wrappers
2. **Native Addon Check**: confirm whether the Rust pipeline is active
3. **Graceful Shutdown**: flush all pending logs before the process exits
4. **Error Handling**: handle initialization and shutdown errors
5. **Process Signals**: respond to SIGINT and SIGTERM signals

## Key Concepts

### Direct `await` Initialization

`syntropyLog.init()` returns a `Promise<void>`. Just await it:

```typescript
await syntropyLog.init(config);
```

That's it. No event listeners, no polling, no wrapper functions needed. The framework is fully ready the moment the promise resolves.

You can call it with almost nothing and it just works:

```typescript
await syntropyLog.init({ logger: { serviceName: 'my-app' } });
```

If no transport is configured, SyntropyLog defaults to `ConsoleTransport` (JSON output). You only need to specify transports when you want a different format or destination.

### Native Rust Addon Check

After `init()` resolves, you can check whether the native Rust pipeline is active:

```typescript
if (syntropyLog.isNativeAddonInUse()) {
  console.log('⚡ Native Rust addon active');
} else {
  console.log('ℹ️  Native addon not active — JS pipeline in use');
  console.log('   → Requires Node ≥ 20, supported platform (Linux/macOS/Windows x64/arm64)');
  console.log('   → To force JS mode intentionally: set SYNTROPYLOG_NATIVE_DISABLE=1');
}
```

The Rust addon performs serialize + mask + sanitize in a single native pass. On supported platforms it activates automatically. If it's absent, the JS pipeline handles everything transparently — no behavior change, only throughput difference.

### Graceful Shutdown

Proper shutdown ensures that all pending log messages are flushed before the process exits.

## What is Boilerplate?

**Boilerplate** is the reusable code that every SyntropyLog application needs. This example shows the **essential boilerplate** that you'll see in every other example:

### Core Boilerplate Functions

```typescript
// 1. Initialization — direct await, no wrappers
await syntropyLog.init({
  logger: {
    serviceName: 'my-app',
    level: 'info',
  },
});

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
- **Simplicity**: `await init()` is one line — no Promise wrappers, no event juggling
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

## Configuration Patterns

SyntropyLog does not read config from files or environment variables automatically — all configuration is passed to `init()`. This is intentional: no hidden side effects, no file system access, no surprises in production.

This means **you control how config arrives**. Two common patterns:

### Load from a JSON file

Read the file yourself and pass the result to `init()`:

```typescript
import { readFileSync } from 'fs';
import { syntropyLog } from 'syntropylog';
import type { SyntropyLogConfig } from 'syntropylog';

const config: SyntropyLogConfig = JSON.parse(
  readFileSync('./syntropylog.config.json', 'utf-8')
);

await syntropyLog.init(config);
```

Your `syntropylog.config.json` can contain any valid `SyntropyLogConfig` fields:

```json
{
  "logger": {
    "serviceName": "my-app",
    "level": "info"
  }
}
```

> Transports cannot be JSON-serialized (they are class instances). Define them in code and merge with the loaded config before calling `init()`.

### Drive config from environment variables

Map `process.env` values to the config object before calling `init()`:

```typescript
import { syntropyLog, ConsoleTransport, ClassicConsoleTransport } from 'syntropylog';

await syntropyLog.init({
  logger: {
    serviceName: process.env.SERVICE_NAME ?? 'my-app',
    level: (process.env.LOG_LEVEL ?? 'info') as 'info' | 'debug' | 'error',
    environment: process.env.NODE_ENV ?? 'development',
    transportList: {
      json:     new ConsoleTransport(),
      classic:  new ClassicConsoleTransport(),
    },
    env: {
      development: ['classic'],   // colored output in dev
      production:  ['json'],      // plain JSON in prod
      test:        ['json'],
    },
  },
});
```

The `environment` field activates the matching entry in `env`, which selects which transports are used. Change `NODE_ENV` and the transport set changes automatically — no code modification needed.

### Combine both

You can load the base config from a file and override specific fields from env vars:

```typescript
const fileConfig: SyntropyLogConfig = JSON.parse(
  readFileSync('./syntropylog.config.json', 'utf-8')
);

await syntropyLog.init({
  ...fileConfig,
  logger: {
    ...fileConfig.logger,
    level: (process.env.LOG_LEVEL ?? fileConfig.logger?.level ?? 'info') as 'info',
    environment: process.env.NODE_ENV ?? 'development',
    transportList: { json: new ConsoleTransport() },
    env: { development: ['json'], production: ['json'] },
  },
});
```

---

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

```
ℹ️  Native addon not active — JS pipeline in use
   → Requires Node ≥ 20, supported platform (Linux/macOS/Windows x64/arm64)
   → To force JS mode intentionally: set SYNTROPYLOG_NATIVE_DISABLE=1
{"level":"info","timestamp":"2025-07-16T23:16:58.879Z","service":"main","message":"Application startup complete { serviceName: 'my-app', version: '1.0.0', environment: 'development' }"}
{"level":"info","timestamp":"2025-07-16T23:16:58.880Z","service":"main","message":"Application is ready to handle requests"}
🔄 Shutting down SyntropyLog gracefully...
✅ SyntropyLog shutdown completed
✅ Example completed successfully
```

On Node ≥ 20 with a supported platform the first line becomes:

```
⚡ Native Rust addon active
```

### What You're Seeing

1. **Native addon status**: printed immediately after `init()` — tells you which pipeline is active
2. **Structured JSON logs**: timestamps, levels, and service names in every line
3. **Graceful shutdown**: `shutdown()` flushes all pending logs before the process exits
4. **Signal safety**: SIGINT/SIGTERM handlers call `gracefulShutdown()` to prevent log loss

## Code Structure

- **`initializeSyntropyLog()`**: Calls `await syntropyLog.init(config)` — one line, no wrappers
- **`gracefulShutdown()`**: Calls `syntropyLog.shutdown()` to flush pending logs
- **`main()`**: Orchestrates init → native check → log → shutdown
- **Signal Handlers**: SIGINT/SIGTERM → `gracefulShutdown()` → `process.exit(0)`

## Next Steps

After understanding this essential boilerplate, you can proceed to:

- **[Example 01: Hello World](../01-hello-world/README.md)** — Basic logging with the initialized framework
- **[Example 02: Basic Context](../02-basic-context/README.md)** — Context propagation after proper initialization
- **[Example 09: All Transports](../09-all-transports/README.md)** — `transportList`, `env`, `override`/`add`/`remove`

**Remember**: Every SyntropyLog application starts with this initialization pattern. Once you understand this, you can build any observability solution with confidence. 