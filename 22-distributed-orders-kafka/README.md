<h1 align="center">22 · Distributed Orders — one correlation-id, one trace, across languages</h1>

<p align="center">
  <strong>A single order placed in the browser threads <em>one</em> correlation-id through
  5 services, <em>three</em> languages of the family (TypeScript + Python traced, .NET
  collecting), HTTP <em>and</em> Kafka — and you watch the logs <em>and</em> the distributed
  trace light up live.</strong>
  <br/>
  No Datadog. No APM. Just <a href="https://www.npmjs.com/package/syntropylog">SyntropyLog</a>
  (TS), <a href="https://pypi.org/project/slpy-log/">slpy</a> (Python) and
  <a href="https://www.nuget.org/packages/sl4n">sl4n</a> (.NET) declaring observability once.
</p>

---

## The "wow"

Click **Place order** in the storefront. Within a second you watch the **same** `correlationId`
appear across **Express → NestJS → Kafka → Python → a worker** — every log stitched into one
distributed trace, with the credit card, CVV and email **masked automatically**. Then look at
the **waterfall**: the same order as a tree of timed **spans**, crossing the message broker and
a language boundary, assembled by a native **.NET AOT** collector everyone pushes to — expand any
span to read the logs that service emitted inside it.

Two jaw-drops:
1. The id survives a hop *through Kafka* **and across a language boundary** — a Python service
   logs and spans under the very same id as the TypeScript ones, with no per-language adapter.
2. It's all **one primitive**. The same SyntropyLog **executor** that ships a log ships a span —
   just a different sink. Logs and spans both push to the .NET collector, which serves the dashboard.

That first part is the whole point of the **inbound/outbound design**: each service declares its
own wire names, and the id survives because the maps translate — headers do **not** have to be
named identically everywhere.

```
Browser (storefront + live dashboard, one page)
  │  POST /api/orders                         (browser may send x-correlation-id / traceparent)
  ▼
Gateway · Express (TS)   :3000   edge: correlationIdMiddleware + a server/client trace span
  │  fetch(orders, getPropagationHeaders('http') + traceparent)
  ▼
Orders · NestJS (TS)     :3001   save order → Redis; publish order.created   (server + producer spans)
  │  getPropagationHeaders('kafka') + traceparent   → on the Kafka message headers
  ▼  Kafka: order.created
  ├─► Payments · Fastify (TS)      :3002   charge card (PII masked); publish payment.processed
  └─► Inventory · FastAPI (🐍 Py)   :3003   reserve stock in Redis; publish stock.reserved
            │                                (each: consumer + producer spans)
            ▼  Kafka: payment.processed, stock.reserved
        Notifications · worker (TS)         "send email"; advance order status → confirmed

Every service pushes its already-masked LOGS and its SPANS over HTTP to:

        Traceability · .NET AOT (sl4n)  :9317   ingest /v1/logs + /v1/spans → assemble the
                                                 trace waterfall → serve the dashboard over SSE
                                                        │
                                                        ▼  Server-Sent Events
                                              the live dashboard (logs + trace waterfall)
```

| Service | Language · Framework | Role | Port |
|---|---|---|---|
| gateway | TS · Express | edge: correlation + trace root, fan-in to orders | 3000 |
| orders | TS · NestJS | create order, persist to Redis, publish `order.created` | 3001 |
| payments | TS · Fastify | consume order, charge card (mask PII), publish `payment.processed` | 3002 |
| **inventory** | **🐍 Python · FastAPI** | consume order, reserve stock in Redis, publish `stock.reserved` | 3003 |
| notifications | TS · worker | consume payment + stock, "email", confirm order | — |
| **traceability** | **🔷 .NET AOT · sl4n** | ingest logs + spans, assemble the trace, serve the dashboard (SSE) | 9317 |

> There is **also** a TypeScript `inventory` (Express) service. The demo runs the **Python** one
> by default (`npm run up` / `dev:polyglot`); the all-TypeScript variant runs with `npm run dev`.
> Run **one at a time** — both share the Kafka consumer group `inventory-service`.

---

## Observability, one primitive

