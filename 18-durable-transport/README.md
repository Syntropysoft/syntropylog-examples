# Example 18: DurableAdapterTransport (guaranteed delivery)

`DurableAdapterTransport` turns audit-flagged log entries into **delivery-guaranteed**
writes. It wraps any `executor` (DB, OTel collector, HTTP endpoint, broker) with:

- an **in-memory buffer** (bounded — `bufferSize`, default 1000 — so it can't OOM a pod)
- **exponential-backoff retry** (`maxRetries`, `initialBackoffMs`, `maxBackoffMs`)
- a **dead-letter hook** (`onDrop`) for entries that can't be delivered, with a
  reason of `'buffer-full'` or `'retries-exhausted'`

It is **selective by default** (`durableOnlyForRetention: true`): only entries tagged
with retention metadata (`withRetention(...)`) take the durable path. Ordinary
`info` / `warn` logs keep cheap fire-and-forget semantics.

## What this example shows

1. An audit event whose sink fails twice, then **recovers** via retry — no data lost.
2. An audit event whose sink stays down, **exhausts retries**, and lands in the DLQ.

(Plain `info`/`warn` logs without a `withRetention(...)` tag skip the durable path
entirely — fire-and-forget, no buffering, no retries.)

## Run

```bash
npm install
npm run dev
```

## Key options

| Option | Default | Purpose |
|--------|---------|---------|
| `executor` | — | the function that persists each entry; must reject on failure to trigger retry |
| `bufferSize` | `1000` | max buffered entries before `dropStrategy` kicks in |
| `maxRetries` | `5` | retries after the first attempt (so `4` = up to 5 total attempts) |
| `initialBackoffMs` / `maxBackoffMs` | `100` / `30000` | backoff growth and cap |
| `dropStrategy` | `'oldest'` | what to drop when the buffer is full (`'oldest'` / `'newest'` / `'reject'`) |
| `onDrop` | — | **you must handle this** — persist dropped entries somewhere durable |
| `durableOnlyForRetention` | `true` | when true, only retention-tagged entries are made durable |
| `flushTimeoutMs` | `5000` | how long `flush()` / `shutdown()` wait before DLQ-ing the remainder |

> `flush()` and `shutdown()` drain the buffer; anything still undelivered after
> `flushTimeoutMs` is sent to `onDrop` with reason `'retries-exhausted'`.
