#!/usr/bin/env bash
# Create a venv, install deps + slpy (editable from the sibling repo), and run the
# Python inventory service on the same host topology as the TypeScript services.
#
#   ./run.sh
#
# Env overrides (same defaults as the TS services):
#   KAFKA_BROKERS=localhost:9092  REDIS_URL=redis://localhost:6379  INVENTORY_PORT=3003
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# services/inventory-py → ../../../../syntropylog.py  (repo root: _syntrosoft/syntropylog.py)
SLPY_REPO="$(cd "$SCRIPT_DIR/../../../../syntropylog.py" && pwd)"

PY="${PYTHON:-python3}"

if [ ! -d .venv ]; then
  echo "[inventory-py] creating venv…"
  "$PY" -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

echo "[inventory-py] installing deps…"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Install slpy: editable from the sibling repo if present, else the published package.
if [ -d "$SLPY_REPO/slpy" ]; then
  echo "[inventory-py] installing slpy (editable) from $SLPY_REPO"
  pip install --quiet -e "$SLPY_REPO"
else
  echo "[inventory-py] installing slpy-log from PyPI"
  pip install --quiet slpy-log
fi

echo "[inventory-py] starting on :${INVENTORY_PORT:-3003} (consuming order.created)…"
exec uvicorn main:app --host 0.0.0.0 --port "${INVENTORY_PORT:-3003}" --log-level warning
