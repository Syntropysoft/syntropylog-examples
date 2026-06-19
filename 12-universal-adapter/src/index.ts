/**
 * Example 12: UniversalAdapter — send logs to any backend
 *
 * You implement a single executor; SyntropyLog calls it for each log entry (already masked).
 * No vendor lock-in: the same pattern works for PostgreSQL, MongoDB, Elasticsearch, S3, etc.
 *
 * - Init: ready/error before init(); AdapterTransport + UniversalAdapter(executor).
 * - Executor receives one object per log: level, message, serviceName, correlationId, timestamp, meta (and any other fields).
 * - This example "persists" to an in-memory array and prints a summary; replace the executor with your DB/API call.
 */
import {
  syntropyLog,
  ColorfulConsoleTransport,
  AdapterTransport,
  UniversalAdapter,
} from 'syntropylog';

/** In-memory store for this demo. In production the executor would call prisma.systemLog.create(), fetch(url), etc. */
const persistedEntries: unknown[] = [];

async function initializeSyntropyLog() {
  await syntropyLog.init({
    logger: {
      serviceName: 'universal-adapter-example',
      level: 'info',
      serializerTimeoutMs: 100,
      transports: [
        new ColorfulConsoleTransport(),
        new AdapterTransport({
          name: 'custom-backend',
          adapter: new UniversalAdapter({
            executor: (logEntry: unknown) => {
              persistedEntries.push(logEntry);
              // In production: await prisma.systemLog.create({ data: { ... } });
              // or await fetch('https://your-log-api/ingest', { method: 'POST', body: JSON.stringify(logEntry) });
            },
            onError: (err) => {
              console.error('[UniversalAdapter] executor failed:', err);
            },
          }),
        }),
      ],
    },
    context: {
      correlationIdHeader: 'X-Correlation-ID',
    },
  });
}

async function gracefulShutdown() {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  await syntropyLog.shutdown();
  console.log('✅ SyntropyLog shutdown completed');
}

/**
 * Firma del middleware de contexto — igual que init() es la firma de la librería para arrancar,
 * esto es el boilerplate para setear el contextManager en cada request/handler.
 * Una vez dentro del run(), getCorrelationId() asegura que el ID quede en el contexto y el framework lo inyecta en todos los logs.
 *
 * Express/Fastify: app.use((req, res, next) => contextManager.run(() => { contextManager.getCorrelationId(); next(); }));
 */
function withContext(
  contextManager: {
    run: (fn: () => Promise<void>) => Promise<void>;
    getCorrelationId: () => string;
  },
  handler: () => Promise<void>
): Promise<void> {
  return contextManager.run(async () => {
    contextManager.getCorrelationId();
    await handler();
  });
}

async function main() {
  try {
    await initializeSyntropyLog();

    if (syntropyLog.isNativeAddonInUse()) {
      console.log('⚡ Native Rust addon active');
    } else {
      console.log('ℹ️  Native addon not active — JS pipeline in use');
      console.log('   → Requires Node ≥ 20, supported platform (Linux/macOS/Windows x64/arm64)');
      console.log('   → To force JS mode intentionally: set SYNTROPYLOG_NATIVE_DISABLE=1');
    }

    const logger = syntropyLog.getLogger('app');
    const contextManager = syntropyLog.getContextManager();

    await withContext(contextManager, async () => {
      await logger.info('Request started', { path: '/api/users' });
      await logger.info('User list fetched', { count: 42 });
      await logger.warn('Cache miss', { key: 'users:page:1' });
      await logger.info('Request completed', { durationMs: 12 });
    });

    // Summary before shutdown so it doesn't get mixed with framework shutdown logs
    console.log('\n--- Entries "persisted" by UniversalAdapter (executor) ---');
    console.log(`Total: ${persistedEntries.length}`);
    const appEntry = persistedEntries.find(
      (e) => typeof e === 'object' && e !== null && (e as { service?: string }).service === 'app'
    );
    const sample = appEntry ?? persistedEntries[0];
    if (sample !== undefined) {
      console.log('Sample entry (shape you get in your executor):');
      console.log(JSON.stringify(sample, null, 2));
    }

    await gracefulShutdown();
  } catch (err) {
    console.error('❌ Example failed:', err);
    process.exit(1);
  }
}

main();
