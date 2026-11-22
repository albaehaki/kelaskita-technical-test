# Alur Automation (n8n)

Dokumen ini menjelaskan **siapa memanggil siapa** pada integrasi n8n, supaya tidak
ambigu saat menilai atau mendemokan aplikasi.

## Prinsip

- Aplikasi **tidak** memberi n8n akses ke database.
- Aplikasi mengirim **event** (HTTP POST) ke webhook n8n.
- n8n memproses (format/filter/enrich) lalu **memanggil balik** endpoint internal aplikasi.
- Hasil akhirnya tersimpan di tabel `Notification` dan tampil di dashboard CMS.

```
 Pengunjung
    │  POST /api/checkout
    ▼
 Next.js (3015) ── simpan Enrollment + Payment (PENDING)
    │
    │  POST http://n8n:5678/webhook/kelaskita-order   (di Docker: nama service)
    ▼
 n8n (host 5679 → container 5678)
    │  Webhook Order → Format Pesan (Code)
    │
    │  POST http://host.docker.internal:3015/api/internal/notifications
    │  header: x-internal-secret: internal-secret-demo
    ▼
 Next.js (3015) ── simpan Notification (source = "n8n")
    │
    ▼
 Dashboard CMS ── feed "Notifikasi automation"

 Pembayaran lunas:
 POST /api/payments/mock | /api/payments/webhook
    → markEnrollmentPaid()  (idempotent via webhook_events.eventId)
    → emit event "order.paid" → n8n → callback → Notification "✅ Pembayaran lunas"
```

## Workflow

| File | Trigger | Status di demo | Aksi |
|---|---|---|---|
| `01-order-notification.json` | Webhook `POST /webhook/kelaskita-order` | **Aktif** | Format pesan → callback ke CMS |
| `02-daily-report.json` | Schedule `0 7 * * *` | **Non-aktif** (sengaja) | `GET /api/internal/daily-report` → ringkasan → callback ke CMS |

Workflow 02 tidak perlu aktif untuk demo webhook; aktifkan bila ingin menjadwalkan rekap.

## Port & akun (jangan tertukar)

| Komponen | Alamat | Akun |
|---|---|---|
| Website | http://localhost:3015 | — |
| CMS | http://localhost:3015/admin | `admin@kelaskita.test` / `Admin123!` |
| **n8n uji KelasKita** | **http://localhost:5679** | `automation@kelaskita.test` / `Automation123!` |
| n8n lain di mesin pengembang | http://localhost:5678 | bukan bagian proyek ini |

> Di dalam network Docker, aplikasi memanggil `http://n8n:5678` (bukan `localhost:5678`).
> Kalau aplikasi dijalankan tanpa Docker, set `N8N_WEBHOOK_URL=http://localhost:5679/webhook/kelaskita-order`.

## Checklist ketika notifikasi tidak muncul

1. **Port benar?** `5679`, bukan `5678`.
2. **Workflow 01 aktif?** Buka n8n → Workflows → pastikan toggle *Active*.
3. **Secret sama?** Header `x-internal-secret` di node HTTP = `INTERNAL_SECRET` di `.env`.
4. **URL callback benar?** Di Docker: `host.docker.internal:3015`. Di Linux: pakai IP host
   atau nama service `app:3015`.
5. **Dashboard di-refresh?** Belum ada push realtime; notifikasi muncul setelah refresh.
6. **Cek Executions di n8n** — kalau ada eksekusi merah, klik dan lihat node mana yang gagal.

## Bukti verifikasi

- Eksekusi n8n untuk invoice `KK-20261122-B0SSK`: **success** (2 event: `order.created`, `order.paid`).
- Tabel `Notification`: 5 baris dengan `source = 'n8n'`.
- Endpoint internal menolak request tanpa secret (`401`).
