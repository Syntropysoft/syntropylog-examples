#!/usr/bin/env bash
# One command to bring up the whole polyglot demo: infra + the 5-service mesh + dashboard.
#
#   ./scripts/up.sh        (or: npm run up)
#
# Ctrl-C stops the services; the infra keeps running for a fast restart.
# Run ./scripts/down.sh (npm run down) to wipe everything.
#
#   ./scripts/up.sh --aot   (npm run up:aot)  runs the collector as a REAL native AOT binary
#                                             instead of JIT (`dotnet run`).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "▶ bringing up infra (Kafka + Redis + Kafka UI)…"
docker compose up -d

echo "▶ waiting for Kafka + Redis to be healthy…"
for _ in $(seq 1 40); do
  kh=$(docker inspect --format '{{.State.Health.Status}}' dist-kafka 2>/dev/null || echo starting)
  rh=$(docker inspect --format '{{.State.Health.Status}}' dist-redis 2>/dev/null || echo starting)
  if [ "$kh" = healthy ] && [ "$rh" = healthy ]; then echo "  infra ready"; break; fi
  sleep 3
done

# Collector mode: JIT by default (fast startup); `--aot` publishes + runs the real native binary.
MESH="dev:polyglot"
if [ "${1:-}" = "--aot" ]; then
  MESH="dev:polyglot:aot"
  echo "▶ collector mode: native AOT binary (real publish; first build ~30-60s, then reused)"
fi

echo "▶ starting the polyglot mesh (JS + Python) — dashboard: http://localhost:5173"
echo "  (Ctrl-C stops the services; infra stays up. Wipe with ./scripts/down.sh)"
exec npm run "$MESH"
