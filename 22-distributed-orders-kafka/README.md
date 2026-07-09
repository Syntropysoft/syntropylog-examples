<h1 align="center">22 · Distributed Orders — one correlation-id, across languages</h1>

<p align="center">
  <strong>A single order placed in the browser threads <em>one</em> correlation-id through
  5 services, <em>two languages</em> (TypeScript + Python), HTTP <em>and</em> Kafka —
  and you watch the trace light up live.</strong>
  <br/>
  No Datadog. No APM. Just <a href="https://www.npmjs.com/package/syntropylog">SyntropyLog</a>
  (TS) and <a href="https://pypi.org/project/slpy-log/">slpy</a> (Python) declaring observability once.
</p>

---

## The "wow"

Click **Place order** in the storefront. Within a second you watch the **same** `correlationId`
appear across **Express → NestJS → Kafka → Python → a worker** — every log stitched into one
distributed trace, with the credit card, CVV and email **masked automatically**. The jaw-drop:
that id survives a hop *through a message broker* **and across a language boundary** — a Python
service logs under the very same id as the TypeScript ones, on the same dashboard, with no
per-language adapter.

That last part is the whole point of the **inbound/outbound design**: each service declares its
own wire names, and the id survives because the maps translate — headers do **not** have to be
named identically everywhere. The polyglot mesh is the living proof.

```
Browser (storefront + live dashboard, one page)
  │  POST /api/orders         (browser sends x-correlation-id)
  ▼
Gateway · Express (TS)   :3000   correlationIdMiddleware + WebSocket hub + logbus→WS bridge
  │  fetch(orders, getPropagationHeaders('http'))      → x-correlation-id
  ▼
Orders · NestJS (TS)     :3001   save order → Redis; publish order.created
  │  getPropagationHeaders('kafka')                    → correlationId (in message headers)
  ▼  Kafka: order.created
  ├─► Payments · Fastify (TS)   :3002   charge card (PII masked); publish payment.processed
  └─► Inventory · FastAPI (🐍 Python) :3003   reserve stock in Redis; publish stock.reserved
            │
            ▼  Kafka: payment.processed, stock.reserved
        Notifications · worker (TS)   "send email"; advance order status → confirmed

Log bus: every service (TS or Python) → Redis pub/sub → the gateway streams each
(already-masked) entry over WebSocket to the dashboard, grouped by correlationId → live trace.
```

| Service | Language · Framework | Role | Port |
|---|---|---|---|
| gateway | TS · Express | edge: correlation, fan-in to orders, WebSocket hub | 3000 |
| orders | TS · NestJS | create order, persist to Redis, publish `order.created` | 3001 |
| payments | TS · Fastify | consume order, charge card (mask PII), publish `payment.processed` | 3002 |
| **inventory** | **🐍 Python · FastAPI** | consume order, reserve stock in Redis, publish `stock.reserved` | 3003 |
| notifications | TS · worker | consume payment + stock, "email", confirm order | — |

> There is **also** a TypeScript `inventory` (Express) service. The demo runs the **Python** one
> by default (`npm run up` / `dev:polyglot`); the all-TypeScript variant runs with `npm run dev`.
> Run **one at a time** — both share the Kafka consumer group `inventory-service`.

---

## Quick start

