#!/usr/bin/env bash
# Smoke-test the collector's log-review contract WITHOUT the mesh: POST a batch of logs whose
# timestamps arrive OUT OF ORDER (and a second flow mixed in), then assert that
#   GET /logs/{correlationId}   returns exactly that flow's logs, ordered by timestamp
#   GET /logs                   lists them 200 OK, grouped by flow
# This pins the ORDER BY (ts, seq) + per-correlation filtering the SQLite store promises.
#
#   ./scripts/smoke-logs.sh                 # against COLLECTOR_URL (default localhost:9317)
#   COLLECTOR_URL=http://127.0.0.1:9317 ./scripts/smoke-logs.sh
set -uo pipefail
COLLECTOR_URL="${COLLECTOR_URL:-http://localhost:9317}"

CID="$(python3 -c 'import secrets;print("smoke_"+secrets.token_hex(12))')"
OTHER="$(python3 -c 'import secrets;print("smoke_"+secrets.token_hex(12))')"
echo "▶ collector: $COLLECTOR_URL"
echo "▶ flow under test: $CID"

# Batch: same flow, timestamps deliberately shuffled (03, 01, 02) + one line from another flow.
BATCH=$(CID="$CID" OTHER="$OTHER" python3 - <<'PY'
import json, os
cid, other = os.environ["CID"], os.environ["OTHER"]
base = "2026-07-10T12:00:0"
rows = [
    {"correlationId": cid,   "timestamp": base+"3.000Z", "service": "payments",     "level": "info", "message": "third"},
    {"correlationId": cid,   "timestamp": base+"1.000Z", "service": "gateway",      "level": "info", "message": "first"},
    {"correlationId": cid,   "timestamp": base+"2.000Z", "service": "orders",       "level": "info", "message": "second"},
    {"correlationId": other, "timestamp": base+"1.500Z", "service": "notifications","level": "info", "message": "other-flow"},
]
print(json.dumps(rows))
PY
)

post_code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$COLLECTOR_URL/v1/logs" \
  -H 'content-type: application/json' -d "$BATCH")
if [ "$post_code" != "200" ]; then echo "FAIL: POST /v1/logs -> HTTP $post_code (collector up?)"; exit 1; fi

# Give the persist a beat (write is synchronous, but be forgiving).
for _ in 1 2 3 4 5; do
  got=$(curl -s "$COLLECTOR_URL/logs/$CID")
  [ "$(printf '%s' "$got" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))' 2>/dev/null || echo 0)" = "3" ] && break
  sleep 0.4
done

CID="$CID" python3 - "$got" <<'PY'
import sys, json, os
cid = os.environ["CID"]
try:
    rows = json.loads(sys.argv[1])
except Exception as e:
    print(f"✗ FAIL: /logs/{cid} did not return JSON: {e}"); sys.exit(1)

fails = []
msgs = [r.get("message") for r in rows]
if len(rows) != 3:                         fails.append(f"expected 3 logs, got {len(rows)}: {msgs}")
if any(r.get("correlationId") != cid for r in rows):
                                            fails.append("a returned log has the wrong correlationId (filter leaked)")
if msgs != ["first", "second", "third"]:   fails.append(f"not ordered by timestamp: {msgs}")
ts = [r.get("timestamp") for r in rows]
if ts != sorted(ts):                       fails.append(f"timestamps not ascending: {ts}")
if any(r.get("message") == "other-flow" for r in rows):
                                            fails.append("logs from another flow leaked in")

if fails:
    print("✗ FAIL:"); [print("   -", f) for f in fails]; sys.exit(1)
print(f"✓ /logs/{cid}: 3 logs, ordered first→second→third, no cross-flow leak")
PY
order_rc=$?

list_code=$(curl -s -o /dev/null -w '%{http_code}' "$COLLECTOR_URL/logs?limit=50")
if [ "$list_code" = "200" ]; then echo "✓ /logs?limit=50: 200 OK"; else echo "✗ FAIL: /logs → HTTP $list_code"; order_rc=1; fi

[ "${order_rc:-0}" = "0" ] && echo "✔ smoke-logs PASS" || { echo "✘ smoke-logs FAILED"; exit 1; }
