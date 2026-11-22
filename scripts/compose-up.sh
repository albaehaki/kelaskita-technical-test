#!/usr/bin/env bash
# Menjalankan service compose tanpa rebuild.
# Pemakaian: ./scripts/compose-up.sh app | ./scripts/compose-up.sh db app | ./scripts/compose-up.sh --profile automation n8n
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d "$@"
docker compose ps
