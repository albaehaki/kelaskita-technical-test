#!/usr/bin/env bash
# Smoke test end-to-end: katalog → checkout → bayar → idempotensi → admin.
# Pemakaian: BASE_URL=http://localhost:3015 ./scripts/smoke-test.sh
set -u

BASE_URL="${BASE_URL:-http://localhost:3015}"
PASS=0
FAIL=0

check() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $label ($actual)"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $label — harap $expected, dapat $actual"
    FAIL=$((FAIL + 1))
  fi
}

echo "▶ Smoke test $BASE_URL"

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/")
check "halaman utama" 200 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/courses")
check "API katalog" 200 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/wilayah/provinces")
check "API wilayah (eksternal)" 200 "$code"

COURSE_ID=$(curl -s "$BASE_URL/api/courses" | node -e "
let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{
  const data=JSON.parse(s);
  if(!data.data?.length){console.error('katalog kosong');process.exit(1)}
  process.stdout.write(data.data[0].id);
});")
echo "  • course id: $COURSE_ID"

CHECKOUT=$(curl -s -X POST "$BASE_URL/api/checkout" \
  -H 'Content-Type: application/json' \
  -d "{\"courseId\":\"$COURSE_ID\",\"studentName\":\"Smoke Test\",\"email\":\"smoke@example.com\",\"phone\":\"081200000000\",\"province\":\"JAWA BARAT\",\"city\":\"KOTA BEKASI\"}")

INVOICE=$(printf '%s' "$CHECKOUT" | node -e "
let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{
  const data=JSON.parse(s);
  if(!data.invoiceNo){console.error('checkout gagal:', s);process.exit(1)}
  process.stdout.write(data.invoiceNo);
});")
echo "  • invoice: $INVOICE"

PAY1=$(curl -s -X POST "$BASE_URL/api/payments/mock" -H 'Content-Type: application/json' -d "{\"invoiceNo\":\"$INVOICE\"}")
check "pembayaran pertama" '{"status":"paid"}' "$PAY1"

PAY2=$(curl -s -X POST "$BASE_URL/api/payments/mock" -H 'Content-Type: application/json' -d "{\"invoiceNo\":\"$INVOICE\"}")
check "retry pembayaran (idempotent)" '{"status":"duplicate"}' "$PAY2"

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/payments/webhook" \
  -H 'Content-Type: application/json' -d '{"eventId":"x","invoiceNo":"x","status":"PAID"}')
check "webhook tanpa token ditolak" 401 "$code"

LOGIN=$(curl -s -c /tmp/kk_smoke_cookie.txt -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@kelaskita.test","password":"Admin123!"}')
case "$LOGIN" in
  *'"ok":true'*) echo "  ✓ login admin"; PASS=$((PASS + 1));;
  *) echo "  ✗ login admin — $LOGIN"; FAIL=$((FAIL + 1));;
esac

code=$(curl -s -b /tmp/kk_smoke_cookie.txt -o /dev/null -w '%{http_code}' "$BASE_URL/admin")
check "dashboard dengan session" 200 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/admin")
check "dashboard tanpa session dialihkan" 307 "$code"

echo "──────────────────────────────"
echo "Lulus: $PASS · Gagal: $FAIL"
[ "$FAIL" -eq 0 ] || exit 1
