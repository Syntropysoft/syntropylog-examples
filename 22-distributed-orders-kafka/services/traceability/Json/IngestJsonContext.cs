using System.Text.Json.Serialization;
using Traceability.Domain;

namespace Traceability.Json;

/// <summary>
/// Source-generated JSON metadata — the AOT requirement (no runtime reflection). Every
/// type that crosses the HTTP boundary is declared here; the shell registers this context
/// so minimal-API binding and serialization are fully trim/AOT-safe.
/// </summary>
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(SpanRecord[]))]
[JsonSerializable(typeof(LogRecord[]))]
[JsonSerializable(typeof(TraceView))]
[JsonSerializable(typeof(TraceSummary[]))]
[JsonSerializable(typeof(IngestResponse))]
[JsonSerializable(typeof(HealthResponse))]
[JsonSerializable(typeof(MetricsSnapshot))]
public partial class IngestJsonContext : JsonSerializerContext;