- **Logs** and **spans** both ride SyntropyLog's `AdapterTransport` + `UniversalAdapter`
  **executor** — the same "declare once, route anywhere" mechanism. The sink is a **batched HTTP
  push** to the collector (`/v1/logs`, `/v1/spans`). Redis is **state only** (orders + stock).
- **Trace propagation** is **W3C `traceparent`** on the wire (HTTP + Kafka). A tiny per-language
  helper wraps it: `withSpan(...)`, `inject`, `extract` (TS
  [`packages/shared/src/tracing.ts`](packages/shared/src/tracing.ts); Python
  [`services/inventory-py/tracing.py`](services/inventory-py/tracing.py)).
- **The collector** ([`services/traceability/`](services/traceability/)) is a single native
  **.NET AOT** binary built on **sl4n** (it dogfoods sl4n for its own logs). It assembles spans
  into a waterfall and streams logs + traces to the dashboard over **SSE**, where each service's
  logs nest under the span they were emitted in (every entry carries its `spanId`). It's **durable** —
  spans + logs persist to **SQLite**, so a collector restart keeps the traces intact. See its
  [README](services/traceability/README.md) and the `bench/latigazo.sh` load test.
- Design write-up: **[TRACING-DESIGN.md](TRACING-DESIGN.md)**. Cross-language envelope:
  **[LOGBUS-CONTRACT.md](LOGBUS-CONTRACT.md)**.

---

## Quick start

