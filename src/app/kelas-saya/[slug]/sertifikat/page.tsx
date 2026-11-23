import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/student-auth";
import { PrintButton } from "@/components/print-button";
import { CertificateScaler } from "@/components/certificate-scaler";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sertifikat" };

const CERT_WIDTH = 1000;
const CERT_HEIGHT = 707; // rasio A4 landscape (1.414)

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

  if (enrollment.progress.length < course.lessons.length || course.lessons.length === 0) {
    redirect(`/kelas-saya/${course.slug}`);
  }

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
          @page { size: A4 landscape; margin: 6mm; }
          header, footer, .no-print { display: none !important; }
          body { background: #fff !important; }
          main { padding: 0 !important; max-width: none !important; }
          .cert-frame { height: ${CERT_HEIGHT}px !important; }
          .cert-zoom { transform: none !important; }
        }
      `}</style>

      <main className="bg-[var(--color-paper)] px-5 py-10">
        <div className="mx-auto max-w-[1000px]">
          <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/kelas-saya/${course.slug}`}
              className="inline-flex min-h-7 items-center text-sm text-[var(--color-ink-soft)]"
            >
              ← Kembali ke materi
            </Link>
            <PrintButton />
          </div>

          <CertificateScaler width={CERT_WIDTH} height={CERT_HEIGHT}>
            <article
              className="cert relative overflow-hidden rounded-[28px] border-[6px] border-[#0f7a52] bg-white"
              style={{ width: CERT_WIDTH, height: CERT_HEIGHT, padding: 56 }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#e6f4ec]" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#f7f9f6]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0f7a52] text-xl font-bold text-white">
                      K
                    </span>
                    <div>
                      <p className="text-[16px] font-semibold tracking-tight">KelasKita</p>
                      <p className="text-[12px] text-[#4b5b54]">Platform Kelas IT</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] uppercase tracking-[0.18em] text-[#4b5b54]">
                    Sertifikat Penyelesaian
                  </div>
                </div>

                <p className="mt-12 text-[11px] uppercase tracking-[0.2em] text-[#0a5c3d]">
                  Diberikan kepada
                </p>
                <h1 className="mt-2 text-[54px] font-semibold leading-[1.05] tracking-tight">
                  {enrollment.studentName}
                </h1>

                <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed text-[#4b5b54]">
                  atas keberhasilannya menyelesaikan seluruh{" "}
                  <b className="text-[#0f1c17]">{course.lessons.length} modul</b> kelas{" "}
                  <b className="text-[#0f1c17]">{course.title}</b> ({course.durationHours} jam)
                  pada program <b className="text-[#0f1c17]">{course.category.name}</b>.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-6 border-y border-[#e2e8e3] py-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4b5b54]">Durasi</p>
                    <p className="mt-1 text-[14px] font-medium">{course.durationHours} jam</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4b5b54]">Level</p>
                    <p className="mt-1 text-[14px] font-medium">{course.level}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4b5b54]">Modul</p>
                    <p className="mt-1 text-[14px] font-medium">{course.lessons.length} modul selesai</p>
                  </div>
                </div>

                <div className="mt-auto flex items-end justify-between gap-8 pt-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4b5b54]">
                      Tanggal terbit
                    </p>
                    <p className="mt-1 text-[14px] font-medium">{issued}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#4b5b54]">
                      Nomor sertifikat
                    </p>
                    <p className="mt-1 font-mono text-[13px]">{certificate.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[20px] italic text-[#0f1c17]">KelasKita</p>
                    <p className="mt-1 border-t border-[#e2e8e3] pt-1 text-[10px] uppercase tracking-wider text-[#4b5b54]">
                      Penyelenggara
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </CertificateScaler>

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
