#!/bin/sh
set -e

echo "▶ menunggu database..."
ATTEMPT=0
until node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$queryRaw\`SELECT 1\`.then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ "$ATTEMPT" -ge 30 ]; then
    echo "✗ database tidak siap setelah 30 percobaan"
    exit 1
  fi
  sleep 2
done

echo "▶ menjalankan migrasi..."
pnpm prisma migrate deploy

echo "▶ seed (idempotent)..."
pnpm db:seed || echo "⚠ seed dilewati (data mungkin sudah ada)"

echo "▶ start aplikasi..."
exec "$@"
