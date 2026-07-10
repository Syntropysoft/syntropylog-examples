using Microsoft.Data.Sqlite;
using Traceability.Domain;

namespace Traceability.Store;

/// <summary>
/// A durable, SQLite-backed store — the persistent swap for <see cref="InMemorySpanStore"/>
/// behind the same <see cref="ISpanStore"/> abstraction (DIP: the endpoints and the pure
/// assembler don't change). Spans and logs survive a collector restart: kill it, restart it,
/// and the traces are still queryable. A single connection guarded by a lock (WAL journal);
/// simple and correct — durability trades some of the in-memory throughput.
/// </summary>
public sealed class SqliteStore : ISpanStore, IDisposable
{
    private readonly SqliteConnection _conn;
    private readonly object _gate = new();

    public SqliteStore(string path)
    {
        _conn = new SqliteConnection($"Data Source={path}");
        _conn.Open();
        Exec("PRAGMA journal_mode=WAL;");
        Exec("PRAGMA synchronous=NORMAL;");
        Exec(
            """
            CREATE TABLE IF NOT EXISTS spans(
              seq INTEGER PRIMARY KEY AUTOINCREMENT,
              traceId TEXT NOT NULL, spanId TEXT NOT NULL, parentSpanId TEXT,
              name TEXT, service TEXT, kind TEXT, startTime TEXT, endTime TEXT,
              durationMs REAL, status TEXT, attributes TEXT);
            """);
        Exec("CREATE INDEX IF NOT EXISTS ix_spans_trace ON spans(traceId);");
        Exec("CREATE TABLE IF NOT EXISTS logs(seq INTEGER PRIMARY KEY AUTOINCREMENT, correlationId TEXT, ts TEXT, raw TEXT NOT NULL);");
        // Migrate an older db (logs used to be seq+raw only) so filtering/ordering by
        // correlationId + timestamp works without wiping it.
        if (!HasColumn("logs", "correlationId"))
            Exec("ALTER TABLE logs ADD COLUMN correlationId TEXT;");
        if (!HasColumn("logs", "ts"))
            Exec("ALTER TABLE logs ADD COLUMN ts TEXT;");
        // Composite index: every log listing is ORDER BY correlationId, ts — serve it from the index.
        Exec("CREATE INDEX IF NOT EXISTS ix_logs_corr_ts ON logs(correlationId, ts);");
    }

    /// <summary>True iff <paramref name="table"/> already has a column named <paramref name="column"/>.</summary>
    private bool HasColumn(string table, string column)
    {
        using SqliteCommand cmd = _conn.CreateCommand();
        cmd.CommandText = $"PRAGMA table_info({table});";
        using SqliteDataReader r = cmd.ExecuteReader();
        while (r.Read())
        {
            if (string.Equals(r.GetString(1), column, StringComparison.OrdinalIgnoreCase))
                return true; // column 1 of PRAGMA table_info is the column name
        }
        return false;
    }

    // ── ISpanStore ───────────────────────────────────────────────────────────
    public int TraceCount
    {
        get
        {
            lock (_gate)
                return (int)(long)(Scalar("SELECT COUNT(DISTINCT traceId) FROM spans;") ?? 0L);
        }
    }

