namespace Traceability.Domain;

/// <summary>
/// Immutable input DTOs — the wire schema every service pushes (see LOGBUS-CONTRACT.md
/// and TRACING-DESIGN.md). Records, so they are value-comparable and never mutated.
/// </summary>

/// <summary>One timed unit of work, as posted to <c>/v1/spans</c>.</summary>
public sealed record SpanRecord(
    string TraceId,
    string SpanId,
    string? ParentSpanId,
    string Name,
    string Service,
    string Kind,
    string StartTime,
    string EndTime,
    double DurationMs,
    string Status,
    System.Text.Json.JsonElement? Attributes
);

/// <summary>One already-masked log entry, as posted to <c>/v1/logs</c>.</summary>
public sealed record LogRecord(
    string Service,
    string Level,
    string Message,
    string Timestamp,
    string? CorrelationId,
    string? TraceId,
    string? SpanId
);
