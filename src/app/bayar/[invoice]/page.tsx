import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { PayButton } from "@/components/pay-button";

export const dynamic = "force-dynamic";

export default async function MockPayPage({
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
  if (enrollment.status === "PAID") redirect(`/invoice/${enrollment.invoiceNo}`);

  const expired =
    Date.now() - new Date(enrollment.createdAt).getTime() > 24 * 60 * 60 * 1000;

  return (
    <main className="min-h-screen bg-[var(--color-paper)] px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,28,23,0.35)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Mock Payment Gateway</span>
            <span className="rounded-full bg-[var(--color-brand-soft)] px-2.5 py-1 text-xs text-[var(--color-brand-dark)]">
              {enrollment.payment?.provider ?? "mock"}
            </span>
          </div>

          <p className="mt-6 text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
            Total pembayaran
          </p>
          <p className="mt-1 text-3xl font-semibold">{rupiah(enrollment.amount)}</p>

          <dl className="mt-6 space-y-3 border-y border-[var(--color-line)] py-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Invoice</dt>
              <dd className="font-mono text-xs">{enrollment.invoiceNo}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Kelas</dt>
              <dd className="text-right">{enrollment.course.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-ink-soft)]">Peserta</dt>
              <dd className="text-right">{enrollment.studentName}</dd>
            </div>
          </dl>

          <div className="mt-6">
            {expired ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Invoice sudah melewati batas 24 jam. Silakan daftar ulang.
              </p>
            ) : (
              <PayButton invoiceNo={enrollment.invoiceNo} />
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--color-ink-soft)]">
          Halaman ini mensimulasikan halaman payment gateway. Di produksi, URL ini diganti
          redirect_url dari Midtrans/Xendit.
        </p>
      </div>
    </main>
  );
}
