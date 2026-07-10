namespace Traceability.Domain;

/// <summary>
/// Pure validation guards for inbound records. No I/O, no state — just predicates.
/// The imperative shell uses these to drop malformed spans before they reach the store.
/// </summary>
public static class Validation
{
    /// <summary>True iff <paramref name="value"/> is exactly <paramref name="length"/> hex chars.</summary>
    public static bool IsHex(string? value, int length)
    {
        if (value is null || value.Length != length)
            return false;

        foreach (char c in value)
        {
            bool isHex = c is (>= '0' and <= '9') or (>= 'a' and <= 'f') or (>= 'A' and <= 'F');
            if (!isHex)
                return false;
        }

        return true;
    }

    /// <summary>W3C-shaped, well-formed span: 32-hex trace, 16-hex span, optional 16-hex parent.</summary>
    public static bool IsValidSpan(SpanRecord span)
    {
        if (span is null)
            return false;
        if (!IsHex(span.TraceId, 32))
            return false;
        if (!IsHex(span.SpanId, 16))
            return false;
        if (!string.IsNullOrEmpty(span.ParentSpanId) && !IsHex(span.ParentSpanId, 16))
            return false;
        if (string.IsNullOrWhiteSpace(span.Name) || string.IsNullOrWhiteSpace(span.Service))
            return false;

        return true;
    }
}
