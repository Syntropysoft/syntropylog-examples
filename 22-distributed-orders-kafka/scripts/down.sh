#!/usr/bin/env bash
# Tear the demo down fast: stop the host services, then wipe infra + volumes.
#
#   ./scripts/down.sh      (or: npm run down)
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "▶ stopping host services (ports 3000-3003, 5173, collector 9317)…"
for p in 3000 3001 3002 3003 5173 9317; do
  pids=$(lsof -ti tcp:"$p" 2>/dev/null || true)
  if [ -n "$pids" ]; then kill $pids 2>/dev/null || true; fi
done
# the .NET collector runs via `dotnet run` — stop the build host too
pkill -f 'services/traceability' 2>/dev/null || true

echo "▶ wiping infra (containers + volumes)…"
docker compose down -v

echo "✔ down. (Python venv kept at services/inventory-py/.venv for a fast next start.)"
