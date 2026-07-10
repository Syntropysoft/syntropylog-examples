namespace Traceability.Telemetry;

/// <summary>
/// Ingest counters (the collector's own health signal). Lock-free via Interlocked;
/// the only mutable state in the service, isolated here (SRP).
/// </summary>
public sealed class Counters
{
    private readonly DateTimeOffset _start;
    private long _spansReceived;
    private long _logsReceived;
    private long _dropped;

    public Counters(DateTimeOffset start) => _start = start;

    public void AddSpans(long n) => Interlocked.Add(ref _spansReceived, n);

    public void AddLogs(long n) => Interlocked.Add(ref _logsReceived, n);

    public void AddDropped(long n) => Interlocked.Add(ref _dropped, n);

    public (long Spans, long Logs, long Dropped, double UptimeSeconds) Snapshot(DateTimeOffset now) => (
        Interlocked.Read(ref _spansReceived),
        Interlocked.Read(ref _logsReceived),
        Interlocked.Read(ref _dropped),
        (now - _start).TotalSeconds);
}
