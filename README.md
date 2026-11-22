# KelasKita — Website Kelas IT + CMS

Technical test: **website publik + CMS admin** untuk platform kelas IT, dengan integrasi
**API eksternal**, **payment gateway**, dan **automation n8n**.

Frontend: **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**
Backend: **Route Handlers Next.js + Prisma ORM + PostgreSQL** (bukan Firebase)

---

## 1. Fitur

### Website publik
- Landing page: hero, statistik, katalog kelas, artikel, alur pendaftaran.
- Katalog & detail kelas: silabus, level, durasi, harga, jumlah peserta.
- Form pendaftaran: validasi, **dropdown provinsi & kota dari API Wilayah Indonesia**.
- Checkout membuat invoice + transaksi pembayaran (status `PENDING`).
- Halaman pembayaran (mock gateway) dan halaman invoice untuk cek status.
- Halaman artikel (list & detail) yang isinya dikelola dari CMS.
- **Area peserta (LMS)**: masuk dengan email + nomor invoice yang sudah lunas, lalu membuka
  materi per modul (`/kelas-saya`). Akses dibatasi di server: hanya invoice `PAID` milik email
  tersebut yang bisa membuka materi.

### CMS admin (`/admin`)
- Login dengan session JWT httpOnly (password di-hash bcrypt).
- Dashboard: total kelas, pendaftaran lunas, invoice menunggu, pendapatan, transaksi terbaru,
  dan **feed notifikasi automation** (dari app maupun dari n8n).
- Kelola kelas: tambah, edit, tayangkan/sembunyikan, hapus (kelas bertransaksi hanya
  disembunyikan agar riwayat tetap utuh).
- Kelola pendaftaran: lihat semua transaksi, ubah status pembayaran untuk koreksi manual.
- Kelola artikel: tulis, terbitkan, hapus.
- Semua aksi admin dijaga di server (`requireAdmin()`), bukan hanya menyembunyikan tombol di UI.

