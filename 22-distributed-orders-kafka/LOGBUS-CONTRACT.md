# Log-bus contract — the one integration point for polyglot services

Every service in this demo — regardless of language — publishes its **already-masked**
log entries to a single Redis pub/sub channel. The gateway subscribes, groups by
`correlationId`, and streams each entry to the live dashboard over WebSocket.

Because SyntropyLog (TS), sl4n (.NET) and slpy (Python) all build the **same flat log
entry shape**, a polyglot service does not translate anything: it emits its native log
entry as JSON to the channel. That is the whole contract.

## Channel

```
syntropy:logbus
```

## Envelope (JSON, one entry per message)

| Field           | Type    | Required | Notes                                                        |
|-----------------|---------|----------|--------------------------------------------------------------|
| `service`       | string  | yes      | Logger/service name (`gateway`, `orders`, `inventory`, …).   |
| `level`         | string  | yes      | `info` \| `warn` \| `error` \| `audit` \| `debug`.           |
| `message`       | string  | yes      | The log message.                                             |
| `timestamp`     | string  | yes      | ISO-8601 with offset, e.g. `2026-07-09T14:00:00.123+00:00`.  |
| `correlationId` | string  | no*      | **The stitch key.** Present on every request-scoped log.     |
| `tenantId`      | string  | no       | Propagated alongside the correlation id.                     |
| *(others)*      | any     | no       | Whitelisted context fields (`orderId`, `operation`, …).      |

\* Optional at the schema level, but it is what the dashboard groups by — a
request-scoped log without it will render as an orphan.

### Why the fields line up for free

Each engine builds the entry as `{ level, message, timestamp, service, ...context }`.
The **conceptual context field names are chosen to be identical on the wire of the
envelope**: `correlationId`, `tenantId`, `orderId`, `operation`. So a Python service
that names its context field `correlationId` emits `"correlationId": "…"` verbatim —
the gateway needs no per-language adapter.

> Note the split of concerns: the envelope uses fixed field names, but the **transport
> wire names** (HTTP headers, Kafka headers) are still per-service and translated by the
> `context.inbound` / `context.outbound` maps. Uniform envelope, free-form wire — see below.

## Correlation on the wire (Kafka + HTTP)

The correlation id survives each hop through the inbound/outbound maps, **not** by every
service using the same header name. For the Kafka edges in this demo the agreed wire
names are:

| Conceptual field | Kafka header name | HTTP header name    |
|------------------|-------------------|---------------------|
| `correlationId`  | `correlationId`   | `x-correlation-id`  |
| `tenantId`       | `tenantId`        | `x-tenant-id`       |

A consumer maps the wire name back to the conceptual field via `context.inbound.kafka`;
a producer maps the conceptual field to the wire name via `context.outbound.kafka`. Any
service may use different wire names internally as long as the **two endpoints of a given
edge agree** — that is the entire point of the inbound/outbound design.

## Per-language emitters

- **TS (SyntropyLog)** — `AdapterTransport` + `UniversalAdapter` whose executor does
  `redis.publish(LOGBUS_CHANNEL, JSON.stringify({ ...entry, service }))`.
  See `packages/shared/src/syntropy.ts`.
- **Python (slpy)** — `AdapterTransport('logbus', UniversalAdapter(executor))` whose
  executor does `await redis.publish(LOGBUS_CHANNEL, json.dumps(entry))`.
  See `services/inventory-py/syntropy.py`. The entry already carries `service` (the
  logger name), so no override is needed.
- **.NET (sl4n)** — an `ITransport` that serializes the entry and `PUBLISH`es it.
  (Pending — the `payments` service in the next slice.)