**Prerequisites:** **Node 20** (pinned via `.node-version`), **Python 3.10+**, **.NET 10 SDK**
(for the collector), and Docker. For the polyglot service, the sibling
[`slpy`](https://github.com/Syntropysoft/syntropylog.py) repo checked out next to this examples
repo (used editable; falls back to `pip install slpy-log`).

```bash
cd 22-distributed-orders-kafka
npm install

npm run up      # infra (Kafka+Redis+UI) → the .NET collector → the whole polyglot mesh + dashboard
```

Open **http://localhost:5173**, add items, hit **Place order**, and watch the logs stream and the
trace waterfall fill in. Ctrl-C stops the services (infra stays up for a fast restart).

```bash
npm run down    # stop host services + the collector + wipe infra & volumes
```

- **Dashboard / storefront:** http://localhost:5173
- **Collector** (raw feed / metrics): `curl -N http://localhost:9317/stream` · `curl http://localhost:9317/metrics`
- **Kafka UI** (watch messages travel on the broker too): http://localhost:8080

### Run modes

| Command | What runs |
|---|---|
| `npm run up` | **Recommended.** Infra + the collector (JIT, `dotnet run` — fast startup) + the polyglot mesh (inventory in **Python**) + dashboard. |
| `npm run up:aot` | Same, but the collector is the **real native AOT binary** (published on first run, ~30-60s, then reused). This is the AOT cold-start/no-warmup path — see [note below](#notes). |
| `npm run down` | Stop host services + the collector (ports 3000-3003, 5173, 9317) + `docker compose down -v`. |
| `npm run dev:polyglot` | Collector + the polyglot mesh (assumes infra already up). |
| `npm run dev` | Collector + the **all-TypeScript** mesh (inventory in Express). |
| `npm run infra:up` / `infra:down` | Just the Docker infra. |

### Place an order without the UI

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'content-type: application/json' \
  -H 'x-correlation-id: trc_demo_1' \
  -d @sample-order.json
```

Then watch it appear on the collector feed (`curl -N http://localhost:9317/stream`) under
`gateway`, `orders`, `payments`, `inventory` (Python) and `notifications`. Review the whole flow by
its id — the spans (`GET http://localhost:9317/trace/{id}`) and every log line, ordered by time
(`GET http://localhost:9317/logs/{id}`), since `correlationId === traceId`. `GET /logs` lists recent
logs across flows, grouped by `correlationId` then timestamp. Try it:

- **Totals over $5,000** → payment **declined** (`payment.processed { approved: false }`).
- **Smart Watch** (seeded at 0 stock) → **out of stock** (`stock.reserved { reserved: false }`).

---

## What it demonstrates

- **Correlation across HTTP _and_ a broker _and_ a language boundary** — one id, every hop. Each
  service maps the id to/from its own wire names via `context.inbound` / `context.outbound`;
  nothing is named identically across services.
- **Distributed tracing, schematically** — W3C `traceparent`, `withSpan`, and a native .NET
  collector that assembles a **waterfall**. Not a replacement for OpenTelemetry — a demonstration
  that the same executor primitive carries spans too. See [TRACING-DESIGN.md](TRACING-DESIGN.md).
- **Automatic PII masking** — card → `**** **** **** 1234`, CVV → `[REDACTED]`, email →
  `a***@example.com`, declared once per service and enforced everywhere (same default rules in
  TS, Python and .NET). Masking is applied **at the source**: each service masks with its own rules
  before it pushes. The collector just collects — it trusts the contract and stores/streams the
  already-masked entry verbatim (no field dropped).
- **Logging Matrix** — per-level context whitelist, identical config across languages.
- **The executor as the universal sink** — one `AdapterTransport`/`UniversalAdapter` pattern ships
  logs *and* spans to the collector over HTTP; the collector streams them to the dashboard over SSE.

---

## Project layout

```
packages/shared/        the TS heart: syntropy bootstrap, kafka + correlation helpers, tracing, types
services/gateway/       Express edge (correlation + trace root + fan-in)
services/orders/        NestJS — official syntropylog/nestjs integration
services/payments/      Fastify consumer
services/inventory/     Express consumer  (all-TS variant)
services/inventory-py/  🐍 FastAPI consumer (polyglot variant) — see its own README
services/notifications/ worker consumer
services/traceability/  🔷 .NET AOT collector (sl4n): ingest logs + spans, assemble, serve SSE
frontend/               React + Vite — storefront + live logs + trace waterfall
scripts/up.sh · down.sh one-command bring-up / tear-down
TRACING-DESIGN.md       the schematic-OTel design (spans on the executor, .NET AOT collector)
LOGBUS-CONTRACT.md      the cross-language log/span envelope contract
docker-compose.yaml     Kafka (KRaft, single node) + Redis + Kafka UI
BUILD-RECIPE.md         how this example was built, step by step
```

Both the Python service and the .NET collector are written **functional-core / imperative-shell**:
a pure decision (`inventory-py/domain.py` — the reservation; `traceability/Domain/TraceAssembler.cs`
— the waterfall) with all side effects in a thin shell, dependencies injected, guard clauses,
single-purpose helpers. Each has pure unit tests (`test_domain.py`, `test_tracing.py`).

---

## Notes

- **Infra in Docker, app on the host.** Kafka + Redis run in containers; the services + the
  collector run on your machine so you see the correlated logs + trace stream live. Kafka exposes a
  host listener (`localhost:9092`) and an in-network one (`kafka:19092`, for the Kafka UI).
- **Collector: JIT by default, AOT on demand.** `npm run up` runs the collector with `dotnet run`
  (JIT) for the fastest startup — functionally identical, but *not* the native binary. The
  `PublishAot=true` project produces a real single-file native binary; **`npm run up:aot`** (or
  `npm run dev:collector:aot`) publishes and runs it. That's the path that actually delivers the
  ~200 ms cold start / no-warmup / ~11 MB binary the collector [README](services/traceability/README.md)
  measures — don't quote those numbers from a `dotnet run`.
- **Masking is the source's job.** Each service declares its own rules and masks before it pushes;
  the collector trusts that contract and only collects — it does **not** re-mask. That's the OTel
  Collector split: a leak is fixed in the service that leaked, not papered over at the sink.
- **One inventory at a time.** The Python and TypeScript inventory services share the Kafka
  consumer group `inventory-service` — run one or the other, never both.
- **NestJS:** the `orders` service uses the **official `syntropylog/nestjs`** integration —
  `SyntropyLogModule.forRoot({ syntropyLog })` in
  [`app.module.ts`](services/orders/src/app.module.ts) binds it to the one initialized singleton,
  and [`main.ts`](services/orders/src/main.ts) sets that logger as Nest's app logger. (Before
  syntropylog **1.3.0** the subpath bundled a second, uninitialized singleton; 1.3.0 fixed it.)
- **Node 20**, **Python 3.10+**, **.NET 10 SDK** are required. `.node-version`/`.nvmrc` pin Node.
