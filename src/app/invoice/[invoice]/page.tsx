import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { rupiah, statusLabel, tanggal } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoice: string }>;
}) {
  const { invoice } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { invoiceNo: invoice },
    include: { course: true, payment: true },
  });

  if (!enrollment) notFound();

  const isPaid = enrollment.status === "PAID";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-12">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                Invoice
              </p>
              <p className="mt-1 font-mono text-sm">{enrollment.invoiceNo}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isPaid
                  ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {statusLabel[enrollment.status]}
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {isPaid ? "Pendaftaran berhasil! 🎉" : "Menunggu pembayaran"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            {isPaid
              ? "Pembayaran sudah kami terima. Detail akses kelas dikirim ke email peserta."
              : "Selesaikan pembayaran untuk mengunci kursi kelas ini."}
          </p>

          <dl className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Kelas</dt>
              <dd className="text-right font-medium">{enrollment.course.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Peserta</dt>
              <dd className="text-right">{enrollment.studentName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Email</dt>
              <dd className="text-right">{enrollment.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Domisili</dt>
              <dd className="text-right">
                {enrollment.city}, {enrollment.province}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Dibuat</dt>
              <dd className="text-right">{tanggal(enrollment.createdAt)}</dd>
            </div>
            {enrollment.paidAt && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-soft)]">Dibayar</dt>
                <dd className="text-right">{tanggal(enrollment.paidAt)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-[var(--color-line)] pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{rupiah(enrollment.amount)}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            {!isPaid && (
              <Link
                href={`/bayar/${enrollment.invoiceNo}`}
                className="rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
              >
                Lanjutkan pembayaran
              </Link>
            )}
            <Link
              href="/#kelas"
              className="rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium hover:border-[var(--color-brand)]"
            >
              Lihat kelas lain
            </Link>
          </div>

          <p className="mt-6 text-xs text-[var(--color-ink-soft)]">
            Simpan tautan halaman ini untuk mengecek status pembayaran.
          </p>
        </div>
      </main>
    </>
  );
}
