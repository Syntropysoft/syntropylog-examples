import { syntropyLog, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';
import { randomUUID } from 'crypto';

/**
 * Example 01: Hello World - Basic Logging
 *
 * This example demonstrates basic logging with SyntropyLog.
 * Initialization is separated as reusable boilerplate.
 *
 * Key concepts:
 * - Getting a logger instance
 * - Basic log levels (info, warn, error)
 * - Structured logging with metadata
 * - Context management and correlation IDs
 */

// Reusable initialization boilerplate (same for all examples)
async function initializeSyntropyLog(serviceName: string = 'my-app') {
  await syntropyLog.init({
    logger: {
      serviceName,
      level: 'info',
      serializerTimeoutMs: 50,
      transports: [
        new ClassicConsoleTransport(), // colored, human-readable
        new ConsoleTransport(),       // JSON (e.g. for log aggregation)
      ],
    },
    context: {
      correlationIdHeader: 'x-correlation-id-test',
    },
  });
}

// Reusable shutdown boilerplate (same for all examples)
async function shutdownSyntropyLog() {
  await syntropyLog.shutdown();
}

// Helper para medir y mostrar tiempo
function lap(label: string, start: number): number {
  const ms = performance.now() - start;
  console.log(`⏱️  ${label}: ${ms.toFixed(2)} ms`);
  return ms;
}

// Main logging logic - this is what changes between examples
async function demonstrateLogging() {
  // Get a logger instance
  let t = performance.now();
  const logger = syntropyLog.getLogger('hello-world');
  const contextManager = syntropyLog.getContextManager();
  lap('getLogger + getContextManager', t);

  // 1. Basic logging WITHOUT context - no correlationId
  t = performance.now();
  await logger.info('Hello World from SyntropyLog! (no context)');
  lap('logger.info (1º, sin context)', t);

  t = performance.now();
  await logger.warn('This is a warning message. (no context)');
  lap('logger.warn (sin context)', t);

  t = performance.now();
  await logger.error('This is an error message. (no context)');
  lap('logger.error (sin context)', t);

  // 2. Logging WITH context - correlationId will appear
  t = performance.now();
  await contextManager.run(async () => {
    const tIn = performance.now();
    const correlationId = randomUUID();
    contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
    lap('  → contextManager.set', tIn);

    let tLog = performance.now();
    await logger.info('Hello World from SyntropyLog! (with context)');
    lap('  → logger.info (con context)', tLog);

    tLog = performance.now();
    await logger.warn('This is a warning message. (with context)');
    lap('  → logger.warn (con context)', tLog);

    tLog = performance.now();
    await logger.error('This is an error message. (with context)');
    lap('  → logger.error (con context)', tLog);

    // 3. Structured logging with metadata
    tLog = performance.now();
    await logger.info('User logged in successfully', {
      userId: 'user-123',
      tenantId: 'tenant-abc',
      timestamp: new Date().toISOString()
    });
    lap('  → logger.info (metadata)', tLog);

    // 4. Logging with different data types
    tLog = performance.now();
    await logger.info('Processing user data', {
      user: { id: 123, name: 'John Doe', email: 'john@example.com' },
      actions: ['login', 'profile_update'],
      metadata: { source: 'web', version: '1.0.0' }
    });
    lap('  → logger.info (objeto anidado)', tLog);

    // 5. Error logging with context
    try {
      throw new Error('Something went wrong');
    } catch (err) {
      tLog = performance.now();
      await logger.error('An error occurred during processing', {
        error: err instanceof Error ? err.message : String(err),
        context: 'user-authentication'
      });
      lap('  → logger.error (con metadata)', tLog);
    }
  });
  lap('contextManager.run (todo el bloque)', t);

  // 6. Logging outside context again
  t = performance.now();
  await logger.info('Back outside context - no correlationId');
  lap('logger.info (fuera de context)', t);

  console.log('✅ Hello World example completed!');
}

// Main function - orchestrates initialization, logging, and shutdown
async function main() {
  console.log('--- Timers (cuello de botella) ---');
  const t0 = performance.now();
  try {
    // 1. Initialize (boilerplate)
    let t = performance.now();
    await initializeSyntropyLog('hello-world-app');
    lap('init (syntropyLog.init)', t);

    if (syntropyLog.isNativeAddonInUse()) {
      console.log('⚡ Native Rust addon active');
    } else {
      console.log('ℹ️  Native addon not active — JS pipeline in use');
      console.log('   → Requires Node ≥ 20, supported platform (Linux/macOS/Windows x64/arm64)');
      console.log('   → To force JS mode intentionally: set SYNTROPYLOG_NATIVE_DISABLE=1');
    }

    // 2. Demonstrate logging (the actual example logic)
    await demonstrateLogging();

    // 3. Shutdown (boilerplate)
    t = performance.now();
    await shutdownSyntropyLog();
    lap('shutdown (syntropyLog.shutdown)', t);

    const total = performance.now() - t0;
    console.log('---');
    console.log(`⏱️  TIEMPO TOTAL: ${total.toFixed(2)} ms`);
    // Nota: los mensajes de syntropylog-main que aparecen después son del proceso de shutdown
    // del framework (LifecycleManager). Idealmente la librería debería resolver shutdown()
    // cuando ya no queden logs por escribir, para que no sigan apareciendo tras "completed".
  } catch (error) {
    console.error('❌ Error in Hello World example:', error);
    process.exit(1);
  }
}

// Run the example
main(); 