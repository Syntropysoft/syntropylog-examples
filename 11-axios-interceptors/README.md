<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

# Example 11: Custom HTTP Adapter (Axios + Interceptors)

This example shows how to **instrument Axios** with SyntropyLog without using the framework’s built-in HTTP API. You pass the **logger** and **context manager** into your own Axios instance; you only log, and the framework handles correlation, masking, and transport.

## What this example does

- **Axios** with request/response interceptors.
- **Logger** and **context manager** from SyntropyLog (injected from `index.ts`); the adapter does not import syntropylog.
- **Correlation ID**: set on the outgoing request header and present in every log (injected by the framework from context — we don’t add it to the payload).
- **Timing**: each request logs its own `durationMs`; a small “middleware” (`runWithTiming`) wraps the flow and logs `totalContextMs` when the context ends.
- **Axios error types**: we distinguish `response` (4xx/5xx), `request` (network/timeout), and `other` (e.g. request never sent) and include `errorKind` in error logs.
- **Masking**: sensitive keys (passwords, tokens, headers) are masked by SyntropyLog per init config; we pass raw data and the library sanitizes.

## Context and correlationId

**One `contextManager.run()` = one context = one correlationId.** All logs inside that `run()` share the same ID.

- **One run per “request”** (e.g. per HTTP request in Express): all logs for that request have the same correlationId.
- **One run per “scenario”** (as in this demo): each scenario gets a different correlationId.
- **Several HTTP calls inside a single run**: they all keep the same correlationId (see Scenario 5 in the code).

So: we only call the logger with message and metadata; the framework injects correlationId from context and does the rest.

## Project layout

- **`index.ts`**: init SyntropyLog, create instrumented Axios, define `runWithTiming`, and run scenarios (including one with multiple HTTP calls in one context).
- **`axiosInstrumented.ts`**: builds the Axios instance; request interceptor sets correlation header and start time; response interceptor (success and error) computes `durationMs` and logs; no syntropylog import, only `LoggerLike` and `ContextManagerLike` interfaces.
- **`boilerplate.ts`**: init and graceful shutdown helpers.

## Run it

```bash
npm run dev
```

You’ll see:

- One correlationId per scenario (Scenarios 1–4).
- Scenario 5: several HTTP calls in one context — same correlationId for all those logs and a single `totalContextMs` at the end.
- Request/response logs with `durationMs`; “context completed” logs with `totalContextMs`.
- On 404 (Scenario 4), error logs with `errorKind: 'response'`, `durationMs`, and then the context-completed log with total time.

## Design choices

1. **Adapter stays framework-agnostic**: `axiosInstrumented.ts` only needs a logger (info/debug/error) and a context manager (getCorrelationId, getCorrelationIdHeaderName). `index.ts` wires in SyntropyLog.
2. **No correlationId in our payloads**: SyntropyLog adds it from context so it appears once per log line.
3. **Time**: the client reports only per-request `durationMs`; the middleware that runs the context knows start/end and logs `totalContextMs`.
4. **Axios errors**: we handle all cases (response, request, other) with optional chaining and log `errorKind` so you can tell what failed.

## Related

- **Example 10**: HTTP correlation with the framework’s built-in HTTP API.
- **SyntropyLog README**: context, logging matrix, masking, transports.

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