### Integrasi
| Integrasi | Implementasi |
|---|---|
| **API eksternal** | [API Wilayah Indonesia](https://www.emsifa.com/api-wilayah-indonesia/) — provinsi & kota/kabupaten. Di-fetch di server, cache 24 jam, punya fallback statis bila API down. |
| **Payment gateway** | Strategy pattern `PaymentProvider`: `MockPaymentProvider` (default), `MidtransPaymentProvider` (Snap sandbox), dan `XenditPaymentProvider` (Invoice API). Aktif via `PAYMENT_PROVIDER`. |
| **Automation n8n** | 2 workflow siap import: notifikasi order real-time + rekap harian 07:00. Lihat [`n8n/`](./n8n). |

---

## 2. Arsitektur

```
┌──────────────────────────── Browser ────────────────────────────┐
│  Website publik (RSC)          CMS admin (RSC + server action)  │
└───────────────┬──────────────────────────────┬──────────────────┘
                │                              │
┌───────────────▼──────────────────────────────▼──────────────────┐
│                     Next.js 16 App Router                       │
│                                                                 │
│  app/(public)          app/admin            app/api/*           │
│  ├─ page.tsx           ├─ layout (guard)    ├─ /checkout        │
│  ├─ kelas/[slug]       ├─ page (dashboard)  ├─ /payments/mock   │
│  ├─ checkout/[slug]    ├─ kelas (CRUD)      ├─ /payments/webhook│
│  ├─ bayar/[invoice]    ├─ peserta           ├─ /wilayah/*       │
│  ├─ invoice/[invoice]  ├─ artikel           ├─ /internal/*      │
│  └─ artikel/*          └─ actions.ts        └─ /courses         │
│                                                                 │
│  lib/  ── db · auth · payment (strategy) · wilayah · n8n        │
│  lib/enrollment-service.ts  ← satu pintu transisi status PAID   │
└───────────────┬─────────────────────────────┬───────────────────┘
                │ Prisma                      │ HTTP (webhook)
┌───────────────▼──────────────┐   ┌──────────▼───────────────────┐
│  PostgreSQL                  │   │  n8n                          │
│  users · courses · categories│   │  01 order notification        │
│  enrollments · payments      │   │  02 daily report (cron)       │
│  articles · notifications    │   └──────────┬───────────────────┘
│  webhook_events (idempotency)│              │ callback
└──────────────────────────────┘◄─────────────┘
```

**Pembagian modul**

| Lapisan | Isi | Tanggung jawab |
|---|---|---|
| Presentation | `src/app/(public)`, `src/app/admin`, `src/components` | Render & form; tidak memuat aturan bisnis |
| API / Route Handler | `src/app/api/**` | Kontrak HTTP, validasi payload (zod), status code |
| Service | `src/lib/enrollment-service.ts` | Transaksi DB, idempotensi, efek samping automation |
| Integration | `src/lib/payment.ts`, `src/lib/wilayah.ts`, `src/lib/n8n.ts` | Adaptor ke sistem luar; mudah diganti tanpa menyentuh UI |
| Data | `prisma/schema.prisma` | Skema relasional & constraint |
| Automation | `n8n/workflows/*.json` | Orkestrasi notifikasi & rekap di luar aplikasi |

---

## 3. Cara menjalankan (lokal)

Prasyarat: **Node.js 22+**, **pnpm 9/10**, **PostgreSQL 16** (atau Docker).

```bash
# 1. Install dependency
pnpm install
pnpm prisma generate      # generate Prisma Client (juga jalan otomatis via postinstall)

# 2. Salin environment
cp .env.example .env

# 3. Jalankan database (pilih salah satu)
docker compose up -d db          # Postgres di localhost:5435
# atau pakai Postgres yang sudah ada → sesuaikan DATABASE_URL

# 4. Migrasi + seed (seed idempotent, aman diulang)
pnpm prisma migrate deploy
pnpm db:seed

# 5. Jalankan
pnpm dev                          # http://localhost:3015
```

Build produksi:

```bash
pnpm build && pnpm start
```

Verifikasi cepat end-to-end (butuh aplikasi sedang berjalan):

```bash
pnpm smoke        # BASE_URL=http://localhost:3015 ./scripts/smoke-test.sh
```

### Menjalankan penuh dengan Docker

```bash
cp .env.example .env
docker compose up -d --build      # db + app (migrasi & seed otomatis saat start)
# opsional, termasuk n8n:
docker compose --profile automation up -d
```

- Website: <http://localhost:3015>
- CMS: <http://localhost:3015/admin>
- n8n (profil automation): <http://localhost:5679>

### Kredensial demo

| Peran | Email | Password |
|---|---|---|
| Admin CMS | `admin@kelaskita.test` | `Admin123!` |

---

## 4. Environment

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Koneksi PostgreSQL |
| `SESSION_SECRET` | ✅ | — | Kunci tanda tangan JWT session admin |
| `COOKIE_SECURE` | — | otomatis | `true`/`false` untuk memaksa flag Secure; kosong = deteksi dari `x-forwarded-proto` |
| `APP_URL` | — | `http://localhost:3015` | Base URL aplikasi |
| `PAYMENT_PROVIDER` | — | `mock` | `mock`, `midtrans`, atau `xendit` |
| `PAYMENT_CALLBACK_TOKEN` | ✅ | — | Shared token untuk `POST /api/payments/webhook` |
| `MIDTRANS_SERVER_KEY` | — | kosong | Server key Snap sandbox (jika `PAYMENT_PROVIDER=midtrans`) |
| `MIDTRANS_IS_PRODUCTION` | — | `false` | `true` untuk production Midtrans |
| `XENDIT_SECRET_KEY` | — | kosong | Secret key Xendit (sandbox diawali `xnd_development_`) |
| `N8N_WEBHOOK_URL` | — | kosong | Webhook n8n untuk event order; kosong = event hanya dicatat lokal |
| `INTERNAL_SECRET` | ✅ | — | Shared secret endpoint internal (dipanggil n8n) |

> `.env` **tidak** ikut di-commit. Yang di-commit hanya `.env.example`.

---

## 5. API

### Publik
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/courses` | Katalog kelas yang tayang |
| `GET` | `/api/wilayah/provinces` | Proxy API wilayah (cache 24 jam) |
| `GET` | `/api/wilayah/cities?provinceId=32` | Kota/kabupaten per provinsi |
| `POST` | `/api/checkout` | Buat pendaftaran + payment. Body: `courseId, studentName, email, phone, province, city, note?` |
| `POST` | `/api/payments/mock` | Simulasi pembayaran berhasil (mock gateway) |
| `POST` | `/api/student/login` | Login peserta: `email` + `invoiceNo` yang sudah `PAID` |

### Callback payment gateway
```bash
curl -X POST http://localhost:3015/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-callback-token: callback-token-demo" \
  -d '{"eventId":"evt-001","invoiceNo":"KK-20261122-XXXXX","status":"PAID","provider":"midtrans"}'
```
- Status: `PAID` | `FAILED` | `EXPIRED`
- **Idempotent**: `eventId` unik di tabel `webhook_events`; retry tidak menggandakan data/notifikasi.

### Internal (dipanggil n8n, wajib header `x-internal-secret`)
| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/internal/daily-report` | Ringkasan: lunas hari ini, pending, total pendapatan, kelas terlaris |
| `POST` | `/api/internal/notifications` | Menyimpan notifikasi hasil automation ke CMS |

### Admin (session cookie)
`POST /api/auth/login`, `POST /api/auth/logout`. CRUD admin memakai **server actions** yang
memanggil `requireAdmin()` di server — bukan endpoint publik.

---

## 6. Alur pembayaran & idempotensi

```
POST /api/checkout
  ├─ validasi zod
  ├─ Enrollment (PENDING) + Payment (PENDING)
  ├─ provider.createPayment()  → mock: /bayar/{invoice}
  │                              midtrans: redirect_url Snap
  └─ emit event "order.created" ke n8n

POST /api/payments/mock  atau  POST /api/payments/webhook
  └─ markEnrollmentPaid()
       ├─ cek webhook_events.eventId  → sudah ada? berhenti (duplicate)
       ├─ transaksi: Enrollment=PAID, Payment=PAID, Notification
       ├─ unique constraint = pengaman balapan request
       └─ emit event "order.paid" ke n8n (di luar transaksi)
```

Keputusan penting: **efek samping automation berada di luar transaksi database**.
Kalau n8n mati, pembayaran tetap tercatat lunas — automation tidak boleh menggagalkan
transaksi pengguna.

---

## 7. n8n

Dua workflow siap import ada di `n8n/workflows/`:

| File | Trigger | Aksi |
|---|---|---|
| `01-order-notification.json` | Webhook `POST /webhook/kelaskita-order` | Format pesan → callback `POST /api/internal/notifications` → tampil di dashboard CMS |
| `02-daily-report.json` | Cron `0 7 * * *` | `GET /api/internal/daily-report` → susun ringkasan → kirim ke CMS |

**Cara pakai**
1. Jalankan n8n (Docker: `docker compose --profile automation up -d`, atau instance sendiri).
2. Import kedua file JSON → **Activate** workflow 01.
3. Samakan secret: `x-internal-secret` di node HTTP dengan `INTERNAL_SECRET` di `.env`.
4. Untuk container, alamat app memakai `host.docker.internal:3015`
   (di Linux: ganti dengan IP host atau nama service `app:3015`).
5. Set `N8N_WEBHOOK_URL=http://localhost:5678/webhook/kelaskita-order`.
6. Lakukan pendaftaran baru → notifikasi muncul di dashboard CMS.

Node HTTP di workflow bisa diganti/ditambah ke **Telegram / WhatsApp / Google Sheets**
tanpa mengubah aplikasi — aplikasi hanya mengenal satu kontrak event.

📘 Alur lengkap (siapa memanggil siapa, port, akun, checklist troubleshooting):
[`docs/ALUR-AUTOMATION.md`](./docs/ALUR-AUTOMATION.md)

---

## 8. Struktur folder

```
prisma/
  schema.prisma          # 8 model + 4 enum
  seed.ts                # seed idempotent (admin, 3 kategori, 6 kelas, 3 artikel, 1 transaksi)
src/
  app/
    page.tsx             # landing
    kelas/[slug]/        # detail kelas
    checkout/[slug]/     # form pendaftaran
    bayar/[invoice]/     # mock payment page
    invoice/[invoice]/   # status invoice
    artikel/             # blog publik
    kelas-saya/          # area peserta (LMS): daftar kelas + materi per modul
    admin/               # CMS (layout guard, dashboard, CRUD, server actions)
    api/                 # route handlers
  components/            # header, footer, course card, form, pay button, login
  lib/                   # db, auth, payment, wilayah, n8n, service, format
n8n/workflows/           # automation JSON
Dockerfile · docker-compose.yml · docker-entrypoint.sh
```

---

## 9. Keputusan arsitektur & alasan

1. **Next.js full-stack, bukan frontend + backend terpisah.**
   Untuk skala technical test, satu deployment mengurangi titik gagal (CORS, dua build, dua
   environment). Batas modul tetap dijaga lewat folder `api/`, `lib/`, dan `app/` — bukan
   dengan memecah repo.

2. **Prisma + PostgreSQL, bukan Firebase.**
   Relasi transaksi (enrollment → payment) butuh constraint & transaksi ACID. Unique index
   `webhook_events.eventId` adalah pengaman idempotensi yang tidak bisa dijamin oleh store
   dokumen tanpa transaksi.

3. **Strategy pattern untuk payment.**
   Route checkout tidak tahu provider mana yang aktif. Menambah Xendit/Tripay = menambah satu
   class `PaymentProvider`, tanpa menyentuh route atau UI. Ini juga alasan mock gateway bisa
   dipakai tanpa akun.

4. **Satu service untuk transisi status PAID.**
   `markEnrollmentPaid()` dipakai mock gateway & webhook sungguhan. Semua efek samping
   (payment, notifikasi, automation) konsisten dan idempotent di satu tempat.

5. **Server actions untuk CMS, route handler untuk API publik.**
   CMS adalah konsumen internal: server action menghilangkan kebutuhan fetch + state
   loading, dan otomatis membawa cookie session. API publik tetap REST supaya bisa dites
   dengan curl dan dipakai klien lain.

6. **API wilayah di-proxy di server + fallback.**
   API key tidak ada, tapi memanggil langsung dari browser menambah titik gagal (CORS/rate
   limit). Proxy + cache 24 jam membuat form cepat dan tetap bisa dipakai saat API down.

7. **Mock gateway punya halaman sendiri, bukan alert().**
   Alur pembayaran tetap realistis (invoice → halaman bayar → status), sehingga reviewer bisa
   menilai seluruh lifecycle tanpa akun Midtrans.

---

## 10. Keamanan

- Password di-hash **bcrypt** (cost 10); pesan login generik agar tidak membocorkan email terdaftar.
- Session **JWT httpOnly + SameSite=Lax**, umur 8 jam; `secure` aktif di production.
- Setiap halaman & server action admin memanggil `requireAdmin()` di server.
- Callback payment diverifikasi dengan shared token; endpoint internal memakai `x-internal-secret`.
- Validasi input dengan **zod** di route handler & server action.
- Query memakai Prisma (parameterized) — tidak ada string SQL mentah.
- `.env` di-ignore; `.env.example` hanya placeholder.

---

## 11. Keterbatasan & langkah berikutnya

- Materi LMS berasal dari silabus saat seed; editor materi di CMS belum dibuat.
- Belum ada progress tracking, kuis, atau sertifikat otomatis.
- Mock gateway tidak memverifikasi tanda tangan kriptografis (Midtrans asli memakai
  `signature_key`); adaptor Midtrans tinggal ditambah verifikasi tersebut.
- Belum ada rate limiting pada endpoint checkout/login.
- Belum ada upload gambar cover kelas (sekarang memakai emoji).
- Test otomatis belum ditambahkan; verifikasi dilakukan end-to-end via curl (lihat riwayat).

---

## 12. AI disclosure
Sesuai praktik yang jujur: sebagian kode dibantu AI (Hermes Agent), dengan keputusan
arsitektur, skema data, dan verifikasi dilakukan manual.

- **Bagian dibantu AI**: penulisan komponen UI berulang, boilerplate route handler,
  dan draft README.
- **Bagian yang diputuskan & diverifikasi manual**: pemilihan stack, desain skema relasional,
  strategi idempotensi pembayaran, pembatasan modul, serta pengujian end-to-end
  (checkout → bayar → webhook → admin) memakai curl dan build produksi.
- **Contoh hasil AI yang ditolak/diubah**: draft awal memakai satu endpoint `/api/admin/*`
  untuk CRUD; diganti menjadi server actions karena menambah lapisan HTTP tanpa manfaat
  untuk konsumen internal, sekaligus memperkecil permukaan API yang perlu diamankan.

---

## 13. Hasil verifikasi

Dijalankan pada mesin pengembangan (Windows 11, Node 22.23, Docker Desktop, PostgreSQL 16):

| Uji | Hasil |
|---|---|
| `pnpm build` | ✅ sukses, 24 route |
| `pnpm smoke` pada stack Docker (app + db) | ✅ **9/9 lulus** |
| Fresh clone → install → migrate → seed → build → start | ✅ **9/9 lulus** (port 3020) |
| Mock payment lalu retry | ✅ `paid` → `duplicate` (idempotent) |
| Webhook dengan token salah | ✅ `401` |
| Akses `/admin` tanpa session | ✅ `307` ke login |
| n8n `order.created` | ✅ eksekusi *success*, notifikasi `source=n8n` masuk dashboard |
| n8n `order.paid` | ✅ notifikasi "Pembayaran lunas" dari n8n |
| Seed dijalankan ulang | ✅ idempotent, data tidak bertambah |
| LMS: login email + invoice lunas | ✅ `{"ok":true}` → `/kelas-saya` 200, 6 modul terbaca |
| LMS: invoice palsu | ✅ `401` |
| LMS: buka materi tanpa login | ✅ `307` ke `/kelas-saya` |
| Login CMS via IP LAN (`http://192.168.x.x:3015`) | ✅ redirect ke `/admin`, cookie `Secure=false` |

> n8n diuji pada instance terpisah (port 5679, profil `automation`) supaya tidak
> mengganggu instance n8n lain di mesin pengembangan.


## 14. Dokumen alur

Panduan bergambar (17 halaman): [`docs/ALUR-LENGKAP.pdf`](./docs/ALUR-LENGKAP.pdf) — alur peserta dari beranda sampai materi, dan alur admin dari login sampai kelola artikel.
