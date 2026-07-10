# Observability backend — design (schematic OpenTelemetry, on the executor)

**Status: IMPLEMENTED.** This document is the design; it all shipped. The .NET AOT collector
(`services/traceability/`), the per-language helpers (TS `packages/shared/src/tracing.ts`, Python
`services/inventory-py/tracing.py`), every service's instrumentation, the SSE dashboard with a live
waterfall, and the Redis-log-bus retirement are all in the tree and verified end to end. The phased
plan (§9) and the open questions (§10) below are kept for the record — read them as "why", not "todo".
**Decisions locked (all executed):**
1. Wire format = full **W3C `traceparent`** (HTTP + Kafka).
2. **All services push** logs *and* spans to a single service (the OTel Collector model) —
   emission stays on the SyntropyLog **executor**, its sink becomes an HTTP export.
3. That service is a **.NET AOT** native binary (built on **sl4n**) — it **is** the .NET
   representation in the demo (no payments-in-.NET rewrite; the collector has a real reason
   to be .NET).

A single, transversal **observability backend**: every service (TS, Python) pushes its
already-masked **logs** and its **spans** to one native .NET service, which correlates them,
assembles traces, and serves the live dashboard. Schematic — it copies the *shape* of
OpenTelemetry/Dynatrace (push exporters → a collector → traces + a waterfall) without OTLP
protobuf, gRPC, samplers, or baggage. **Not** a replacement for OpenTelemetry.

---

## 1. Architecture

```
  gateway (TS)   orders (TS)   payments (TS)   inventory (🐍 Py)   notifications (TS)
      │              │              │                │                   │
      │  every service: SyntropyLog/slpy executor → HTTP export (batched)│
      └──────────────┴──────────────┴──────┬─────────┴───────────────────┘
                                            │  POST /v1/logs   POST /v1/spans
                                            ▼
                       ┌───────────────────────────────────────────┐
                       │  traceability · .NET AOT (sl4n)            │
                       │  ingest → correlate logs↔spans by traceId  │
                       │  assemble span tree → waterfall            │
                       │  serve: /trace/:id, /traces, WS feed       │
                       └───────────────────────┬───────────────────┘
                                                │  WebSocket / SSE
                                                ▼
                                    frontend dashboard (live logs + waterfall)
```

Redis keeps doing **app state** (orders, stock). It is **no longer** the log/observability
bus — that role moves to the .NET collector. The gateway goes back to being just the edge
(correlation + fan-in to orders); it no longer hosts the log hub.

---

## 2. The model (OTel, minus the ceremony)

```
trace  ───────────────────────────────────────────────────────────────── traceId (32 hex)
 └─ span "POST /api/orders"        gateway   [server]      ├──────────────┤  12ms
     └─ span "create_order"        orders    [server]         ├─────────┤    9ms
         ├─ span "persist_redis"   orders    [internal]         ├──┤          2ms
         └─ span "publish order"   orders    [producer]            ├─┤        1ms
             ├─ span "reserve_stock" inventory [consumer] 🐍          ├────┤  3ms
             └─ span "charge_card"   payments  [consumer]             ├───┤   3ms
```

A **span** is one timed unit of work; a **trace** is every span sharing a `traceId`, linked
by `parentSpanId`, drawn as a waterfall. Logs carry `traceId`/`spanId` so they nest under
their span in the same view (logs↔spans join).

### Span record (JSON pushed to `/v1/spans`)

```jsonc
{
  "traceId":      "4bf92f3577b34da6a3ce929d0e0e4736", // 16 bytes / 32 hex
  "spanId":       "00f067aa0ba902b7",                 //  8 bytes / 16 hex
  "parentSpanId": "0000000000000000",                 // absent for the root
  "name":         "reserve_stock",
  "service":      "inventory",
  "kind":         "consumer",     // server | client | producer | consumer | internal
  "startTime":    "2026-07-09T22:00:00.000+00:00",     // ISO-8601 (family format)
  "endTime":      "2026-07-09T22:00:00.003+00:00",
  "durationMs":   3.2,
  "status":       "ok",           // ok | error
  "attributes":   { "orderId": "ORD-123", "itemCount": 2 }
}
```

### Log record (JSON pushed to `/v1/logs`) — the same envelope as today

The current log-bus envelope (`service`, `level`, `message`, `timestamp`, `correlationId`,
`tenantId`, …) **plus** `traceId`/`spanId`, so the collector nests it under its span. See
[LOGBUS-CONTRACT.md](LOGBUS-CONTRACT.md) — the envelope is unchanged; only the transport
(Redis publish → HTTP POST) and two added fields differ.

---

## 3. Wire format — W3C `traceparent`

