/**
 * Gateway · Express.
 * - `correlationIdMiddleware()` opens a correlation scope per request (using the
 *   id the browser sent on `x-correlation-id`, or generating one).
 * - POST /api/orders forwards to the orders service over HTTP, propagating the id
 *   via `getPropagationHeaders('http')`.
 * - A WebSocket hub subscribes to the Redis log bus and streams every (already
 *   masked) log entry from ALL services to the live dashboard.
 */
import http from 'http';
import path from 'path';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { correlationIdMiddleware } from 'syntropylog';
import {
  bootstrap,
  env,
  subscribeLogBus,
  TARGET_HTTP,
  SVC_GATEWAY,
  type CreateOrderRequest,
} from '@distributed/shared';

async function main(): Promise<void> {
  const { logger, contextManager, shutdown } = await bootstrap(SVC_GATEWAY);

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
    const correlationId = contextManager.getCorrelationId();
    logger.info({ operation: 'gateway_receive_order' }, 'order request received from browser');
    try {
      const upstream = await fetch(`${env.ORDERS_URL}/orders`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          // internal→wire translation for the HTTP target → x-correlation-id, x-tenant-id
          ...contextManager.getPropagationHeaders(TARGET_HTTP),
        },
        body: JSON.stringify(req.body as CreateOrderRequest),
      });
      const data = (await upstream.json()) as Record<string, unknown>;
      logger.info(
        { operation: 'gateway_forward_order', status: upstream.status },
        'forwarded to orders service'
      );
      res.status(upstream.status).json({ correlationId, ...data });
    } catch (err) {
      logger.error(
        { error: err instanceof Error ? err.message : String(err) },
        'failed to reach orders service'
      );
      res.status(502).json({ ok: false, error: 'orders service unavailable', correlationId });
    }
  });

  // Serve the built frontend if present (production build). In dev, Vite serves it.
  const webDist = path.resolve(__dirname, '../../../frontend/dist');
  app.use(express.static(webDist));

  const server = http.createServer(app);

  // WebSocket hub → live dashboard.
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<WebSocket>();
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  const stopBus = subscribeLogBus((entry) => {
    const msg = JSON.stringify(entry);
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  });

  server.listen(env.GATEWAY_PORT, () => {
    logger.info(
      { port: env.GATEWAY_PORT, operation: 'startup' },
      'gateway (Express) listening + WS hub + logbus bridge'
    );
  });

  const stop = async (): Promise<void> => {
    await stopBus();
    for (const ws of clients) ws.terminate();
    wss.close();
    server.close();
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
