/**
 * Gateway · Express — the edge.
 * - `correlationIdMiddleware()` opens a correlation scope per request (using the
 *   id the browser sent on `x-correlation-id`, or generating one).
 * - POST /api/orders forwards to the orders service over HTTP, propagating the id
 *   via `getPropagationHeaders('http')`, wrapped in a trace span.
 * Logs and spans go to the .NET collector, which serves the live dashboard — the
 * gateway no longer bridges the log bus.
 */
import path from 'path';
import express from 'express';
import { correlationIdMiddleware } from 'syntropylog';
import {
  bootstrap,
  env,
  createTracing,
  TARGET_HTTP,
  SVC_GATEWAY,
  type CreateOrderRequest,
} from '@distributed/shared';

async function main(): Promise<void> {
  const { logger, contextManager, shutdown } = await bootstrap(SVC_GATEWAY);
  // Tracing (Phase 4, incremental): emit spans to the .NET AOT collector. Additive —
  // the Redis log bus is untouched. Only the gateway is instrumented for now.
  const { tracer, shutdown: shutdownTracing } = createTracing(SVC_GATEWAY, env.COLLECTOR_URL);

  const app = express();
  app.use(express.json());

  // CORS so the Vite dev server (5173) can call us (3000).
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'content-type,x-correlation-id,x-tenant-id');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Expose-Headers', 'x-correlation-id,x-trace-id,x-request-id');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(correlationIdMiddleware());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: SVC_GATEWAY });
  });

  app.post('/api/orders', async (req, res) => {
    // Inbound: adopt a W3C traceparent if the caller sent one, else this span is the root.
    tracer.extract(req.headers);

    // The request-scoped root span. Every log + downstream span rides this trace.
    await tracer.withSpan(
      'POST /api/orders',
      { route: '/api/orders' },
      async () => {
        const correlationId = contextManager.getCorrelationId();
        logger.info({ operation: 'gateway_receive_order' }, 'order request received from browser');
        try {
          const headers: Record<string, string> = {
            'content-type': 'application/json',
            // internal→wire translation for the HTTP target → x-correlation-id, x-tenant-id
            ...contextManager.getPropagationHeaders(TARGET_HTTP),
          };
          // Client span around the downstream call; inject propagates traceparent so the
          // (soon-instrumented) orders service continues the same trace.
          const { status, body } = await tracer.withSpan(
            'call orders',
            { url: env.ORDERS_URL },
            async () => {
              tracer.inject(headers);
              const upstream = await fetch(`${env.ORDERS_URL}/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify(req.body as CreateOrderRequest),
              });
              return { status: upstream.status, body: (await upstream.json()) as Record<string, unknown> };
            },
            'client'
          );
          logger.info(
            { operation: 'gateway_forward_order', status },
            'forwarded to orders service'
          );
          res.status(status).json({ correlationId, ...body });
        } catch (err) {
          logger.error(
            { error: err instanceof Error ? err.message : String(err) },
            'failed to reach orders service'
          );
          res.status(502).json({ ok: false, error: 'orders service unavailable', correlationId });
        }
      },
      'server'
    );
  });

  // Serve the built frontend if present (production build). In dev, Vite serves it.
  const webDist = path.resolve(__dirname, '../../../frontend/dist');
  app.use(express.static(webDist));

  const server = app.listen(env.GATEWAY_PORT, () => {
    logger.info({ port: env.GATEWAY_PORT, operation: 'startup' }, 'gateway (Express) listening');
  });

  const stop = async (): Promise<void> => {
    server.close();
    await shutdownTracing();
    await shutdown();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('gateway failed to start:', err);
  process.exit(1);
});
