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
| **Rust engine in isolation** | Native addon called directly — decomposes the complex cost into Rust vs JS (only runs when the addon is active) |
| **Fluent API** | `withRetention(complexJson).info(...)` — child logger creation + log per iteration |

Plus a **memory section**: heap delta over 100,000 iterations per logger.

---

## How to Run

```bash
cd 17-benchmark
npm install

# Throughput only (the memory section is skipped without --expose-gc)
npm run bench

# Throughput + memory — passes --expose-gc for stable heap deltas
npm run bench:memory
```

---

## This is not a 1:1 comparison

Pino and Winston are **loggers**. SyntropyLog is an **observability and compliance pipeline** that, on *every* call, does what those need plugins or hand-written code to do. The real question is not "who writes a plain string fastest" — it is "what does compliance-grade logging cost", and the answer is: **roughly the same as a bare logger.**

| Capability (out of the box) | SyntropyLog | Pino | Winston |
|---|:---:|:---:|:---:|
| Structured JSON | ✅ | ✅ | ✅ |
| Masking / PII redaction | ✅ | ❌ (plugin) | ❌ |
| Logging Matrix (fields allowed per level) | ✅ | ❌ | ❌ |
| Retention / audit routing | ✅ | ❌ | ❌ |
| Context propagation (AsyncLocalStorage) | ✅ | ❌ (manual) | ❌ |
| Sanitization / log-injection defense | ✅ | ❌ | ❌ |
| Native single-pass addon (Rust) | ✅ | ❌ | ❌ |

Every number below is SyntropyLog running that **full stack** — not a trimmed-down logger.

---

## Results — three environments (2026-05-30, Rust addon active)

Captured the same day. Source: `npm run bench:memory`.

| Label | Machine | OS / environment | Runtime |
|-------|---------|------------------|---------|
| **M2** | MacBook Pro (Apple M2) | macOS (native) | Node v20.20.1 (arm64-darwin) |
| **AMD** | AMD Ryzen 7 7735HS | **WSL2 on Windows 11** | Node v20.20.2 (x64-linux) |
| **GH** | AMD EPYC 7763 | **GitHub Actions CI (Ubuntu)** | Node v20.20.2 (x64-linux) |

> **Note:** only **M2** is bare-metal native. **AMD** runs under WSL2 and **GH** is a shared CI runner — both virtualized, both conservative. The CI runner is especially noisy for the complex/tail group (see the disclaimer below).

### Logging Throughput (simple JSON) — avg µs

| Logger | M2 | AMD | GH |
|--------|----|-----|----|
| console.log (baseline) | 0.14 | 0.25 | 0.26 |
| **SyntropyLog (JSON)** | **0.93** 🥇 | **1.41** 🥇 | 1.61 |
| Pino | 1.22 | 1.60 | **1.06** |
| Winston | 1.17 | 2.01 | 3.55 |

**This isn't a like-for-like race.** Pino and Winston only format and write; every SyntropyLog number here *also* runs masking, matrix filtering, sanitization, and the context pipeline. SyntropyLog is the **fastest of the three** on M2 and WSL2; on x64 server CPUs a bare Pino is consistently faster on plain strings (gap varies on the noisy CI runner). SyntropyLog is **faster than Winston everywhere** — while doing strictly more on every call.

### Complex Object — full pipeline cost (Pino/Winston: no-masking reference) — avg µs

| Logger | M2 | AMD | GH | Masking active |
|--------|----|-----|----|----------------|
| Pino (complex object) | 2.14 | 2.69 | 4.00 | ❌ |
| Winston (complex object) | 3.58 | 8.67 | 9.96 | ❌ |
| **SyntropyLog (with masking)** | **5.00** | **5.96** | **7.77** | **✅** |

This is **not** a head-to-head: SyntropyLog masks, filters by matrix, sanitizes and reads context; Pino and Winston only serialize, so their numbers are a **no-masking reference**. On quiet hardware (M2, WSL2) the full pipeline runs at ~2.2× a bare Pino — that delta *is* the work they don't do. It even lands close to Winston (faster on AMD/GH, slower on M2).

> **⚠️ CI noise — don't over-read the GH complex column.** Three runs on the *same* GitHub EPYC box, no code change, gave wildly different complex numbers: SyntropyLog **11.69 → 7.72 → 7.77 µs** and Pino **3.06 → 7.64 → 4.00 µs**. The shared CI runner is too noisy for the complex/tail group. The reliable signal is the bare-metal-ish M2/WSL2 figures above; the GH column is from the latest run and is indicative only.

