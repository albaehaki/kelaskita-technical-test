#!/usr/bin/env bash
# Jalankan / recreate service n8n dengan environment terbaru (profil automation).
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose --profile automation up -d n8n
docker compose ps n8n