    public int AddSpans(IReadOnlyList<SpanRecord> spans)
    {
        if (spans.Count == 0)
            return 0;

        lock (_gate)
        {
            using SqliteTransaction tx = _conn.BeginTransaction();
            using SqliteCommand cmd = _conn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText =
                """
                INSERT INTO spans(traceId, spanId, parentSpanId, name, service, kind, startTime, endTime, durationMs, status, attributes)
                VALUES ($t,$s,$p,$n,$svc,$k,$st,$et,$d,$status,$a);
                """;
            SqliteParameter t = cmd.CreateParameter(); t.ParameterName = "$t"; cmd.Parameters.Add(t);
            SqliteParameter s = cmd.CreateParameter(); s.ParameterName = "$s"; cmd.Parameters.Add(s);
            SqliteParameter p = cmd.CreateParameter(); p.ParameterName = "$p"; cmd.Parameters.Add(p);
            SqliteParameter n = cmd.CreateParameter(); n.ParameterName = "$n"; cmd.Parameters.Add(n);
            SqliteParameter svc = cmd.CreateParameter(); svc.ParameterName = "$svc"; cmd.Parameters.Add(svc);
            SqliteParameter k = cmd.CreateParameter(); k.ParameterName = "$k"; cmd.Parameters.Add(k);
            SqliteParameter st = cmd.CreateParameter(); st.ParameterName = "$st"; cmd.Parameters.Add(st);
            SqliteParameter et = cmd.CreateParameter(); et.ParameterName = "$et"; cmd.Parameters.Add(et);
            SqliteParameter d = cmd.CreateParameter(); d.ParameterName = "$d"; cmd.Parameters.Add(d);
            SqliteParameter status = cmd.CreateParameter(); status.ParameterName = "$status"; cmd.Parameters.Add(status);
            SqliteParameter a = cmd.CreateParameter(); a.ParameterName = "$a"; cmd.Parameters.Add(a);

            foreach (SpanRecord span in spans)
            {
                t.Value = span.TraceId;
                s.Value = span.SpanId;
                p.Value = (object?)span.ParentSpanId ?? DBNull.Value;
                n.Value = span.Name;
                svc.Value = span.Service;
                k.Value = span.Kind;
                st.Value = span.StartTime;
                et.Value = span.EndTime;
                d.Value = span.DurationMs;
                status.Value = span.Status;
                a.Value = (object?)span.Attributes?.GetRawText() ?? DBNull.Value;
                cmd.ExecuteNonQuery();
            }

            tx.Commit();
        }
        return spans.Count;
    }

    public IReadOnlyList<SpanRecord>? GetTrace(string traceId)
    {
        lock (_gate)
        {
            using SqliteCommand cmd = _conn.CreateCommand();
            cmd.CommandText =
                "SELECT spanId, parentSpanId, name, service, kind, startTime, endTime, durationMs, status FROM spans WHERE traceId=$t ORDER BY seq;";
            SqliteParameter t = cmd.CreateParameter(); t.ParameterName = "$t"; t.Value = traceId; cmd.Parameters.Add(t);

            List<SpanRecord> rows = new();
            using SqliteDataReader r = cmd.ExecuteReader();
            while (r.Read())
            {
                rows.Add(new SpanRecord(
                    traceId,
                    r.GetString(0),
                    r.IsDBNull(1) ? null : r.GetString(1),
                    r.GetString(2),
                    r.GetString(3),
                    r.GetString(4),
                    r.GetString(5),
                    r.GetString(6),
                    r.GetDouble(7),
                    r.GetString(8),
                    null)); // attributes not needed for assembly/waterfall
            }
            return rows.Count == 0 ? null : rows;
        }
    }

    public IReadOnlyList<string> RecentTraceIds(int limit)
    {
        if (limit <= 0)
            return [];
        lock (_gate)
        {
            using SqliteCommand cmd = _conn.CreateCommand();
            cmd.CommandText = "SELECT traceId FROM spans GROUP BY traceId ORDER BY MAX(seq) DESC LIMIT $l;";
            SqliteParameter l = cmd.CreateParameter(); l.ParameterName = "$l"; l.Value = limit; cmd.Parameters.Add(l);
            List<string> ids = new();
            using SqliteDataReader r = cmd.ExecuteReader();
            while (r.Read())
                ids.Add(r.GetString(0));
            return ids;
        }
    }

