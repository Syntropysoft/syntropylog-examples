# traceability · .NET AOT (sl4n) — the observability collector

The **.NET** side of the polyglot mesh: a single **native AOT** binary that every service
(TS, Python) will push its **spans** (and later logs) to over HTTP. It assembles them into a
trace **waterfall** and serves it. Schematic OpenTelemetry Collector — see
[../../TRACING-DESIGN.md](../../TRACING-DESIGN.md). It logs *itself* with **sl4n**, dogfooding
the .NET member of the family.

> **Status: in production use by the demo.** Ingests logs + spans from all 5 services (TS + Python),
> assembles traces, and serves the live dashboard over SSE (logs + a live-filling waterfall). The
> `bench/latigazo.sh` load test is measured below.

## House standard — functional core / imperative shell

| Layer | Files | Nature |
|---|---|---|
| **Pure core** | `Domain/TraceAssembler.cs`, `Domain/Validation.cs` | No I/O, no clock, no store. `Assemble(spans) → waterfall` and the validation guards are pure & deterministic — trivially testable. |
| **Imperative shell** | `Program.cs` | All side effects: HTTP endpoints, sl4n. Dependencies injected (`ISpanStore`, `Counters`) — no global state. Guard clauses on every endpoint. |
| **Store (DIP)** | `Store/ISpanStore.cs` + `InMemorySpanStore.cs` | Bounded, thread-safe ring buffer; drop-oldest. Swappable for a WAL/stream store without touching the assembler or endpoints. |
| **Telemetry** | `Telemetry/Counters.cs` | The only mutable state, isolated (lock-free `Interlocked`). |
| **AOT JSON** | `Json/IngestJsonContext.cs` | Source-generated metadata — no reflection (the AOT requirement). |

## Endpoints

| Method | Path | Role |
|---|---|---|
| POST | `/v1/spans` | Ingest a batch of spans (the hot path). |
| POST | `/v1/logs` | Ingest a batch of logs (counted in v1; nesting under spans is a later phase). |
| GET | `/trace/{traceId}` | The assembled waterfall for a trace (pure `TraceAssembler`). |
| GET | `/traces` | Recent trace summaries. |
| GET | `/healthz` | Liveness + uptime + traces in store. |
| GET | `/metrics` | Ingest counters + RSS. |

## Build & run

Prereqs: **.NET 10 SDK**, and clang (for AOT). `sl4n` 1.0.4 restores from NuGet.

```bash
# dev (JIT):
dotnet run -c Release            # listens on http://0.0.0.0:9317

# native AOT binary:
dotnet publish -c Release -r osx-arm64 -o bin/aot     # (linux: -r linux-x64)
./bin/aot/Traceability
```

## The latigazo (load test)

```bash
./bench/latigazo.sh                    # defaults: N=200000 requests, C=100 concurrency
N=500000 C=200 ./bench/latigazo.sh     # harder
```

It measures cold start, sustained throughput, p50/p95/p99, and peak RSS. **Observed on an
M-series Mac (net10.0 AOT):**

| Metric | Value |
|---|---|
| Throughput | **~27,500 req/s** (batches of 5 → **~138k spans/s**) |
| Failed requests | **0** / 200,000 |
| Latency | p50 **3 ms** · p95 **6 ms** · p99 **9 ms** |
| Cold start | **~200 ms** (no JIT warmup — full throughput from request #1) |
| Native binary | **10 MB** · **idle RSS ~24 MB** |

> Honest note: under a sustained burst the **server GC** lets RSS grow (throughput-first);
> the AOT wins here are the small binary, the ~200 ms cold start, and no warmup — not a flat
> RSS. Set `DOTNET_gcServer=0` (workstation GC) to trade throughput for a lower memory ceiling.
>
> The `dropped` counter under the synthetic bench is the single fixed trace hitting the
> per-trace span cap (the bench body reuses span ids) — not lost requests (`Failed: 0`).

## Files

```
Program.cs              imperative shell — endpoints, DI, sl4n
Domain/
  Records.cs            input DTOs (SpanRecord, LogRecord)
  TraceView.cs          pure output types (WaterfallEntry, TraceView, TraceSummary)
  Responses.cs          response DTOs
  Validation.cs         PURE guards
  TraceAssembler.cs     PURE functional core: spans → waterfall
Store/                  ISpanStore (DIP) + InMemorySpanStore (bounded ring buffer)
Telemetry/Counters.cs   ingest counters
Json/IngestJsonContext  source-generated JSON (AOT)
bench/                  latigazo.sh + span.json
```
