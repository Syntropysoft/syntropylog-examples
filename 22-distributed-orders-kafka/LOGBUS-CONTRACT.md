# Log envelope contract — the one integration point for polyglot services

Every service in this demo — regardless of language — pushes its **already-masked** log
entries over HTTP to the **.NET collector** (`POST /v1/spans`' sibling, `POST /v1/logs`).
The collector groups by `correlationId` / `traceId` and streams each entry to the live
dashboard over **SSE**.

Because SyntropyLog (TS), sl4n (.NET) and slpy (Python) all build the **same flat log entry
shape**, a polyglot service does not translate anything: it emits its native log entry as
JSON to the endpoint. That is the whole contract.

> This started life as a Redis pub/sub "log bus" (hence the filename), which the gateway
> bridged to the dashboard over WebSocket. That path has been **retired** — the collector
> ingests over HTTP and serves the dashboard over SSE. The **envelope below is unchanged**;
> only the transport moved. Redis is now state-only.

## Endpoint

```
POST http://<collector>:9317/v1/logs     # a JSON array of entries (batched)
```

The dashboard reads the collector's live feed at `GET /stream` (Server-Sent Events).

## Envelope (JSON, one entry per array element)

| Field           | Type    | Required | Notes                                                        |
|-----------------|---------|----------|--------------------------------------------------------------|
| `service`       | string  | yes      | Logger/service name (`gateway`, `orders`, `inventory`, …).   |
| `level`         | string  | yes      | `info` \| `warn` \| `error` \| `audit` \| `debug`.           |
| `message`       | string  | yes      | The log message.                                             |
| `timestamp`     | string  | yes      | ISO-8601 with offset, e.g. `2026-07-09T14:00:00.123+00:00`.  |
| `correlationId` | string  | no*      | **The stitch key.** Present on every request-scoped log.     |
| `tenantId`      | string  | no       | Propagated alongside the correlation id.                     |
| `traceId` / `spanId` | string | no  | Present when tracing is on — joins a log to its span.        |
| *(others)*      | any     | no       | Whitelisted context fields (`orderId`, `operation`, …).      |

\* Optional at the schema level, but it is what the dashboard groups by — a request-scoped
log without it will render as an orphan. The collector passes each entry through **verbatim**
(no field is dropped).

### Why the fields line up for free

Each engine builds the entry as `{ level, message, timestamp, service, ...context }`. The
**conceptual context field names are chosen to be identical on the wire of the envelope**:
`correlationId`, `tenantId`, `orderId`, `operation`. So a Python service that names its context
field `correlationId` emits `"correlationId": "…"` verbatim — the collector needs no per-language
adapter.

> Split of concerns: the envelope uses fixed field names, but the **transport wire names** (HTTP
> headers, Kafka headers) are still per-service and translated by the `context.inbound` /
> `context.outbound` maps. Uniform envelope, free-form wire — see below.

## Correlation on the wire (Kafka + HTTP)

The correlation id survives each hop through the inbound/outbound maps, **not** by every service
using the same header name. For the Kafka edges in this demo the agreed wire names are:

| Conceptual field | Kafka header name | HTTP header name    |
|------------------|-------------------|---------------------|
| `correlationId`  | `correlationId`   | `x-correlation-id`  |
| `tenantId`       | `tenantId`        | `x-tenant-id`       |

Tracing adds a **W3C `traceparent`** header on the same edges (see
[TRACING-DESIGN.md](TRACING-DESIGN.md)). A consumer maps a wire name back to the conceptual field
via `context.inbound.kafka`; a producer maps the conceptual field to the wire name via
`context.outbound.kafka`. Any service may use different wire names internally as long as the **two
endpoints of a given edge agree** — that is the entire point of the inbound/outbound design.

## Per-language emitters

All three use the same executor primitive with an **HTTP-push** sink (batched, Silent-Observer
drop, coexists-free with the console transport):

- **TS (SyntropyLog)** — `createCollectorLogTransport(endpoint)`: an `AdapterTransport` whose
  executor batches entries and `POST`s them to `/v1/logs`. See
  [`packages/shared/src/tracing.ts`](packages/shared/src/tracing.ts), wired in
  [`packages/shared/src/syntropy.ts`](packages/shared/src/syntropy.ts).
- **Python (slpy)** — `CollectorLogTransport`: a sync-append executor + an owned async httpx drain
  to `/v1/logs`. See [`services/inventory-py/tracing.py`](services/inventory-py/tracing.py), wired
  in [`services/inventory-py/syntropy.py`](services/inventory-py/syntropy.py).
- **.NET (sl4n)** — the collector itself is the **receiver** (`/v1/logs`), and it **dogfoods** sl4n
  for its own logs in the very same envelope shape. See
  [`services/traceability/`](services/traceability/).
