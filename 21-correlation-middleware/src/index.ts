/**
 * Example 21: Correlation middleware (Express)
 *
 * `correlationIdMiddleware()` is a drop-in Express middleware that:
 *   - resolves an incoming correlation id from the request headers
 *     (multi-header → traceparent → generate a fresh one),
 *   - opens an AsyncLocalStorage context for the whole request, so every log
 *     inside the handler automatically carries the correlation id,
 *   - echoes the id back on the response headers.
 *
 * Fastify users: see the README for the `fastifyCorrelationHook()` equivalent.
 */
import express from 'express';
import { syntropyLog, ConsoleTransport, correlationIdMiddleware } from 'syntropylog';

async function main() {
  await syntropyLog.init({
    logger: {
      serviceName: 'api',
      level: 'info',
      transports: [new ConsoleTransport()],
    },
    context: { correlationIdHeader: 'x-correlation-id' },
  });

  const log = syntropyLog.getLogger('api');
  const app = express();

  // Mount BEFORE the routes. The whole handler now runs inside the request context.
  app.use(correlationIdMiddleware());

  app.get('/hello', (_req, res) => {
    // No need to pass the id around — it's in the context, so it shows in the log.
    log.info('handling /hello');
    res.json({ ok: true });
  });

  const server = app.listen(3000);
  console.log('Listening on http://localhost:3000\n');

  // 1) No incoming id → the middleware generates one.
  console.log('1) Request WITHOUT a correlation id (server generates one):');
  let res = await fetch('http://localhost:3000/hello');
  console.log('   response x-correlation-id:', res.headers.get('x-correlation-id'), '\n');

  // 2) Incoming id → the middleware propagates it end-to-end.
  console.log('2) Request WITH x-correlation-id "trace-abc-123" (propagated):');
  res = await fetch('http://localhost:3000/hello', {
    headers: { 'x-correlation-id': 'trace-abc-123' },
  });
  console.log('   response x-correlation-id:', res.headers.get('x-correlation-id'), '\n');

  server.close();
  await syntropyLog.shutdown();
}

main().catch((err) => {
  console.error('❌ Example failed:', err);
  process.exit(1);
});