**Prerequisites:** **Node 20** (pinned via `.node-version`), **Python 3.10+**, and Docker.
For the polyglot service, the sibling [`slpy`](https://github.com/Syntropysoft/syntropylog.py)
repo checked out next to this examples repo (used editable; falls back to `pip install slpy-log`).

```bash
cd 22-distributed-orders-kafka
npm install

npm run up      # infra (Kafka+Redis+UI) → wait healthy → whole polyglot mesh + dashboard
```

Open **http://localhost:5173**, add items, hit **Place order**, and watch the trace.
Ctrl-C stops the services (infra stays up for a fast restart).

```bash
npm run down    # stop host services + wipe infra & volumes
```

- **Dashboard / storefront:** http://localhost:5173
- **Kafka UI** (watch messages travel on the broker too): http://localhost:8080

### Run modes

| Command | What runs |
|---|---|
| `npm run up` | **Recommended.** Infra + the polyglot mesh (inventory in **Python**) + dashboard. |
| `npm run down` | Stop host services (ports 3000-3003, 5173) + `docker compose down -v`. |
| `npm run dev:polyglot` | The polyglot mesh only (assumes infra already up). |
| `npm run dev` | The **all-TypeScript** mesh (inventory in Express) — the original variant. |
| `npm run infra:up` / `infra:down` | Just the Docker infra. |

### Place an order without the UI

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'content-type: application/json' \
  -H 'x-correlation-id: trc_demo_1' \
  -d @sample-order.json
```

Then grep the dev console (or the Redis log bus) for `trc_demo_1` and watch it appear under
`gateway`, `orders`, `payments`, `inventory` (Python) and `notifications`. Try it:

- **Totals over $5,000** → payment **declined** (`payment.processed { approved: false }`).
- **Smart Watch** (seeded at 0 stock) → **out of stock** (`stock.reserved { reserved: false }`).

---

## What it demonstrates

- **Correlation across HTTP _and_ a broker _and_ a language boundary** — one id, every hop. Each
  service maps the id to/from its own wire names via `context.inbound` / `context.outbound`;
  nothing is named identically across services. The single integration contract between languages
  is the log-bus envelope — see **[LOGBUS-CONTRACT.md](LOGBUS-CONTRACT.md)**.
- **Inbound / outbound translation** — `getPropagationHeaders('http' | 'kafka')` on the way out,
  `extractInboundContext(...)` on the way in (TS: [`packages/shared/src/kafka.ts`](packages/shared/src/kafka.ts);
  Python: [`services/inventory-py/kafka_bus.py`](services/inventory-py/kafka_bus.py)).
- **Automatic PII masking** — card → `**** **** **** 1234`, CVV → `[REDACTED]`, email →
  `a***@example.com`, declared once per service and enforced everywhere (same default rules in
  TS and Python).
- **Logging Matrix** — per-level context whitelist, identical config in both languages.
- **A custom transport** — an `AdapterTransport` + `UniversalAdapter` ships every already-masked
  entry to Redis, where the gateway turns it into the live dashboard feed. Same pattern in TS
  ([`packages/shared/src/logbus.ts`](packages/shared/src/logbus.ts)) and Python
  ([`services/inventory-py/syntropy.py`](services/inventory-py/syntropy.py)).

---

## Project layout

```
packages/shared/        the TS heart: syntropy bootstrap, kafka + correlation helpers, logbus, types
services/gateway/       Express edge + WebSocket hub + logbus→WS bridge
services/orders/        NestJS (echeq pattern: local logger, no syntropylog/nestjs)
services/payments/      Fastify consumer
services/inventory/     Express consumer  (all-TS variant)
services/inventory-py/  🐍 FastAPI consumer (polyglot variant) — see its own README
services/notifications/ worker consumer
frontend/               React + Vite — storefront + live trace dashboard
scripts/up.sh · down.sh one-command bring-up / tear-down
LOGBUS-CONTRACT.md      the cross-language envelope contract (the one integration point)
docker-compose.yaml     Kafka (KRaft, single node) + Redis + Kafka UI
BUILD-RECIPE.md         how this example was built, step by step
```

The Python service is written **functional-core / imperative-shell**: the reservation decision is
a pure function in [`services/inventory-py/domain.py`](services/inventory-py/domain.py) (unit-tested
in `test_domain.py`, no I/O), and all side effects — Redis, Kafka, slpy — live in `main.py` with
dependencies injected explicitly (no global state), guard clauses, and single-purpose helpers.

---

## Notes

- **Infra in Docker, app on the host.** Kafka + Redis run in containers; the services run on your
  machine so you see the correlated logs stream live. Kafka exposes a host listener
  (`localhost:9092`) and an in-network one (`kafka:19092`, for the Kafka UI).
- **One inventory at a time.** The Python and TypeScript inventory services share the Kafka
  consumer group `inventory-service` — run one or the other, never both.
- **NestJS:** the `orders` service uses the **official `syntropylog/nestjs`** integration —
  `SyntropyLogModule.forRoot({ syntropyLog })` in
  [`app.module.ts`](services/orders/src/app.module.ts) binds it to the one initialized
  singleton, and [`main.ts`](services/orders/src/main.ts) sets that logger as Nest's app
  logger, so Nest's own logs flow through the masking/matrix/logbus pipeline. (Before
  syntropylog **1.3.0** the subpath bundled a second, uninitialized singleton — "Logger
  Factory not available" — so this example used to hand-roll a local logger service; 1.3.0
  fixed it, and the workaround is gone.)
- **Node 20** and **Python 3.10+** are required. `.node-version`/`.nvmrc` pin Node.
