import Link from "next/link";
import { prisma } from "@/lib/db";
import { IconCheck } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verifikasi Sertifikat" };

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { code: decodeURIComponent(code) },
    include: {
      enrollment: { include: { course: true } },
    },
  });

  const valid = Boolean(certificate);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-paper)] px-5 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-brand)] text-white">
              K
            </span>
            <div>
              <p className="text-sm font-semibold">Verifikasi Sertifikat</p>
              <p className="text-xs text-[var(--color-ink-soft)]">KelasKita</p>
            </div>
          </div>

          <div
            className={`mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              valid ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]" : "bg-red-50 text-red-700"
            }`}
          >
            {valid && <IconCheck className="h-4 w-4 shrink-0" />}
            {valid ? "Sertifikat sah dan terdaftar." : "Kode sertifikat tidak ditemukan."}
          </div>

          {certificate && (
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-soft)]">Nama</dt>
                <dd className="text-right font-medium">{certificate.enrollment.studentName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-soft)]">Kelas</dt>
                <dd className="text-right">{certificate.enrollment.course.title}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-soft)]">Durasi</dt>
                <dd className="text-right">{certificate.enrollment.course.durationHours} jam</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-ink-soft)]">Terbit</dt>
                <dd className="text-right">
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(certificate.issuedAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--color-line)] pt-3">
                <dt className="text-[var(--color-ink-soft)]">Kode</dt>
                <dd className="text-right font-mono text-xs">{certificate.code}</dd>
              </div>
            </dl>
          )}

          <Link
            href="/"
            className="mt-7 inline-block rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-sm hover:border-[var(--color-brand)]"
          >
            Ke website KelasKita
          </Link>
        </div>
      </div>
    </main>
  );
}
