#!/usr/bin/env bash
# Build (once) and run the traceability collector as a REAL native AOT binary — the headline
# claim, actually executed. `npm run dev:collector` runs it JIT (`dotnet run`) for a fast
# inner loop; THIS path publishes the native single-file binary and execs it, so the ~200 ms
# cold start / no-warmup wins are what the demo actually shows.
#
#   npm run dev:collector:aot        # or: npm run up:aot  (whole mesh, AOT collector)
#
# The RID is detected from the host. The first publish takes ~30-60s (clang links the binary);
# subsequent starts reuse it and only re-publish when a .cs source is newer than the binary.
# If the AOT toolchain is missing, fall back to JIT with a clear message rather than dying.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJ="$ROOT/services/traceability"
OUT="$PROJ/bin/aot"
BIN="$OUT/Traceability"

# Detect the .NET runtime identifier from the host.
os="$(uname -s)"; arch="$(uname -m)"
case "$os-$arch" in
  Darwin-arm64)   RID=osx-arm64 ;;
  Darwin-x86_64)  RID=osx-x64 ;;
  Linux-x86_64)   RID=linux-x64 ;;
  Linux-aarch64)  RID=linux-arm64 ;;
  *)
    echo "⚠ AOT not supported on $os-$arch — falling back to JIT (dotnet run)."
    exec dotnet run --project "$PROJ" -c Release
    ;;
esac

# Rebuild only when the binary is missing or a source file changed (fast restarts).
needs_build=0
if [ ! -x "$BIN" ]; then
  needs_build=1
elif [ -n "$(find "$PROJ" -name '*.cs' -newer "$BIN" -not -path '*/bin/*' -not -path '*/obj/*' 2>/dev/null | head -1)" ]; then
  needs_build=1
fi

if [ "$needs_build" -eq 1 ]; then
  echo "▶ publishing the native AOT collector ($RID) — first build takes ~30-60s…"
  if ! dotnet publish "$PROJ" -c Release -r "$RID" -o "$OUT" --nologo; then
    echo "⚠ AOT publish failed (clang installed? see services/traceability/README.md) — falling back to JIT."
    exec dotnet run --project "$PROJ" -c Release
  fi
fi

echo "▶ starting the native AOT collector: $BIN"
exec "$BIN"