One header on every hop (HTTP header and Kafka message header):

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^^ ^──────────── trace-id ─────────^ ^── parent-id ─^ ^^  01 = sampled
```

SyntropyLog is already primed: `middleware/correlation.ts` parses this exact
`version-traceid-parentid-flags` shape today — we adopt it as the contract.

### Propagation rules

| Moment | Action |
|---|---|
| **Inbound** (server/consumer) | Parse `traceparent`: context `traceId` = trace-id, `parentSpanId` = incoming parent-id. Absent → **root**: mint a `traceId`, no parent. |
| **New span** (`withSpan`) | Mint a `spanId`; parent = current context `spanId` (or `parentSpanId` for the service's first span). Set `spanId` for the scope of `fn`. |
| **Outbound** (client/producer) | Compose `traceparent = 00-{traceId}-{activeSpanId}-01` onto the HTTP/Kafka headers. |

> **traceparent vs the field maps:** it's a *composite*, so the tracing layer owns a tiny
> `compose/parse` codec and reads/writes the `traceparent` header directly (not through the
> single-field inbound/outbound maps). `traceId`/`spanId` are still stored as context fields
> so they also ride in the log envelope.

### `correlationId` ↔ `traceId`

Leaning **one identity**: seed `correlationId` from `traceId` at inbound, so a trace's logs
and spans share a single id and the collector joins them for free. (Open question §8.)

---

## 4. Emission — the executor becomes an HTTP exporter

Both logs and spans ride the **same `UniversalAdapter` / `AdapterTransport`** they already
use — we only swap the **sink** from `redis.publish(...)` to a **batched HTTP POST** to the
collector. This is the OTel `BatchSpanProcessor`/exporter pattern.

```ts
// schematic — the sink is just a different executor body
const exporter = new AdapterTransport({
  name: 'otlp-lite',
  adapter: new UniversalAdapter({
    executor: (entry) => batcher.add(entry),   // buffer; flush on size N or every T ms
  }),
});
// batcher POSTs [{...},{...}] to  http://traceability/v1/logs  (and /v1/spans for spans)
```

- **Batched**, not per-record: the exporter accumulates and flushes on size or interval —
  cheaper than one HTTP call per log line, and faithful to real exporters.
- **Sync-safe emit into the batcher** (the fire-and-forget lesson from the slpy logbus): the
  executor hands off to an in-memory queue synchronously; a background flusher does the HTTP.
- Two endpoints, one mechanism: `/v1/logs` and `/v1/spans` (or a unified `/v1/ingest`).

---

## 5. Resilience — the durable transport earns its keep

Because services now depend on a network hop to the collector, **collector-down must not lose
data**. This is exactly SyntropyLog's **`DurableAdapterTransport` + `persistPath`** (shipped in
1.3.0): buffer un-exported logs/spans, spool to disk on outage, replay on recovery. That's the
OTel exporter-retry-queue model — and a great thing to demo ("kill the collector, keep placing
orders, restart it, the buffered traces flush in"). Absent the collector, emission degrades to
best-effort (Silent Observer) — the app never blocks or crashes.

---

## 6. The traceability service — .NET AOT (sl4n)

A single native binary. Why AOT fits a collector precisely: always-on, one job, **ms cold
start, low memory, no runtime to install, single deployable**. It logs *itself* with **sl4n**
(dogfooding the .NET side of the family).

- **Ingest:** `POST /v1/logs`, `POST /v1/spans` — batched JSON arrays. (Schematic echo of
  OTLP/HTTP paths; plain JSON, no protobuf.)
- **Correlate:** join logs to spans by `traceId`/`spanId`.
- **Assemble:** accumulate spans by `traceId` (in-memory ring buffer, capped + TTL); link by
  `parentSpanId`; root = parentless span. Compute waterfall offsets/widths.
- **Serve:** `GET /trace/:traceId` (tree + logs nested per span), `GET /traces` (recent),
  a **WebSocket/SSE** feed for the live dashboard, and `GET /healthz` + `GET /metrics`
  (ingest counters: received/sec, assembled traces, dropped, RSS). The collector now owns
  the dashboard data feed (the role the gateway's log-bus bridge had).

### 6.1 Hammering it — the AOT load test ("latigazos")

The point of building the collector in **.NET AOT** is to *prove* it under load, not just to
run it. A dedicated **bench harness** floods `/v1/spans` (+ `/v1/logs`) at a configurable
rate/concurrency — independent of the mesh, so we isolate the collector's numbers:

- **What we show:** sustained **ingest throughput** (records/sec), **p50/p99 ingest latency**,
  **RSS staying flat** under load (no GC blowup), and **cold-start in ms** (AOT's headline).
- **Why AOT:** no JIT warmup (throughput is full from request #1), a small self-contained
  native binary, low steady memory — exactly what an always-on ingest box wants.
- **Contrast (optional):** publish the same collector JIT vs AOT and put the startup + RSS +
  first-request-latency numbers side by side — the crispest way to make the AOT case.

Backpressure under the flood is Silent-Observer-safe: if ingest can't keep up it **drop-oldest**
and bumps a `dropped` counter — it never blocks a producing service (§10).

---

## 7. What this changes in the existing example (honest migration cost)

Decision #2 ("everything to the collector") **replaces the current working log path**. Not a
greenfield add — real edits to what works:

- **Every service's bootstrap** (TS `packages/shared/syntropy.ts` + Python
  `inventory-py/syntropy.py`): the log-bus transport (Redis publish) → the batched HTTP
  exporter. Same executor, new sink.
- **Retire `syntropy:logbus`** (Redis pub/sub for logs) and the gateway's `subscribeLogBus`
  → WS bridge. The **frontend** points at the collector for the live feed instead of the gateway.
- **Add `traceId`/`spanId`** to the context + the log envelope; add the `traceparent` codec +
  `withSpan` to the shared package and to slpy.
- Redis stays only for **app state** (orders, stock).

Net: the gateway slims back to a pure edge; the .NET collector becomes the observability hub.
Worth it for the story, but it is a refactor of a working path — sequence it carefully (§8 plan).

---

## 8. The helper — one per-language SDK that does everything

The client side is **one small helper per language** (TS, Python, .NET) — the SDK model of
the big players (OTel ships one SDK per language). A service imports it and gets the whole
observability surface in one place; no service wires transports, codecs, or exporters itself.

**Surface (identical across languages):**
```ts
const obs = initObservability('orders');   // wires the family lib + masking + batched HTTP exporter
obs.logger.info('order received', { orderId });          // masked + auto-exported to the collector
await obs.withSpan('create_order', { orderId }, fn);     // span: mint id, parent from ctx, time, export
obs.inject(headers);                                     // compose  traceparent  onto outbound HTTP/Kafka
obs.extract(headers);                                    // parse    traceparent  from inbound
```
```python
obs = init_observability("inventory")
async with obs.span("reserve_stock", orderId=order_id):  # same semantics
    ...
