# Traceability service — design (schematic OpenTelemetry, on the executor)

**Status:** design only (no code yet). **Decision:** full **W3C `traceparent`** on the wire.

A small, transversal tracing layer for the polyglot mesh. It reuses SyntropyLog's
**executor** primitive — the same "declare once, route anywhere" mechanism that already
ships logs to the log bus — to ship **spans**. A single **collector service** assembles
them into a trace tree and renders a waterfall.

This is deliberately **schematic**: it copies the *shape* of OpenTelemetry / Dynatrace
(spans, traces, W3C propagation, a collector) without OTLP/gRPC, samplers, metrics, or
baggage. It is **not** a replacement for OpenTelemetry — it's a demonstration that the
same executor that carries logs can carry spans, end to end, across languages.

---

## 1. Goals / non-goals

**Goals**
- One **trace** per user action, as a tree of timed **spans**, across all services and languages.
- Propagate trace context with the **W3C `traceparent`** header (HTTP *and* Kafka).
- **Emit** spans through the SyntropyLog `executor` (a dedicated transport), exactly like the log bus.
- A tiny **collector** ("the traceability service") that assembles the tree and serves a waterfall.
- Join **logs ↔ spans**: a log entry carries `traceId`/`spanId`, so the dashboard can show logs *under* their span.

**Non-goals (kept out on purpose)**
- No OTLP, gRPC, protobuf, or a real OTel Collector.
- No sampling strategies (everything is sampled: `flags = 01`), no metrics, no `tracestate`/baggage.
- No persistence/retention backend (in-memory ring buffer in the collector is enough for the demo).

---

## 2. The model (OTel, minus the ceremony)

```
trace  ──────────────────────────────────────────────────────────────── traceId (32 hex)
 └─ span "POST /api/orders"        gateway   [server]      ├──────────────┤  12ms
     └─ span "create_order"        orders    [server]         ├─────────┤    9ms
         ├─ span "persist_redis"   orders    [internal]         ├──┤          2ms
         └─ span "publish order"   orders    [producer]            ├─┤        1ms
             ├─ span "reserve_stock" inventory [consumer] 🐍          ├────┤  3ms
             └─ span "charge_card"   payments  [consumer]             ├───┤   3ms
```

A **span** is one timed unit of work. A **trace** is every span sharing a `traceId`,
linked by `parentSpanId` into a tree, drawn as a waterfall.

### Span record (what gets emitted to the bus)

```jsonc
{
  "traceId":      "4bf92f3577b34da6a3ce929d0e0e4736", // 16 bytes / 32 hex
  "spanId":       "00f067aa0ba902b7",                 //  8 bytes / 16 hex
  "parentSpanId": "0000000000000000",                 // 16 hex, or absent for the root
  "name":         "reserve_stock",
  "service":      "inventory",
  "kind":         "consumer",     // server | client | producer | consumer | internal
  "startTime":    "2026-07-09T22:00:00.000+00:00",     // ISO-8601 (family format)
  "endTime":      "2026-07-09T22:00:00.003+00:00",
  "durationMs":   3.2,
  "status":       "ok",           // ok | error
  "attributes":   { "orderId": "ORD-123", "itemCount": 2 },
  "events":       []              // optional: [{ time, name, attrs }]
}
```

Field-for-field a **subset of an OTel span** (`kind`, `status`, `attributes`, `events`
are OTel names). `attributes` is masked by the same rules as logs before emit.

---

## 3. Wire format — W3C `traceparent`

One header, both transports (HTTP and Kafka message headers):

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^^ ^──────────── trace-id ─────────^ ^── parent-id ─^ ^^
          version         16 bytes / 32 hex        8 bytes/16 hex  flags (01 = sampled)
