<h1 align="center">22 · Distributed Orders — one correlation-id, end to end</h1>

<p align="center">
  <strong>A single order placed in the browser threads <em>one</em> correlation-id through
  5 services, 3 web frameworks, HTTP <em>and</em> Kafka — and you watch the trace light up live.</strong>
  <br/>
  No Datadog. No APM. Just <a href="https://www.npmjs.com/package/syntropylog">SyntropyLog</a> declaring observability once.
</p>

---

## The "wow"

Click **Place order** in the storefront. Within a second you watch the **same** `correlationId`
appear across **Express → NestJS → Kafka → Fastify + Express → a worker** — every log stitched
into one distributed trace, with the credit card, CVV and email **masked automatically**. The
jaw-drop is seeing that id survive a hop *through a message broker*.

```
Browser (storefront + live dashboard, one page)
  │  POST /api/orders         (browser sends x-correlation-id)
  ▼
Gateway · Express  :3000      correlationIdMiddleware + WebSocket hub + logbus→WS bridge
  │  fetch(orders, getPropagationHeaders('http'))      → x-correlation-id
  ▼
Orders · NestJS    :3001      save order → Redis; publish order.created
  │  getPropagationHeaders('kafka')                    → correlationId (in message headers)
  ▼  Kafka: order.created
  ├─► Payments · Fastify  :3002   charge card (PII masked); publish payment.processed
  └─► Inventory · Express :3003   reserve stock in Redis; publish stock.reserved
            │
            ▼  Kafka: payment.processed, stock.reserved
        Notifications · worker      "send email"; advance order status → confirmed

Log bus: every service → Redis pub/sub → the gateway streams each (already-masked)
entry over WebSocket to the dashboard, grouped by correlationId → live trace.
```

| Service | Framework | Role | Port |
|---|---|---|---|
| gateway | Express | edge: correlation, fan-in to orders, WebSocket hub | 3000 |
| orders | NestJS | create order, persist to Redis, publish `order.created` | 3001 |
| payments | Fastify | consume order, charge card (mask PII), publish `payment.processed` | 3002 |
| inventory | Express | consume order, reserve stock in Redis, publish `stock.reserved` | 3003 |
| notifications | worker | consume payment + stock, "email", confirm order | — |

---

## What it demonstrates

- **Correlation across HTTP _and_ a broker** — one id, every hop. The trick: `correlationIdHeader:
  'correlationId'` makes the built-in middleware store the id under the same conceptual key that
  `getPropagationHeaders()` reads, so it travels coherently over HTTP (`x-correlation-id`) and Kafka
  (`correlationId`). See [`packages/shared/src/syntropy.ts`](packages/shared/src/syntropy.ts).
- **Inbound / outbound header translation** — `getPropagationHeaders('http' | 'kafka')` on the way out,
  `extractInboundContext(...)` on the way in. See [`packages/shared/src/kafka.ts`](packages/shared/src/kafka.ts).
- **Automatic PII masking** — card → `**** **** **** 1234`, CVV → `[REDACTED]`, email → `a***@example.com`,
  declared once in [`packages/shared/src/masking.ts`](packages/shared/src/masking.ts), enforced on every
  service.
- **Logging Matrix** — per-level context whitelist (see `loggingMatrix` in `syntropy.ts`).
- **NestJS integration (production pattern)** — a local `LoggerService` wrapping the singleton, the way
  the real `echeq-sandbox-nestjs` app does it (see the note below).
- **A custom transport** — an `AdapterTransport` + `UniversalAdapter` ships every log to Redis, where the
  gateway turns it into the live dashboard feed. See [`packages/shared/src/logbus.ts`](packages/shared/src/logbus.ts).

---

## Run it

**Prerequisites:** **Node 20** (pinned via `.node-version`) and Docker.

```bash
cd 22-distributed-orders-kafka

docker compose up -d        # Kafka (KRaft) + Redis + Kafka UI
npm install
npm run dev                 # builds shared, then runs all 5 services + Vite (one terminal)
```

Open **http://localhost:5173**, add items, hit **Place order**, and watch the trace.

- **Dashboard / storefront:** http://localhost:5173
- **Kafka UI** (watch the messages travel on the broker too): http://localhost:8080
- **Stop infra:** `docker compose down -v`

### Place an order without the UI

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'content-type: application/json' \
  -H 'x-correlation-id: trc_demo_1' \
  -d @sample-order.json
```

Then grep the dev console for `trc_demo_1` and watch it appear under `gateway`, `orders`, `payments`,
`inventory` and `notifications`. Try it:

- **Totals over $5,000** → payment **declined** (`payment.processed { approved: false }`).
- **Smart Watch** (seeded at 0 stock) → **out of stock** (`stock.reserved { reserved: false }`).

---

## Project layout

```
packages/shared/        the heart: syntropy bootstrap, kafka + correlation helpers, logbus, types
services/gateway/       Express edge + WebSocket hub + logbus→WS bridge
services/orders/        NestJS (echeq pattern: local logger, no syntropylog/nestjs)
services/payments/      Fastify consumer
services/inventory/     Express consumer
services/notifications/ worker consumer
frontend/               React + Vite — storefront + live trace dashboard
docker-compose.yaml     Kafka (KRaft, single node) + Redis + Kafka UI
BUILD-RECIPE.md         how this example was built, step by step
```

---

## Notes

- **Infra in Docker, app on the host.** Kafka + Redis run in containers; the services run on your
  machine via `npm run dev` so you see the correlated logs stream live in one terminal. Kafka exposes a
  host listener (`localhost:9092`) and an in-network one (`kafka:19092`, for the Kafka UI).
- **NestJS:** this example does **not** use `syntropylog/nestjs`. That subpath bundles its own SyntropyLog
  singleton (separate from the one we initialize), so `SyntropyLogModule.forRoot()` with no argument uses an
  uninitialized instance. Following the production `echeq-sandbox-nestjs` app, we wire a tiny local
  `SyntropyNestLoggerService` to the main singleton instead — see
  [`services/orders/src/syntropy-nest-logger.service.ts`](services/orders/src/syntropy-nest-logger.service.ts).
- **Node 20** is required (the repo's toolchain default may be newer). `.node-version`/`.nvmrc` pin it.
