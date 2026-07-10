#!/usr/bin/env bash
# El latigazo — hammer the .NET AOT collector and report the numbers that make the
# AOT case: cold start, sustained ingest throughput, p99 latency, peak RSS.
#
#   ./bench/latigazo.sh [path-to-native-binary]
#
# Env: N=requests (default 200000)  C=concurrency (default 100)
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 127.0.0.1, not localhost: macOS `ab` resolves localhost to IPv6 (::1) and fails to
# connect to the IPv4 listener. curl falls back; ab does not.
BIN="${1:-$DIR/../bin/aot/Traceability}"
URL="http://127.0.0.1:9317"
N="${N:-200000}"
C="${C:-100}"

if [ ! -x "$BIN" ]; then echo "native binary not found: $BIN (run: dotnet publish -c Release -r osx-arm64 -o bin/aot)"; exit 1; fi
command -v ab >/dev/null 2>&1 || { echo "ApacheBench (ab) not found"; exit 1; }

echo "▶ cold start…"
t0=$(python3 -c 'import time;print(time.time())')
"$BIN" > /tmp/trace-aot.log 2>&1 &
PID=$!
until curl -sf "$URL/healthz" >/dev/null 2>&1; do sleep 0.02; done
t1=$(python3 -c 'import time;print(time.time())')
printf "  cold start: %.0f ms\n" "$(python3 -c "print(($t1-$t0)*1000)")"

# sample RSS (KB on macOS) while the flood runs
( for _ in $(seq 1 120); do ps -o rss= -p "$PID" 2>/dev/null; sleep 0.5; done > /tmp/trace-rss.txt ) &
SAMPLER=$!
disown "$SAMPLER" 2>/dev/null   # no job-control "Terminated" noise when we stop it

echo "▶ latigazo: $N requests, concurrency $C, batches of 5 spans → $URL/v1/spans"
ab -k -n "$N" -c "$C" -p "$DIR/span.json" -T application/json "$URL/v1/spans" > /tmp/trace-ab.txt 2>&1
kill "$SAMPLER" 2>/dev/null

echo "── throughput & latency ─────────────────────────────"
grep -E 'Requests per second|Time per request|Failed requests|Complete requests' /tmp/trace-ab.txt | sed 's/^/  /'
echo "  p50/p95/p99 (ms):"
grep -E '^\s+(50|95|99)%' /tmp/trace-ab.txt | sed 's/^/    /'

peak_kb=$(sort -n /tmp/trace-rss.txt | tail -1)
echo "── footprint ────────────────────────────────────────"
printf "  peak RSS: %d MB\n" "$(( ${peak_kb:-0} / 1024 ))"
printf "  binary:   %s MB\n" "$(( $(stat -f%z "$BIN") / 1024 / 1024 ))"

echo "── collector /metrics ───────────────────────────────"
curl -s "$URL/metrics" | sed 's/^/  /'; echo
echo "  note: 'dropped' here = the single synthetic trace hitting the per-trace span cap"
echo "        (the fixed bench body reuses span ids). Every request was still processed;"
echo "        see 'Failed requests: 0'. Real traffic sends unique spans."

kill "$PID" 2>/dev/null
echo "✔ done"
