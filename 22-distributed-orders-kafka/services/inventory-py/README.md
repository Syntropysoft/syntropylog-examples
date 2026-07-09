# inventory · Python (slpy) — the polyglot twin

This is the **Python** implementation of the `inventory` service, built on
[`slpy`](https://github.com/Syntropysoft/syntropylog.py). It is a drop-in replacement
for the TypeScript `services/inventory` in the exact same topology: it consumes
`order.created` from Kafka, reserves stock in Redis, and publishes `stock.reserved`.

The point: **one correlation-id crosses a language boundary.** An order placed in the
browser threads its id through Express → NestJS → Kafka → **this Python service** →
back onto Kafka → the notifications worker, and every log — TS or Python — lands on the
same live dashboard, grouped by that id. No adapter, no translation: slpy builds the
same log envelope as SyntropyLog (see [`../../LOGBUS-CONTRACT.md`](../../LOGBUS-CONTRACT.md)).

## How the id survives

- **Inbound (Kafka → context):** `kafka_bus.extract_inbound_context()` reads the
  `context.inbound.kafka` map (`{correlationId: 'correlationId', tenantId: 'tenantId'}`)
  and rehydrates a fresh `slpy.context()` scope per message — the Python equivalent of
  `extractInboundContext(...)` on the TS side.
- **Outbound (context → Kafka):** `slpy.get_propagation_headers('kafka')` turns the
  context back into wire headers when publishing `stock.reserved`.
- **Log bus:** an `AdapterTransport` publishes every already-masked entry to the
  `syntropy:logbus` Redis channel. The entry already carries `correlationId` — that is
  the stitch key the gateway groups by.

The wire names are declared per service in `syntropy.py` (`CONTEXT_CONFIG`), never
hard-coded globally — the inbound/outbound design is exactly what lets a Python service
join a TypeScript mesh without everyone agreeing on one header name.

## Run it

Prereqs: infra up (`npm run infra:up` at the example root) and the sibling `slpy`
repo checked out at `_syntrosoft/syntropylog.py` (used editable; falls back to the
published `slpy-log` if absent).

```bash
./run.sh          # creates .venv, installs deps + slpy, runs on :3003
```

Then place an order from the storefront and watch the `inventory` logs appear in the
dashboard in Python, sharing the same `correlationId` as the surrounding TS services.

> Run **either** this Python service **or** the TypeScript `inventory` — not both. They
> share the Kafka consumer group `inventory-service`, so running both would split the
> single partition and only one would see each order. `npm run dev:polyglot` at the root
> launches the mesh with this Python service in place of the TS one.

## Files

| File           | Role                                                                    |
|----------------|-------------------------------------------------------------------------|
| `main.py`      | FastAPI app: consume `order.created`, reserve stock, publish `stock.reserved`, `/health` + `/stock`. |
| `syntropy.py`  | slpy bootstrap: `CONTEXT_CONFIG`, logging matrix, masking, Redis log-bus transport. |
| `kafka_bus.py` | aiokafka producer/consumer + inbound extraction + propagation headers. |
| `constants.py` | topics, groups, keys, field + service names — mirror of `shared/constants.ts`. |
| `env.py`       | broker/redis/port defaults — mirror of `shared/env.ts`.                 |
