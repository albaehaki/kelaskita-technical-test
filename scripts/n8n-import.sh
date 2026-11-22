#!/usr/bin/env bash
# Import & aktifkan workflow KelasKita ke instance n8n lokal (port 5679).
set -euo pipefail

N8N="${N8N_URL:-http://localhost:5679}"
COOKIE="${N8N_COOKIE:-/tmp/n8n_kk_cookie.txt}"
ROOT="$(cd "$(dirname "$0")/.." && pwd -W)"
mkdir -p "$ROOT/.tmp"
PAYLOAD="$ROOT/.tmp/wf_payload.json"

for file in "$ROOT"/n8n/workflows/*.json; do
  name=$(basename "$file")
  echo "▶ import $name"

  # Buang field yang tidak diterima endpoint create (active, pinData).
  python - "$file" > "$PAYLOAD" <<'PY'
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
payload = {key: data[key] for key in ("name", "nodes", "connections", "settings") if key in data}
print(json.dumps(payload))
PY

  created=$(curl -s -b "$COOKIE" -X POST "$N8N/rest/workflows" \
    -H "Content-Type: application/json" \
    --data-binary @"$PAYLOAD")

  wf_id=$(printf '%s' "$created" | python -c "import sys,json;d=json.load(sys.stdin);print(d.get('data',{}).get('id') or d.get('id') or '')")

  if [ -z "$wf_id" ]; then
    echo "  ✗ gagal membuat workflow: $created"
    continue
  fi
  echo "  • id: $wf_id"

  if [ "$name" = "01-order-notification.json" ]; then
    version=$(curl -s -b "$COOKIE" "$N8N/rest/workflows/$wf_id" | python -c "import sys,json;d=json.load(sys.stdin);print(d.get('data',{}).get('versionId',''))")
    echo "  • activate versionId=$version"
    curl -s -b "$COOKIE" -X POST "$N8N/rest/workflows/$wf_id/activate" \
      -H "Content-Type: application/json" \
      -d "{\"versionId\":\"$version\"}" | head -c 160; echo
  fi
done

echo "▶ daftar workflow:"
curl -s -b "$COOKIE" "$N8N/rest/workflows" | python -c "
import sys, json
data = json.load(sys.stdin).get('data', [])
for w in data:
    print(f\"  - {w['name']} | active={w.get('active')} | id={w['id']}\")
"
