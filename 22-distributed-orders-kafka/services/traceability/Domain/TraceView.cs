namespace Traceability.Domain;

/// <summary>
/// Pure output types — what the assembler produces and the endpoints serve.
/// Immutable; hold no behaviour beyond being data.
/// </summary>

/// <summary>One row of the waterfall: a span placed on the trace timeline.</summary>
public sealed record WaterfallEntry(
    string SpanId,
    string? ParentSpanId,
    string Name,
    string Service,
    string Kind,
    string Status,
    double OffsetMs,
    double DurationMs,
    int Depth
);

/// <summary>A fully assembled trace: its spans laid out as a waterfall.</summary>
public sealed record TraceView(
    string TraceId,
    double TotalDurationMs,
    int SpanCount,
    string Status,
    IReadOnlyList<WaterfallEntry> Waterfall
);

/// <summary>A one-line summary of a trace, for the recent-traces list.</summary>
public sealed record TraceSummary(
    string TraceId,
    string RootName,
    string RootService,
    double TotalDurationMs,
    int SpanCount,
    string Status
);
