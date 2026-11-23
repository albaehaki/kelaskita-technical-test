import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { rupiah, statusLabel, tanggal } from "@/lib/format";
import { markNotificationReadAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard CMS" };

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [courseCount, paidCount, pendingCount, revenue, recent, notifications] = await Promise.all([
    prisma.course.count(),
    prisma.enrollment.count({ where: { status: "PAID" } }),
    prisma.enrollment.count({ where: { status: "PENDING" } }),
    prisma.enrollment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.enrollment.findMany({
      include: { course: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const cards = [
    { label: "Total kelas", value: String(courseCount), hint: "termasuk nonaktif" },
    { label: "Pendaftaran lunas", value: String(paidCount), hint: "sepanjang waktu" },
    { label: "Menunggu bayar", value: String(pendingCount), hint: "invoice aktif" },
    { label: "Pendapatan", value: rupiah(revenue._sum.amount ?? 0), hint: "dari transaksi lunas" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Ringkasan operasional KelasKita.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm hover:border-[var(--color-brand)]"
        >
          Lihat website
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <p className="text-xs text-[var(--color-ink-soft)]">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{card.hint}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-[var(--color-line)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="font-medium">Pendaftaran terbaru</h2>
            <Link href="/admin/peserta" className="text-sm text-[var(--color-brand-dark)]">
              Semua
            </Link>
          </div>

          <div className="divide-y divide-[var(--color-line)]">
            {recent.length === 0 && (
              <p className="px-5 py-8 text-sm text-[var(--color-ink-soft)]">Belum ada pendaftaran.</p>
            )}
            {recent.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.studentName}</p>
                  <p className="truncate text-xs text-[var(--color-ink-soft)]">
                    {item.course.title} · {item.invoiceNo}
                  </p>
                </div>
                <span className="text-xs text-[var(--color-ink-soft)]">{tanggal(item.createdAt)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    item.status === "PAID"
                      ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {statusLabel[item.status]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-line)] bg-white">
          <div className="border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="font-medium">Notifikasi automation</h2>
            <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
              Dikirim oleh app & workflow n8n
            </p>
          </div>

          <div className="divide-y divide-[var(--color-line)]">
            {notifications.length === 0 && (
              <p className="px-5 py-8 text-sm text-[var(--color-ink-soft)]">
                Belum ada notifikasi. Lakukan pendaftaran untuk memicu workflow.
              </p>
            )}
            {notifications.map((notification) => (
              <div key={notification.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {!notification.read && (
                    <form action={markNotificationReadAction.bind(null, notification.id)}>
                      <button className="text-xs text-[var(--color-brand-dark)] hover:underline">
                        tandai
                      </button>
                    </form>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-soft)]">
                  {notification.body}
                </p>
                <p className="mt-1 text-[11px] text-[var(--color-ink-soft)]">
                  {notification.source} · {tanggal(notification.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
