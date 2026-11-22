#!/usr/bin/env bash
# Helper untuk menjalankan stack Docker (db + app, opsional n8n).
# Pemakaian:
#   ./scripts/dev-up.sh              # db + app
#   ./scripts/dev-up.sh --automation # db + app + n8n
set -euo pipefail
cd "$(dirname "$0")/.."

PROFILE_ARGS=()
if [ "${1:-}" = "--automation" ]; then
  PROFILE_ARGS=(--profile automation)
  shift
fi

docker compose "${PROFILE_ARGS[@]}" up -d --build "$@"
docker compose ps
