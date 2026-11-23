import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/student-auth";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sertifikat" };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const email = await requireStudent();
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { category: true, lessons: true },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findFirst({
    where: { courseId: course.id, email, status: "PAID" },
    include: { progress: true, certificate: true },
  });
  if (!enrollment) redirect("/kelas-saya");

  // Sertifikat hanya untuk kelas yang seluruh modulnya selesai.
  if (enrollment.progress.length < course.lessons.length || course.lessons.length === 0) {
    redirect(`/kelas-saya/${course.slug}`);
  }

  // Idempotent: terbitkan bila belum ada (mis. data lama sebelum fitur ini).
  const certificate =
    enrollment.certificate ??
    (await prisma.certificate.upsert({
      where: { enrollmentId: enrollment.id },
      update: {},
      create: {
        enrollmentId: enrollment.id,
        code: `KK-CERT-${enrollment.invoiceNo.replace(/^KK-/, "")}`,
      },
    }));

  const issued = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
    certificate.issuedAt
  );

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          header, footer, .no-print { display: none !important; }
          body { background: #fff !important; }
          main { padding: 0 !important; max-width: none !important; }
          .cert { box-shadow: none !important; border-width: 2px !important; }
        }
      `}</style>

      <main className="min-h-screen bg-[var(--color-paper)] px-5 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link href={`/kelas-saya/${course.slug}`} className="inline-flex min-h-7 items-center text-sm text-[var(--color-ink-soft)]">
              ← Kembali ke materi
            </Link>
            <PrintButton />
          </div>

          <article className="cert relative overflow-hidden rounded-3xl border-4 border-[#0f7a52] bg-white p-6 shadow-[0_30px_80px_-50px_rgba(15,28,23,0.5)] sm:border-[6px] sm:p-10 md:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#e6f4ec] sm:h-56 sm:w-56" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-[#f7f9f6] sm:h-56 sm:w-56" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#0f7a52] text-lg font-bold text-white">
                    K
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-tight">KelasKita</p>
                    <p className="text-[11px] text-[#4b5b54]">Platform Kelas IT</p>
                  </div>
                </div>
                <div className="text-right text-[10px] uppercase tracking-[0.18em] text-[#4b5b54]">
                  Sertifikat Penyelesaian
                </div>
              </div>

              <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-[#0a5c3d] sm:mt-10">
                Diberikan kepada
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {enrollment.studentName}
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#4b5b54]">
                atas keberhasilannya menyelesaikan seluruh{" "}
                <b className="text-[#0f1c17]">{course.lessons.length} modul</b> kelas{" "}
                <b className="text-[#0f1c17]">{course.title}</b> ({course.durationHours} jam)
                pada program <b className="text-[#0f1c17]">{course.category.name}</b>.
              </p>

              <div className="mt-10 flex flex-wrap items-end justify-between gap-8 border-t border-[#e2e8e3] pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#4b5b54]">Tanggal terbit</p>
                  <p className="mt-1 text-sm font-medium">{issued}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#4b5b54]">Nomor sertifikat</p>
                  <p className="mt-1 font-mono text-sm">{certificate.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-[cursive] text-lg text-[#0f1c17]">KelasKita</p>
                  <p className="mt-1 border-t border-[#e2e8e3] pt-1 text-[10px] uppercase tracking-wider text-[#4b5b54]">
                    Penyelenggara
                  </p>
                </div>
              </div>
            </div>
          </article>

          <p className="no-print mt-4 text-center text-xs leading-relaxed text-[var(--color-ink-soft)]">
            Verifikasi keaslian:{" "}
            <Link href={`/verifikasi/${certificate.code}`} className="underline">
              /verifikasi/{certificate.code}
            </Link>{" "}
            · Gunakan tombol <b>Cetak / Simpan PDF</b> lalu pilih “Save as PDF”.
          </p>
        </div>
      </main>
    </>
  );
}
