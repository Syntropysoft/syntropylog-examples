# Example 21: Correlation middleware (Express / Fastify)

Drop-in correlation-id propagation for HTTP servers. The middleware resolves an
incoming correlation id (multi-header → `traceparent` → generate), opens an
AsyncLocalStorage context for the whole request so **every log inside the handler
carries the id automatically**, and echoes it back on the response.

## What this example shows

1. A request **without** a correlation id → the server generates one.
2. A request **with** `x-correlation-id` → the server propagates it end-to-end.

Both are issued from the example itself with the global `fetch`, so it's
self-contained — no curl needed.

## Run

```bash
npm install
npm run dev
```

## Express (this example)

```ts
import { correlationIdMiddleware } from 'syntropylog';

app.use(correlationIdMiddleware());          // mount before your routes
app.get('/hello', (_req, res) => {
  log.info('handling /hello');               // correlation id auto-included
  res.json({ ok: true });
});
```

## Fastify (same idea, different hook)

```ts
import Fastify from 'fastify';
import { fastifyCorrelationHook } from 'syntropylog';

const app = Fastify();
app.addHook('onRequest', fastifyCorrelationHook());
app.get('/hello', async () => {
  log.info('handling /hello');
  return { ok: true };
});
```

## Options (both)

`correlationIdMiddleware(options)` / `fastifyCorrelationHook(options)` accept the
shared `CorrelationResolveOptions` (e.g. `incomingHeaders`, `responseHeaders`,
`parseTraceparent`, `syntropyLog` to target a non-singleton instance). With no
options they use the configured `context.correlationIdHeader` and sensible
defaults.
