# @syntropylog-examples/shared

<p align="center">
  <img src="../assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

Shared utilities and boilerplate for SyntropyLog examples.

## 🚀 Quick Start

This package provides reusable initialization and shutdown functions for all SyntropyLog examples.

```typescript
import { syntropyLog, initializeSyntropyLog, shutdownSyntropyLog, setupGracefulShutdown } from '@syntropylog-examples/shared';

// Setup graceful shutdown
setupGracefulShutdown();

async function main() {
  try {
    // 1. Initialize SyntropyLog
    await initializeSyntropyLog();

    const logger = syntropyLog.getLogger('my-app');
    logger.info('Application started');

    // Your code here...

  } catch (error) {
    console.error('Application error:', error);
  } finally {
    // 4. Always shutdown SyntropyLog
    await shutdownSyntropyLog();
  }
}

main().catch(console.error);
```

## 📦 Installation

This package is part of the SyntropyLog examples monorepo and is automatically available to all examples.

## 🔧 Available Functions

### `initializeSyntropyLog()`
- Initializes SyntropyLog with basic configuration
- Configures logging at 'info' level
- Enables context with correlation ID
- Handles initialization errors

### `shutdownSyntropyLog()`
- Safely closes SyntropyLog
- Ensures all logs are sent
- Handles shutdown errors

### `setupGracefulShutdown()`
- Sets up handlers for SIGINT and SIGTERM
- Allows clean shutdown with Ctrl+C
- Useful for production applications

### `syntropyLog`
- Re-exported instance of SyntropyLog for convenience

## 🎯 Benefits

- ✅ **Reusable**: Single package for all examples
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Consistent**: Same initialization across all examples
- ✅ **Production-ready**: Graceful shutdown included

---

*This shared package ensures consistency and reduces boilerplate across all SyntropyLog examples.* 