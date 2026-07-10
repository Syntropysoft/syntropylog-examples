using System.Text.Json;

namespace Traceability.Domain;

/// <summary>
/// Pure readers for the top-level index fields of a log entry. The raw entry is stored verbatim
/// (masking is the source's job) — these only pull out <c>correlationId</c> and <c>timestamp</c>
/// so the store can INDEX and ORDER. No I/O, no mutation: deterministic in its input.
/// </summary>
public static class LogFields
{
    /// <summary>Read a top-level string field off a log entry, or null if absent/non-string.</summary>
    public static string? ReadString(JsonElement entry, string name) =>
        entry.ValueKind == JsonValueKind.Object
        && entry.TryGetProperty(name, out JsonElement value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
}
