namespace Traceability.Domain;

/// <summary>Immutable response DTOs served by the endpoints.</summary>

public sealed record IngestResponse(int Accepted, int Dropped);

public sealed record HealthResponse(string Status, double UptimeSeconds, int TracesInStore);

public sealed record MetricsSnapshot(
    long SpansReceived,
    long LogsReceived,
    long Dropped,
    int TracesInStore,
    double UptimeSeconds,
    double RssMb
);
