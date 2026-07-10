using System.Collections.Concurrent;
using Traceability.Domain;

namespace Traceability.Store;

/// <summary>
/// Bounded, thread-safe, in-memory span store — a ring buffer of traces. Drop-oldest
/// when full (Silent-Observer spirit: never block a producing service, never grow
/// unbounded). Enough for the demo; the WAL/stream-backed store is a later phase.
/// </summary>
public sealed class InMemorySpanStore : ISpanStore
{
    private const int MaxTraces = 10_000;
    private const int MaxSpansPerTrace = 1_000;

    private sealed class Bucket
    {
        public readonly List<SpanRecord> Spans = new();
    }

    private readonly ConcurrentDictionary<string, Bucket> _traces = new();
    // Insertion order of trace ids, for drop-oldest eviction and "recent" listing.
    private readonly ConcurrentQueue<string> _order = new();

    public int TraceCount => _traces.Count;

    public int AddSpans(IReadOnlyList<SpanRecord> spans)
    {
        if (spans.Count == 0)
            return 0;

        int kept = 0;
        foreach (SpanRecord span in spans)
        {
            Bucket bucket = _traces.GetOrAdd(span.TraceId, TrackNewTrace);
            lock (bucket.Spans)
            {
                if (bucket.Spans.Count >= MaxSpansPerTrace)
                    continue; // guard: cap a pathological single trace
                bucket.Spans.Add(span);
                kept++;
            }
        }

        EvictOverflow();
        return kept;
    }

    public IReadOnlyList<SpanRecord>? GetTrace(string traceId)
    {
        if (!_traces.TryGetValue(traceId, out Bucket? bucket))
            return null;

        lock (bucket.Spans)
            return bucket.Spans.ToArray(); // snapshot — callers never see the live list
    }

    public IReadOnlyList<string> RecentTraceIds(int limit)
    {
        if (limit <= 0)
            return [];

        // Newest first: take from the tail of the insertion-ordered snapshot.
        string[] all = _order.ToArray();
        int take = Math.Min(limit, all.Length);
        string[] recent = new string[take];
        for (int i = 0; i < take; i++)
            recent[i] = all[all.Length - 1 - i];
        return recent;
    }

    // ── internals ────────────────────────────────────────────────────────────
    private Bucket TrackNewTrace(string traceId)
    {
        _order.Enqueue(traceId);
        return new Bucket();
    }

    private void EvictOverflow()
    {
        while (_traces.Count > MaxTraces && _order.TryDequeue(out string? oldest))
        {
            if (oldest is not null)
                _traces.TryRemove(oldest, out _);
        }
    }
}
