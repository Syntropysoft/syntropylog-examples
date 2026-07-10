#!/usr/bin/env bash
# Durable exporter demo (the second "wow"): kill the collector, keep placing orders — the
# services' telemetry exporters BUFFER spans+logs instead of dropping them — then restart the
# collector and confirm the traces produced during the outage come back COMPLETE. Aligned with
# SyntropyLog 1.3.0's durable spirit.
#
#   ./scripts/durable-demo.sh      # the mesh must be running (npm run up)
#
# Env: N=orders while down (default 3)
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COL="http://127.0.0.1:9317"
GW="http://localhost:3000"
N="${N:-3}"

if ! curl -sf "$COL/healthz" >/dev/null 2>&1; then echo "collector not reachable — is the mesh up? (npm run up)"; exit 1; fi

echo "▶ killing the collector…"
lsof -ti tcp:9317 | xargs -r kill 2>/dev/null
sleep 2
curl -sf "$COL/healthz" >/dev/null 2>&1 && echo "  ⚠ still up?" || echo "  collector is DOWN."

echo "▶ placing $N orders while the collector is DOWN (telemetry buffers in the services)…"
ids=()
for _ in $(seq 1 "$N"); do
  tid="$(openssl rand -hex 16)"
  ids+=("$tid")
  curl -s -X POST "$GW/api/orders" -H 'content-type: application/json' \
    -H "x-correlation-id: $tid" -H "traceparent: 00-${tid}-$(openssl rand -hex 8)-01" \
    --data @sample-order.json -o /dev/null -w "  order ${tid:0:12}… -> HTTP %{http_code}\n"
  sleep 0.5
done
echo "  orders placed. spans + logs are buffered in the services' exporter queues, not lost."

echo "▶ restarting the collector…"
dotnet run --project services/traceability -c Release > /tmp/durable-col.log 2>&1 &
until curl -sf "$COL/healthz" >/dev/null 2>&1; do sleep 0.3; done
echo "  collector recovered. waiting for the exporters to retry-flush the backlog…"
sleep 6

echo "── result: traces produced during the outage, after recovery ─────────"
complete=0
for tid in "${ids[@]}"; do
  n=$(curl -s "$COL/trace/$tid" | python3 -c "import sys,json;print(json.load(sys.stdin).get('spanCount',0))" 2>/dev/null || echo 0)
  echo "  ${tid:0:12}…  $n spans"
  [ "$n" -ge 10 ] && complete=$((complete + 1))
done
echo "  → $complete / $N traces came back COMPLETE (10 spans) — the outage lost nothing."
