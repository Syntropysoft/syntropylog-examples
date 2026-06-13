# Example 20: `getStats()` — self-observability

`syntropyLog.getStats()` returns an aggregated snapshot of the instance, so you
can monitor the logger itself (and expose it on a health/metrics endpoint).

```ts
{
  state,              // lifecycle state, e.g. 'READY'
  initializedAt,      // epoch ms, or null before init()
  uptimeMs,
  nativeAddonActive,  // true when the Rust addon is in use
  failures: {
    log,                    // a log call failed (serialization or transport)
    transport,              // a transport rejected (on log / flush / shutdown)
    serializationFallback,  // native pipeline yielded to the JS pipeline
    masking,                // masking failed (e.g. regex timeout)
    step,                   // pipeline step failures, keyed by step name
  }
}
```

The counters are built by transparently wrapping your hooks (`onLogFailure`,
`onTransportError`, `onSerializationFallback`, `masking.onMaskingError`,
`onStepError`) — **your callbacks still fire unchanged**; `getStats()` just also
counts them.

## What this example shows

- A healthy snapshot right after `init()` (all counters zero, `state: 'READY'`).
- A transport that rejects three deliberately-marked logs, then a snapshot where
  `failures.log` is `3` (the other counters stay `0` until their own paths fire).

## Run

```bash
npm install
npm run dev
```
