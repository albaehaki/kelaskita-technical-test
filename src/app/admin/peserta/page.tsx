import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { rupiah, statusLabel, tanggal } from "@/lib/format";
import { updateEnrollmentStatusAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pendaftaran" };

export default async function AdminEnrollmentsPage() {
  await requireAdmin();

  const enrollments = await prisma.enrollment.findMany({
    include: { course: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pendaftaran</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {enrollments.length} transaksi · ubah status untuk koreksi manual.
        </p>
      </header>

      {/* Mobile: kartu ringkas, tabel penuh disembunyikan */}
      <section className="space-y-3 md:hidden">
        {enrollments.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-[var(--color-line)] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-xs">{item.invoiceNo}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  item.status === "PAID"
                    ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {statusLabel[item.status]}
              </span>
            </div>

            <p className="mt-2 text-sm font-medium">{item.studentName}</p>
            <p className="text-xs text-[var(--color-ink-soft)]">
              {item.email} · {item.city}
            </p>
            <p className="mt-1 text-xs">{item.course.title}</p>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-line)] pt-3">
              <p className="text-sm font-medium">{rupiah(item.amount)}</p>
              <form
                action={updateEnrollmentStatusAction.bind(null, item.id)}
                className="flex items-center gap-1.5"
              >
                <select
                  name="status"
                  defaultValue={item.status}
                  className="rounded-lg border border-[var(--color-line)] bg-white px-2 py-1.5 text-xs"
                >
                  <option value="PENDING">{statusLabel.PENDING}</option>
                  <option value="PAID">{statusLabel.PAID}</option>
                  <option value="EXPIRED">{statusLabel.EXPIRED}</option>
                  <option value="CANCELLED">{statusLabel.CANCELLED}</option>
                </select>
                <button className="rounded-lg bg-[var(--color-brand)] px-2.5 py-1.5 text-xs text-white hover:bg-[var(--color-brand-dark)]">
                  Simpan
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>

      <section className="hidden overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-white md:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-[var(--color-paper)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Peserta</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {enrollments.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-mono text-xs">{item.invoiceNo}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{item.studentName}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    {item.email} · {item.city}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs">{item.course.title}</td>
                <td className="px-4 py-3">{rupiah(item.amount)}</td>
                <td className="px-4 py-3 text-xs text-[var(--color-ink-soft)]">
                  {tanggal(item.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <form
                    action={updateEnrollmentStatusAction.bind(null, item.id)}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="rounded-lg border border-[var(--color-line)] bg-white px-2 py-1.5 text-xs"
                    >
                      <option value="PENDING">{statusLabel.PENDING}</option>
                      <option value="PAID">{statusLabel.PAID}</option>
                      <option value="EXPIRED">{statusLabel.EXPIRED}</option>
                      <option value="CANCELLED">{statusLabel.CANCELLED}</option>
                    </select>
                    <button className="rounded-lg bg-[var(--color-brand)] px-2.5 py-1.5 text-xs text-white hover:bg-[var(--color-brand-dark)]">
                      Simpan
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-[var(--color-ink-soft)]">
        Perubahan status lewat CMS tidak mengirim ulang notifikasi n8n, automation hanya terpicu
        dari event pembayaran, supaya tidak ada notifikasi ganda.
      </p>
    </div>
  );
}
