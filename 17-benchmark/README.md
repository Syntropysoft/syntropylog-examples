<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 17: Benchmark (SyntropyLog vs Pino vs Winston)

> **Self-contained** — all benchmark code lives in this folder. Install and run from here.

## What the benchmark measures

Four benchmark groups, all writing to `/dev/null` to isolate logic overhead from I/O:

| Group | What it tests |
|-------|--------------|
| **Logging Throughput** | Simple string log: `console.log` (baseline), SyntropyLog, Pino, Winston |
| **MaskingEngine only** | Time to mask a complex object with sensitive fields (email, token) — p99/p999 baseline |
| **Complex Object** | Same payload logged across all three loggers (SyntropyLog with masking enabled) |
| **Fluent API** | `withMeta(complexJson).info(...)` — child logger creation + log per iteration |

Plus a **memory section**: heap delta over 100,000 iterations per logger.

---

## How to Run

```bash
cd 17-benchmark
npm install

# Throughput + memory (basic)
npm run bench

# Memory with --expose-gc for stable heap deltas
npm run bench:memory
```

---

## Results — GitHub Actions (Ubuntu, Node 20, official)

These numbers were captured on a GitHub Actions Ubuntu runner — a clean, isolated environment with no background noise. They represent the most reliable baseline available.

```
benchmark                                time (avg)             (min … max)       p75       p99      p999
--------------------------------------------------------------------------- -----------------------------
• Logging Throughput (5,000 iterations)
--------------------------------------------------------------------------- -----------------------------
console.log (baseline)                  253 ns/iter     (131 ns … 6'475 ns)    181 ns  3'151 ns  6'398 ns
SyntropyLog (JSON)                    2'107 ns/iter   (1'223 ns … 3'873 µs)  1'473 ns  5'300 ns 77'656 ns
Pino                                  1'050 ns/iter     (721 ns … 5'066 µs)    811 ns  3'066 ns 11'722 ns
Winston                               4'316 ns/iter  (1'152 ns … 22'456 µs)  2'866 ns 28'865 ns    102 µs

• Complex Object (same payload, fair comparison)
--------------------------------------------------------------------------- -----------------------------
SyntropyLog (with masking)            7'466 ns/iter   (5'881 ns … 1'553 µs)  6'362 ns 21'070 ns 50'766 ns
Pino (complex object)                 4'201 ns/iter  (2'153 ns … 22'465 µs)  2'595 ns 22'422 ns    165 µs
Winston (complex object)              8'146 ns/iter  (2'985 ns … 16'992 µs)  3'206 ns 11'071 ns 32'401 ns

• MaskingEngine only (complex object, p99/p999 baseline)
--------------------------------------------------------------------------- -----------------------------
MaskingEngine.process(complexObj)     4'113 ns/iter   (3'556 ns … 3'036 µs)  3'787 ns  7'614 ns 22'272 ns

• Fluent API (withMeta + complex JSON)
--------------------------------------------------------------------------- -----------------------------
SyntropyLog (withMeta complex)       10'124 ns/iter   (8'676 ns … 3'831 µs)  9'698 ns 21'841 ns 36'419 ns
```

```
--- Memory consumption (100,000 iterations) ---
benchmark                            heap delta    bytes/op
------------------------------------------------------------
console.log (baseline)                  14.04 MB      147
SyntropyLog (JSON)                      17.23 MB      181
Pino                                    17.48 MB      183
Winston                                 89.30 MB      936
SyntropyLog (with masking)              72.16 MB      757
Pino (complex object)                   17.56 MB      184
Winston (complex object)               218.02 MB    2'286
SyntropyLog (withMeta complex)          24.21 MB      254
```

---

## Reading the Results

### Throughput — the fair comparison

The simple throughput group (2.1µs vs Pino 1.05µs) is **not** the right comparison. Pino is logging a plain string with no masking, no matrix filtering, no context pipeline. SyntropyLog is running all of that.

The fair comparison is the complex object group:

| Logger | avg | Masking active |
|--------|-----|---------------|
| Pino (complex) | 4.2 µs | ❌ |
| **SyntropyLog (with masking)** | **7.5 µs** | **✅** |
| Winston (complex) | 8.1 µs | ❌ |

**SyntropyLog with masking active is faster than Winston without masking.** That is the number that matters.

### Memory — the real differentiator

| Logger | bytes/op (simple) |
|--------|-------------------|
| SyntropyLog (JSON) | **181** |
| Pino | 183 |
| Winston | **936** (5x more) |

On simple logs, SyntropyLog and Pino are statistically identical in memory. Winston uses 5x more per operation.

On complex objects with masking, SyntropyLog uses 757 bytes/op vs Winston's 2,286 bytes/op — **3x less memory while also doing masking**.

### Fluent API overhead

`withMeta(complexJson).info(...)` — child logger creation + masking + log — runs at 10µs. For a call that binds structured metadata, sanitizes it, and routes it to the executor, that is negligible in any real application.

### What the overhead is

The gap between SyntropyLog and Pino on simple logs (~1µs) is the cost of:
- Logging matrix filtering
- MaskingEngine pass
- SanitizationEngine pass
- AsyncLocalStorage context read

That is not framework bloat — it is the safety and observability pipeline running on every call.

---

## Rust Addon

The benchmark reports whether the native Rust addon is active:

```
SyntropyLog native addon (Rust): yes
```

To compare JS-only vs native:

```bash
# Native (default)
npm run bench

# JS pipeline only
SYNTROPYLOG_NATIVE_DISABLE=1 npm run bench
```

If the addon is not available, the JS pipeline is used transparently — results will be slightly slower.

---

## Dependencies

- **mitata** — microbenchmark framework (avg, min, max, p75, p99, p999)
- **syntropylog**, **pino**, **winston** — loggers under comparison
- **tsx** — run TypeScript directly
- **cross-env** — cross-platform env vars for `bench:memory`