```

- **version** `00`, **trace-id** 32 hex (never all-zero), **parent-id** (= the sender's
  active span id) 16 hex, **trace-flags** `01`.
- SyntropyLog is already primed for this: `middleware/correlation.ts` parses a
  `version-traceid-parentid-flags` hex shape today — we adopt that exact format as the
  contract instead of inventing one.

### Propagation rules

| Moment | Action |
|---|---|
| **Inbound** (server / consumer) | Parse `traceparent`. Set context `traceId` = trace-id, `parentSpanId` = incoming parent-id. If absent → **start a root**: mint a new `traceId`, `parentSpanId` = none. |
| **New span** (`withSpan`) | Mint a `spanId`; its parent = the current context `spanId` (or `parentSpanId` for the first span in the service). Set context `spanId` = the new id for the scope of `fn`. |
| **Outbound** (client / producer) | Compose `traceparent` = `00-{traceId}-{activeSpanId}-01` and attach it to the HTTP/Kafka headers. |

> **Design note — traceparent vs the inbound/outbound field maps.** The existing maps
> translate *single* conceptual fields (`correlationId` ↔ `x-correlation-id`). `traceparent`
> is a **composite** (trace-id + span-id), so the tracing layer owns a tiny **codec**
> (`compose(traceId, spanId)` / `parse(header)`) and reads/writes the `traceparent` wire
> header directly — it does not go through the generic field map. `traceId`/`spanId` are
> still stored as conceptual context fields so they also land in the **log** envelope
> (that's what joins logs to spans).

### Relationship to the existing `correlationId`

They coexist and stay in sync:
- `correlationId` keeps doing its job (the log-bus grouping key — no change to the current dashboard).
- `traceId` is the W3C 32-hex trace identity for the span tree.
- **Bridge:** the tracing bootstrap seeds `correlationId` from the `traceId` (or carries both),
  so a trace's logs and spans share one identity and the collector can join them. Nothing in
  the current log flow has to change to adopt tracing.

---

## 4. Emission — through the executor (the whole point)

Spans ride the **same `UniversalAdapter` / `AdapterTransport`** mechanism as logs, on a
**separate channel** so the two streams stay clean:

```
logs   → executor → Redis  syntropy:logbus   (exists today)
spans  → executor → Redis  syntropy:spans    (new — identical mechanism)
```

```ts
// schematic — the span sink is just another executor target
const spanTransport = new AdapterTransport({
  name: 'spanbus',
  adapter: new UniversalAdapter({
    executor: (span) => redis.publish(SPAN_CHANNEL, JSON.stringify(span)), // sync client
  }),
});
```

> **Reliability note (learned in the Python slice):** use a **synchronous** Redis publish
> in the executor. An async fire-and-forget executor can be dropped under a busy consumer
> loop (see the slpy bug flagged during the inventory-py work). A local `PUBLISH` inline is
> sub-millisecond.

Keeping logs and spans on the same primitive but different channels is the message:
**the executor is the universal observability bus — not just for logs.**

---

## 5. Client API — `withSpan` (transversal, one call per unit of work)

**TypeScript (shared package):**
```ts
await withSpan('reserve_stock', { orderId }, async () => {
  // ...work...
});
// mints spanId, parent = current context span, times fn, emits the span on close,
// runs fn inside a context scope where `spanId` = the new span (so nested withSpan nests)
```

**Python (slpy, for inventory-py):**
```python
async with span("reserve_stock", orderId=order_id):
    ...  # same semantics: new spanId, parent from context, timed, emitted on exit
```

`kind` is inferred by where it's used: `server` (inbound HTTP handler), `client` (outbound
HTTP), `producer` (before a Kafka publish), `consumer` (Kafka message handler), `internal`
(default). `status = error` if `fn` throws (the error is re-raised — tracing never swallows).

---

## 6. The traceability service (the collector)

A single, transversal service — a mini Jaeger/Tempo:

- **Ingest:** subscribe to `syntropy:spans`.
- **Assemble:** accumulate spans by `traceId` (in-memory ring buffer, capped + TTL); link
  children by `parentSpanId`; the root is the span with no parent.
- **Serve:**
  - `GET /trace/:traceId` → the assembled tree (+ per-span waterfall offsets/widths).
  - `GET /traces` → recent traces (id, root name, service, total duration, span count, status).
  - **WebSocket** feed → live waterfall panel in the existing dashboard.
- **Waterfall math:** for each span, `offset = startTime − trace.startTime`, `bar = durationMs`.

It reuses the dashboard you already have — a new **"Trace" tab** next to the live log view,
so the same order shows both its **log stream** (grouped by correlationId) and its
**span waterfall** (grouped by traceId), joined by identity.

---

## 7. Worked example — one order

```
POST /api/orders                          ┌ gateway  server   ├───────────────┤
  → create_order                          │ orders   server     ├───────────┤
      → persist_redis                      │ orders  internal      ├─┤
      → publish order.created (producer)   │ orders  producer        ├┤
          → reserve_stock (consumer) 🐍     │ inventory consumer         ├────┤
          → charge_card   (consumer)       │ payments  consumer         ├───┤
```
`traceparent` carries `traceId` unchanged from the browser click to the Python consumer;
each service adds its spans under the parent it received. The collector draws the tree above.

---

## 8. Phased implementation (when we build it)

1. **Codec + client + sink (TS shared):** `traceparent` compose/parse, `withSpan`, the
   span `AdapterTransport` on `syntropy:spans`, `traceId`/`spanId` in context (+ log envelope).
2. **Instrument the TS services:** gateway (`server` + `client`), orders (`server` +
   `internal` + `producer`), payments/notifications (`consumer`).
3. **Collector service** (`services/tracing/`) + the dashboard **Trace** tab.
4. **Python** (`inventory-py`): `span()` context manager in the slpy world, same channel/schema.
5. *(later)* **.NET** payments, once that slice exists.

---

## 9. Open questions (decide before coding)

- **correlationId ↔ traceId bridge:** make `correlationId := traceId` (one identity, cleanest),
  or carry both and let the collector join? Leaning: **one identity** (seed correlationId from traceId).
- **Collector transport:** Redis pub/sub (fire-and-forget, matches the log bus) vs a Redis
  Stream (replayable, survives a late-joining collector). Leaning: **Stream** for spans, since a
  trace is only useful once *complete* and a late subscriber would miss early spans.
- **Clock skew across services:** durations are per-span (local monotonic clock) so they're
  correct; only the *absolute* waterfall offsets can skew across hosts. Fine for the demo; note it.
- **Span `kind` for Kafka:** producer/consumer spans are **linked**, not strictly parent/child
  in OTel. Schematic version: treat them as parent→child for a single readable tree; note the simplification.
```