obs.inject(headers); obs.extract(headers)                # same traceparent codec
```

- **One import, one init** → masked logs + spans + traceparent propagation + batched export,
  all pointing at the .NET collector. This keeps each service tiny (the "declare once" ethos).
- `kind` inferred by site: server / client / producer / consumer / internal. `status = error`
  if the body throws (re-raised — tracing never swallows).
- The three helpers wrap **SyntropyLog (TS)**, **slpy (Python)**, **sl4n (.NET)** respectively,
  behind the same tiny surface — so the .NET services (the collector itself, and anything later)
  use the same `obs` shape as JS/Python.

---

## 9. Phased implementation (when we build it)

Front-loaded so the **.NET AOT** proof comes first and everything else has a target to push to.

1. **.NET AOT collector skeleton** (`services/traceability/`, sl4n): ingest `/v1/logs` +
   `/v1/spans`, in-mem assemble by `traceId`, serve `/trace/:id` + `/traces` + `/healthz` +
   `/metrics`. AOT-published native binary. **Stand this up first.**
2. **Latigazo — the load harness (§6.1):** flood `/v1/spans` at configurable rate/concurrency;
   report throughput / p99 / RSS / cold-start. Isolated AOT proof, no mesh needed yet.
3. **The helper (TS):** `initObservability`, `withSpan`, `traceparent` codec (inject/extract),
   `traceId`/`spanId` in context + log envelope, and the **batched HTTP exporter** (logs + spans).
4. **Cut the TS services over:** replace Redis-logbus → the helper; instrument gateway
   (`server`+`client`), orders (`server`+`internal`+`producer`), payments/notifications (`consumer`).
5. **Dashboard:** point the live feed at the collector; add the **waterfall / Trace** view.
6. **The helper (Python):** same surface in slpy; wire `inventory-py`.
7. **Durable buffering** on both sides; demo a collector outage + replay.

---

## 10. Open questions (decide before coding)

- **correlationId ↔ traceId:** one identity (seed correlationId from traceId — leaning this) vs
  carry both and let the collector join.
- **Ingest resilience store:** rely purely on each service's durable disk buffer (OTel-like), or
  also give the collector a small WAL so an in-flight assembly survives its own restart?
- **Batch flush policy:** size N vs interval T (probably both, whichever first) — pick defaults.
- **Kafka producer/consumer spans:** OTel *links* them; schematic version treats them as
  parent→child for one readable tree — note the simplification in the UI.
- **Backpressure:** if the collector is slow, do exporters drop-oldest or block-bounded? Leaning
  drop-oldest + a dropped-count metric (Silent Observer never blocks the app).
```
