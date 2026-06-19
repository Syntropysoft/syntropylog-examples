<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

# Example 12: UniversalAdapter

Send each log to **any backend** (PostgreSQL, MongoDB, Elasticsearch, S3, etc.) by implementing a single **executor**. No vendor lock-in; you receive one object per log (already masked).

## Application signature

The way you wire SyntropyLog into your app is a **signature** made of three parts:

1. **Init** — `ready` / `error` before `init()`; then `getLogger()` and `getContextManager()`.
2. **Context middleware** — wrap each request/handler in `contextManager.run()`; capture correlationId from the incoming header (using the configured header name) when present, otherwise generate via `getCorrelationId()`, so the framework injects it into all logs.
3. **Shutdown** — on close (SIGTERM, etc.), call `syntropyLog.shutdown()` so the framework flushes and tears down cleanly.

This example uses all three; the code is the boilerplate.

## What this example does

- **Init**: `ready` / `error` before `init()`; transports: console + `AdapterTransport` with `UniversalAdapter`.
- **UniversalAdapter**: one `executor(logEntry)` per log; you persist or send the object however you like. Typical shape: `level`, `message`, `serviceName`, `correlationId`, `timestamp`, `meta`. Silent Observer if the executor fails; optional `onError`.
- **Context middleware**: `withContext(contextManager, handler, { correlationId?: string })` runs the handler inside `run()`, sets correlationId from the option (e.g. from request header using `getCorrelationIdHeaderName()`) when provided, otherwise calls `getCorrelationId()` so the ID is always in context.
- **Shutdown**: `gracefulShutdown()` calls `syntropyLog.shutdown()` before exit.
- This example “persists” to an in-memory array and at the end shows the total and a sample entry; in production the executor would call your DB/API.

## How to run it

```bash
npm install
npm run dev
```

You’ll see logs in the console and at the end a summary of entries received by the executor (with `correlationId` on those from the handler).

## Patterns

**1. Init (part of the application signature):**

```typescript
syntropyLog.on('ready', () => resolve());
syntropyLog.on('error', (err) => reject(err));
syntropyLog.init({ logger: { ... }, context: { ... } });
```

**2. Context middleware (part of the application signature):**

Always capture the correlationId from the incoming header when present, using the **configured header name** (`getCorrelationIdHeaderName()`). If it doesn’t come, `getCorrelationId()` generates one. Both cases use the same key so the framework injects it into all logs.

```typescript
function withContext(contextManager, handler, options?: { correlationId?: string }) {
  return contextManager.run(async () => {
    const headerName = contextManager.getCorrelationIdHeaderName();
    if (options?.correlationId != null && options.correlationId !== '') {
      contextManager.set(headerName, options.correlationId);
    }
    contextManager.getCorrelationId(); // from header or generated
    await handler();
  });
}
// Express/Fastify: read header with config name, then run withContext:
// const fromHeader = req.get(contextManager.getCorrelationIdHeaderName());
// withContext(contextManager, () => next(), { correlationId: fromHeader ?? undefined });
```

**3. Shutdown (part of the application signature):**

```typescript
async function gracefulShutdown() {
  await syntropyLog.shutdown();
}
// Call on SIGTERM/SIGINT or before process.exit().
```

**UniversalAdapter (this example):**

```typescript
import { AdapterTransport, UniversalAdapter } from 'syntropylog';

const dbTransport = new AdapterTransport({
  name: 'db',
  adapter: new UniversalAdapter({
    executor: async (logEntry) => {
      await prisma.systemLog.create({
        data: {
          level:         logEntry.level,
          message:       logEntry.message,
          serviceName:   logEntry.serviceName,
          correlationId: logEntry.correlationId,
          payload:       logEntry.meta,
          timestamp:     new Date(logEntry.timestamp),
        },
      });
    },
  }),
});
```

## Related

- **Example 11**: HTTP correlation with Axios (interceptors).
- **SyntropyLog README**: section “Universal Adapter — log to any backend”.

---

### Reminder: application signature

The app signature is three parts. Use this boilerplate in every app. **Always initialize with `await`** before calling `getLogger()` or `getContextManager()`.

**1. Init**

```typescript
syntropyLog.on('ready', () => resolve());
syntropyLog.on('error', (err) => reject(err));
syntropyLog.init({ logger: { ... }, context: { ... } });
// await this promise before getLogger() or getContextManager().
```

**2. Context middleware**

Capture correlationId from the incoming header when present, using the configured header name (`getCorrelationIdHeaderName()`). If absent, `getCorrelationId()` generates one. Same key in both cases.

```typescript
function withContext(contextManager, handler, options?: { correlationId?: string }) {
  return contextManager.run(async () => {
    const headerName = contextManager.getCorrelationIdHeaderName();
    if (options?.correlationId != null && options.correlationId !== '') {
      contextManager.set(headerName, options.correlationId);
    }
    contextManager.getCorrelationId();
    await handler();
  });
}
// Express/Fastify: const fromHeader = req.get(contextManager.getCorrelationIdHeaderName());
// withContext(contextManager, () => next(), { correlationId: fromHeader ?? undefined });
```

**3. Shutdown**

```typescript
async function gracefulShutdown() {
  await syntropyLog.shutdown();
}
// Call on SIGTERM/SIGINT or before process.exit().
```
