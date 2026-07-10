using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Sl4n;
using Traceability.Domain;
using Traceability.Json;
using Traceability.Store;
using Traceability.Telemetry;

// ── Imperative shell ─────────────────────────────────────────────────────────
// All side effects live here: HTTP, the store, sl4n. The trace-assembly *decision*
// is the pure TraceAssembler; validation is pure guards. Dependencies are injected,
// never global. The collector logs itself with sl4n (the .NET side of the family).

DateTimeOffset startedAt = DateTimeOffset.UtcNow;

WebApplicationBuilder builder = WebApplication.CreateSlimBuilder(args);

// AOT-safe JSON: bind & serialize through the source-generated context.
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.TypeInfoResolverChain.Insert(0, IngestJsonContext.Default));

// The collector's own logs go through sl4n (masked, structured), and nothing else.
builder.Logging.ClearProviders();
builder.Services.AddSl4n(cfg => cfg.Masking.EnableDefaultRules = true);

builder.Services.AddSingleton<ISpanStore, InMemorySpanStore>();
builder.Services.AddSingleton(new Counters(startedAt));

WebApplication app = builder.Build();
ILogger log = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("traceability");

// ── Ingest: POST /v1/spans (the hot path — the latigazo target) ──────────────
app.MapPost("/v1/spans", IResult (SpanRecord[] batch, ISpanStore store, Counters counters) =>
{
    if (batch is null || batch.Length == 0)
        return TypedResults.BadRequest(new IngestResponse(0, 0)); // guard: empty batch

    List<SpanRecord> valid = new(batch.Length);
    foreach (SpanRecord span in batch)
    {
        if (Validation.IsValidSpan(span)) // pure guard
            valid.Add(span);
    }

    int accepted = store.AddSpans(valid);
    int dropped = batch.Length - accepted;
    counters.AddSpans(accepted);
    if (dropped > 0)
        counters.AddDropped(dropped);

    return TypedResults.Ok(new IngestResponse(accepted, dropped));
});

// ── Ingest: POST /v1/logs (accepted + counted in v1; nesting under spans is later) ──
app.MapPost("/v1/logs", IResult (LogRecord[] batch, Counters counters) =>
{
    if (batch is null || batch.Length == 0)
        return TypedResults.BadRequest(new IngestResponse(0, 0)); // guard

    counters.AddLogs(batch.Length);
    return TypedResults.Ok(new IngestResponse(batch.Length, 0));
});

// ── Query: assembled trace (pure assembler) ──────────────────────────────────
app.MapGet("/trace/{traceId}", IResult (string traceId, ISpanStore store) =>
{
    IReadOnlyList<SpanRecord>? spans = store.GetTrace(traceId);
    if (spans is null || spans.Count == 0)
        return TypedResults.NotFound(); // guard

    return TypedResults.Ok(TraceAssembler.Assemble(traceId, spans));
});

// ── Query: recent traces ─────────────────────────────────────────────────────
app.MapGet("/traces", (ISpanStore store) =>
{
    IReadOnlyList<string> ids = store.RecentTraceIds(50);
    List<TraceSummary> summaries = new(ids.Count);
    foreach (string id in ids)
    {
        IReadOnlyList<SpanRecord>? spans = store.GetTrace(id);
        if (spans is not null)
            summaries.Add(TraceAssembler.Summarize(id, spans));
    }
    return TypedResults.Ok(summaries.ToArray());
});

// ── Ops: health + metrics (the AOT numbers) ──────────────────────────────────
app.MapGet("/healthz", (ISpanStore store) =>
    TypedResults.Ok(new HealthResponse("ok", (DateTimeOffset.UtcNow - startedAt).TotalSeconds, store.TraceCount)));

app.MapGet("/metrics", (ISpanStore store, Counters counters) =>
{
    (long spans, long logs, long dropped, double uptime) = counters.Snapshot(DateTimeOffset.UtcNow);
    double rssMb = Environment.WorkingSet / (1024.0 * 1024.0);
    return TypedResults.Ok(new MetricsSnapshot(spans, logs, dropped, store.TraceCount, uptime, rssMb));
});

log.LogInformation("traceability collector (.NET AOT) listening on {Url}", "http://0.0.0.0:9317");
app.Run("http://0.0.0.0:9317");
