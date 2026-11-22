import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/student-auth";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const email = await requireStudent();
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { category: true, lessons: { orderBy: { order: "asc" } } },
  });

  if (!course) notFound();

  const enrollment = await prisma.enrollment.findFirst({
    where: { courseId: course.id, email, status: "PAID" },
  });

  // Belum membayar kelas ini → kembalikan ke halaman kelas saya.
  if (!enrollment) redirect("/kelas-saya");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link href="/kelas-saya" className="text-sm text-[var(--color-ink-soft)]">
          ← Kelas saya
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-brand-soft)] text-3xl">
            {course.coverEmoji}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand)]">
              {course.category.name}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{course.title}</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              {course.lessons.length} modul · {course.durationHours} jam · {course.level}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-[var(--color-brand-soft)] px-4 py-3 text-sm text-[var(--color-brand-dark)]">
          Akses terbuka — invoice <b>{enrollment.invoiceNo}</b> sudah lunas.
        </div>

        <section className="mt-8 space-y-3">
          {course.lessons.map((lesson) => (
            <details
              key={lesson.id}
              className="group rounded-2xl border border-[var(--color-line)] bg-white p-5"
              open={lesson.order === 1}
            >
              <summary className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--color-paper)] text-xs text-[var(--color-brand-dark)]">
                  {String(lesson.order).padStart(2, "0")}
                </span>
                {lesson.title}
                <span className="ml-auto text-xs font-normal text-[var(--color-ink-soft)] group-open:hidden">
                  buka
                </span>
              </summary>
              <div className="mt-4 border-t border-[var(--color-line)] pt-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {lesson.content.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 20)} className="mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </section>

        <p className="mt-8 text-xs leading-relaxed text-[var(--color-ink-soft)]">
          Materi dikelola dari CMS. Untuk kelas dengan pendampingan, tautan grup diskusi dikirim
          terpisah setelah pembayaran terverifikasi.
        </p>
      </main>
    </>
  );
}
