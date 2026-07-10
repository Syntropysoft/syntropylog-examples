using System.Globalization;

namespace Traceability.Domain;

/// <summary>
/// The functional core. Given a trace's spans, produce a waterfall — purely.
/// No I/O, no clock, no store: deterministic in its inputs, so it is trivially
/// unit-testable. The imperative shell (Program.cs) feeds it and serves the result.
/// </summary>
public static class TraceAssembler
{
    private const string StatusError = "error";
    private const string StatusOk = "ok";

    /// <summary>Assemble spans of one trace into a timeline (offsets, depths, status rollup).</summary>
    public static TraceView Assemble(string traceId, IReadOnlyList<SpanRecord> spans)
    {
        if (spans.Count == 0)
            return new TraceView(traceId, 0, 0, StatusOk, []);

        DateTimeOffset traceStart = MinStart(spans);
        IReadOnlyDictionary<string, string?> parentOf = ParentIndex(spans);

        List<WaterfallEntry> waterfall = new(spans.Count);
        foreach (SpanRecord span in spans)
        {
            double offset = TryParse(span.StartTime, out DateTimeOffset start)
                ? (start - traceStart).TotalMilliseconds
                : 0;
            waterfall.Add(new WaterfallEntry(
                span.SpanId,
                Normalize(span.ParentSpanId),
                span.Name,
                span.Service,
                span.Kind,
                span.Status,
                offset < 0 ? 0 : offset,
                span.DurationMs,
                Depth(span.SpanId, parentOf)));
        }

        waterfall.Sort(static (a, b) => a.OffsetMs.CompareTo(b.OffsetMs));

        return new TraceView(
            traceId,
            TotalDurationMs(spans, traceStart),
            spans.Count,
            RollupStatus(spans),
            waterfall);
    }

    /// <summary>One-line summary for the recent-traces list — pure.</summary>
    public static TraceSummary Summarize(string traceId, IReadOnlyList<SpanRecord> spans)
    {
        SpanRecord? root = Root(spans);
        DateTimeOffset traceStart = spans.Count == 0 ? default : MinStart(spans);
        return new TraceSummary(
            traceId,
            root?.Name ?? "(unknown)",
            root?.Service ?? "(unknown)",
            spans.Count == 0 ? 0 : TotalDurationMs(spans, traceStart),
            spans.Count,
            RollupStatus(spans));
    }

    // ── pure helpers ─────────────────────────────────────────────────────────
    private static string? Normalize(string? parentSpanId) =>
        string.IsNullOrEmpty(parentSpanId) ? null : parentSpanId;

    private static IReadOnlyDictionary<string, string?> ParentIndex(IReadOnlyList<SpanRecord> spans)
    {
        Dictionary<string, string?> index = new(spans.Count);
        foreach (SpanRecord span in spans)
            index[span.SpanId] = Normalize(span.ParentSpanId);
        return index;
    }

    /// <summary>
    /// Depth = number of ancestors <em>within this trace</em>. An edge is counted only when
    /// the parent is itself a span in the set; a parent that lives outside (the inbound
    /// caller's span, or another service's not-yet-arrived batch) marks the local root at
    /// depth 0. Cycle/orphan safe (bounded).
    /// </summary>
    private static int Depth(string spanId, IReadOnlyDictionary<string, string?> parentOf)
    {
        int depth = 0;
        string current = spanId;
        while (parentOf.TryGetValue(current, out string? parent)
               && parent is not null
               && parentOf.ContainsKey(parent))
        {
            depth++;
            if (depth >= parentOf.Count)
                break; // guard: a cycle or a chain longer than the node set — stop
            current = parent;
        }
        return depth;
    }

    private static SpanRecord? Root(IReadOnlyList<SpanRecord> spans)
    {
        HashSet<string> ids = new(spans.Count);
        foreach (SpanRecord s in spans)
            ids.Add(s.SpanId);

        foreach (SpanRecord s in spans)
        {
            string? parent = Normalize(s.ParentSpanId);
            if (parent is null || !ids.Contains(parent))
                return s; // no parent, or parent lives in another service's batch → treat as root
        }
        return spans.Count > 0 ? spans[0] : null;
    }

    private static DateTimeOffset MinStart(IReadOnlyList<SpanRecord> spans)
    {
        DateTimeOffset min = DateTimeOffset.MaxValue;
        bool any = false;
        foreach (SpanRecord s in spans)
        {
            if (!TryParse(s.StartTime, out DateTimeOffset start))
                continue;
            any = true;
            if (start < min)
                min = start;
        }
        return any ? min : DateTimeOffset.UnixEpoch;
    }

    private static double TotalDurationMs(IReadOnlyList<SpanRecord> spans, DateTimeOffset traceStart)
    {
        double maxEnd = 0;
        foreach (SpanRecord s in spans)
        {
            double end = TryParse(s.EndTime, out DateTimeOffset e)
                ? (e - traceStart).TotalMilliseconds
                : (TryParse(s.StartTime, out DateTimeOffset st) ? (st - traceStart).TotalMilliseconds : 0) + s.DurationMs;
            if (end > maxEnd)
                maxEnd = end;
        }
        return maxEnd;
    }

    private static string RollupStatus(IReadOnlyList<SpanRecord> spans)
    {
        foreach (SpanRecord s in spans)
        {
            if (string.Equals(s.Status, StatusError, StringComparison.OrdinalIgnoreCase))
                return StatusError;
        }
        return StatusOk;
    }

    private static bool TryParse(string? iso, out DateTimeOffset value) =>
        DateTimeOffset.TryParse(iso, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out value);
}