    // ── logs (persisted so the dashboard repopulates after a restart) ─────────
    // The raw entry is stored verbatim (masking is the source's job); correlationId + ts are
    // pulled out only to INDEX and ORDER — the collector's whole query job is "give me a flow".
    public void AddLog(string? correlationId, string? ts, string rawJson)
    {
        lock (_gate)
        {
            using SqliteCommand cmd = _conn.CreateCommand();
            cmd.CommandText = "INSERT INTO logs(correlationId, ts, raw) VALUES($c,$t,$r);";
            SqliteParameter c = cmd.CreateParameter(); c.ParameterName = "$c"; c.Value = (object?)correlationId ?? DBNull.Value; cmd.Parameters.Add(c);
            SqliteParameter t = cmd.CreateParameter(); t.ParameterName = "$t"; t.Value = (object?)ts ?? DBNull.Value; cmd.Parameters.Add(t);
            SqliteParameter r = cmd.CreateParameter(); r.ParameterName = "$r"; r.Value = rawJson; cmd.Parameters.Add(r);
            cmd.ExecuteNonQuery();
        }
    }

    /// <summary>The most recent log entries, oldest-first (for SSE replay on connect).</summary>
    public IReadOnlyList<string> RecentLogs(int limit)
    {
        if (limit <= 0)
            return [];
        lock (_gate)
        {
            using SqliteCommand cmd = _conn.CreateCommand();
            cmd.CommandText = "SELECT raw FROM logs ORDER BY seq DESC LIMIT $l;";
            SqliteParameter l = cmd.CreateParameter(); l.ParameterName = "$l"; l.Value = limit; cmd.Parameters.Add(l);
            List<string> rows = new();
            using SqliteDataReader r = cmd.ExecuteReader();
            while (r.Read())
                rows.Add(r.GetString(0));
            rows.Reverse(); // oldest first
            return rows;
        }
    }

    /// <summary>One flow's logs — everything under a <paramref name="correlationId"/>, ordered by
    /// timestamp (seq breaks ties for same-ms events). The core "review by correlationId" query.</summary>
    public IReadOnlyList<string> LogsByCorrelation(string correlationId, int limit)
    {
        if (limit <= 0)
            return [];
        lock (_gate)
        {
            using SqliteCommand cmd = _conn.CreateCommand();
            cmd.CommandText = "SELECT raw FROM logs WHERE correlationId=$c ORDER BY ts, seq LIMIT $l;";
            SqliteParameter c = cmd.CreateParameter(); c.ParameterName = "$c"; c.Value = correlationId; cmd.Parameters.Add(c);
            SqliteParameter l = cmd.CreateParameter(); l.ParameterName = "$l"; l.Value = limit; cmd.Parameters.Add(l);
            List<string> rows = new();
            using SqliteDataReader r = cmd.ExecuteReader();
            while (r.Read())
                rows.Add(r.GetString(0));
            return rows;
        }
    }

    /// <summary>Recent logs across all flows, grouped by correlationId then chronological — the
    /// most-recent <paramref name="limit"/> entries, re-ordered by (correlationId, ts).</summary>
    public IReadOnlyList<string> RecentLogsByFlow(int limit)
    {
        if (limit <= 0)
            return [];
        lock (_gate)
        {
            using SqliteCommand cmd = _conn.CreateCommand();
            cmd.CommandText =
                "SELECT raw FROM (SELECT seq, correlationId, ts, raw FROM logs ORDER BY seq DESC LIMIT $l) ORDER BY correlationId, ts, seq;";
            SqliteParameter l = cmd.CreateParameter(); l.ParameterName = "$l"; l.Value = limit; cmd.Parameters.Add(l);
            List<string> rows = new();
            using SqliteDataReader r = cmd.ExecuteReader();
            while (r.Read())
                rows.Add(r.GetString(0));
            return rows;
        }
    }

    // ── internals ────────────────────────────────────────────────────────────
    private void Exec(string sql)
    {
        using SqliteCommand cmd = _conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
    }

    private object? Scalar(string sql)
    {
        using SqliteCommand cmd = _conn.CreateCommand();
        cmd.CommandText = sql;
        return cmd.ExecuteScalar();
    }

    public void Dispose() => _conn.Dispose();
}
