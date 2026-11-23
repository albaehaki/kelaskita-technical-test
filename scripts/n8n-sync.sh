#!/usr/bin/env bash
# Sinkronkan workflow n8n yang sedang berjalan dengan file JSON di repo.
set -euo pipefail

N8N="${N8N_URL:-http://localhost:5679}"
COOKIE="${N8N_COOKIE:-/tmp/n8n_kk_cookie.txt}"
ROOT="$(cd "$(dirname "$0")/.." && pwd -W)"
mkdir -p "$ROOT/.tmp"

WF_ID=$(curl -s -b "$COOKIE" "$N8N/rest/workflows" | python -c "
import sys, json
items = json.load(sys.stdin).get('data', [])
for item in items:
    if 'Order Notification' in item['name']:
        print(item['id']); break
")

if [ -z "${WF_ID:-}" ]; then
  echo "workflow tidak ditemukan"
  exit 1
fi

python - "$ROOT/n8n/workflows/01-order-notification.json" "$WF_ID" > "$ROOT/.tmp/wf_patch.json" <<'PY'
import json, sys
source, wf_id = sys.argv[1], sys.argv[2]
data = json.load(open(source, encoding="utf-8"))
payload = {
    "id": wf_id,
    "name": data["name"],
    "nodes": data["nodes"],
    "connections": data["connections"],
    "settings": data.get("settings", {"executionOrder": "v1"}),
}
print(json.dumps(payload))
PY

VERSION=$(curl -s -b "$COOKIE" "$N8N/rest/workflows/$WF_ID" | python -c "import sys,json;print(json.load(sys.stdin)['data']['versionId'])")
echo "workflow $WF_ID versi $VERSION"

python - "$ROOT/.tmp/wf_patch.json" "$VERSION" > "$ROOT/.tmp/wf_patch2.json" <<'PY'
import json, sys
p = json.load(open(sys.argv[1], encoding="utf-8"))
p["versionId"] = sys.argv[2]
print(json.dumps(p))
PY

curl -s -b "$COOKIE" -X PATCH "$N8N/rest/workflows/$WF_ID" \
  -H "Content-Type: application/json" \
  --data-binary @"$ROOT/.tmp/wf_patch2.json" | head -c 200; echo
