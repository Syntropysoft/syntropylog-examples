using Traceability.Domain;

namespace Traceability.Store;

/// <summary>
/// Abstraction over span retention (DIP). The endpoints depend on this, not on a
/// concrete store — so the in-memory ring buffer can be swapped for a WAL/Redis-Stream
/// backed one without touching the transport layer or the pure assembler.
/// </summary>
public interface ISpanStore
{
    /// <summary>Store a batch already validated by the caller. Returns how many were kept.</summary>
    int AddSpans(IReadOnlyList<SpanRecord> spans);

    /// <summary>All spans seen for a trace, or null if unknown.</summary>
    IReadOnlyList<SpanRecord>? GetTrace(string traceId);

    /// <summary>The most recent trace ids, newest first (bounded by <paramref name="limit"/>).</summary>
    IReadOnlyList<string> RecentTraceIds(int limit);

    /// <summary>How many traces are currently retained.</summary>
    int TraceCount { get; }
}