### Where the complex-object cost actually goes (Rust vs JS)

The "Rust engine in isolation" group decomposes that complex number. It calls the native addon **directly**, outside the logger, so we can see how much of the cost is the Rust engine doing real work (serialize + mask + sanitize) vs the JS framework around it. M2, 3-run avg:

| Layer | avg µs | Share of complex |
|-------|-------:|-----------------:|
| **Rust engine** (serialize + mask + sanitize, pre-stringified metadata) | ~4.7 | **~87%** |
| `JSON.stringify(metadata)` in JS before crossing | ~0.6 | ~11% |
| Rest of the SyntropyLog JS pipeline (matrix + context + merge + transport) | ~0.1 | ~2% |
| **Full `slLogger.info('User action', complexObj)`** | **~5.4** | 100% |

**Takeaway:** the SyntropyLog JS layer is nearly free (~0.1 µs). The complex-object number is *not* framework bloat — it is the actual masking + serialization work, and that work runs in Rust. There is also a time/memory trade-off between the two native paths:

| Native path | avg µs | bytes/op | Used by |
|-------------|-------:|---------:|---------|
| `fastSerializeFromJson` (JS stringifies, Rust parses once) | ~5.3 | ~142 | logger default (fast path) |
| `fastSerialize` (Rust crosses the JS object field-by-field) | ~7.0 | ~37 | fallback for circular/non-serializable |

The JSON path is faster but allocates the intermediate string in JS; the object path allocates almost nothing but pays per-field N-API crossing. The logger uses the JSON path by default and falls back to the object path only when `JSON.stringify` can't run.

### Memory (100,000 iterations) — bytes/op

| Logger | M2 | AMD | GH |
|--------|----|-----|----|
| console.log (baseline) | 148 | 149 | 148 |
| SyntropyLog (JSON) | **182** | **182** | **182** |
| Pino | 153 | 152 | 183 |
| Winston | 932 | 947 | 934 |
| SyntropyLog (with masking) | 230 | 220 | 225 |
| Pino (complex object) | 121 | 124 | ~181 |
| Winston (complex object) | 2'289 | 2'249 | 2'284 |
| SyntropyLog (withRetention complex) | 254 | 251 | 253 |

### Fluent API (withRetention + complex JSON) — avg µs

| Benchmark | M2 | AMD | GH |
|-----------|----|-----|----|
| SyntropyLog (withRetention complex) | 6.58 | 7.30 | 10.04 |

> Full per-percentile tables (p75/p99/p999) live in the library's [benchmark report](https://github.com/Syntropysoft/SyntropyLog/blob/main/docs/benchmark-report.md).

---

## Reading the Results

### Throughput — competitive with Pino, doing far more

Remember this is **not** a like-for-like race — Pino and Winston only format a string; SyntropyLog runs the whole safety pipeline on the same call. It is the **fastest of the three** on M2 and WSL2 (0.93 / 1.41 µs); on x64 server CPUs a bare Pino is consistently faster on plain strings (the margin varies run-to-run on the noisy CI runner). It beats Winston in every environment, while doing strictly more.

### Complex object — not a comparison, a reference

This group is **not** a head-to-head: SyntropyLog masks, Pino and Winston don't. Their numbers are shown only as a no-masking reference to size the pipeline cost. On quiet hardware (M2, WSL2) the full pipeline runs at ~2.2× a bare Pino — that delta *is* the redaction + matrix + sanitization + context work the others skip. (The CI numbers for this group are noisy — see the disclaimer above.)

### Memory — the real differentiator

| Logger | bytes/op (simple) |
|--------|-------------------|
| SyntropyLog (JSON) | **~181** |
| Pino | ~152–181 |
| Winston | **~940** (≈5x more) |

On simple logs SyntropyLog matches Pino (181 vs 181 on CI) and is far below Winston (≈5x less). On complex objects with masking, SyntropyLog uses ~220–230 bytes/op vs Winston's ~2,250–2,289 — **~10x less memory while also doing masking**.

### Fluent API overhead

`withRetention(complexJson).info(...)` — child logger creation + masking + log — runs at 6.6–10.3 µs. For a call that binds compliance metadata, sanitizes it, and routes it to the executor, that is negligible in any real application.

### What the overhead is

The gap between SyntropyLog and a bare logger is the cost of:
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
