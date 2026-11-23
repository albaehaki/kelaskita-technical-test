import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/student-auth";
import { SiteHeader } from "@/components/site-header";
import { toggleLessonAction } from "../actions";

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
    include: { progress: { select: { lessonId: true } } },
  });

  if (!enrollment) redirect("/kelas-saya");

  const doneIds = new Set(enrollment.progress.map((p) => p.lessonId));
  const total = course.lessons.length;
  const done = course.lessons.filter((lesson) => doneIds.has(lesson.id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const nextLesson = course.lessons.find((lesson) => !doneIds.has(lesson.id));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link href="/kelas-saya" className="text-sm text-[var(--color-ink-soft)]">
          ← Dashboard peserta
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-brand-soft)] text-3xl">
            {course.coverEmoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand)]">
              {course.category.name}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{course.title}</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              {done}/{total} modul selesai · invoice {enrollment.invoiceNo}
            </p>
          </div>
        </div>

        {/* Progress kelas */}
        <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {percent === 100 ? "Kelas selesai 🎉" : nextLesson ? `Berikutnya: ${nextLesson.title}` : "Progress"}
            </span>
            <span className="text-[var(--color-ink-soft)]">{percent}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-paper)]">
            <div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <section className="mt-6 space-y-3">
          {course.lessons.map((lesson) => {
            const isDone = doneIds.has(lesson.id);

            return (
              <article
                key={lesson.id}
                className={`rounded-2xl border bg-white p-5 ${
                  isDone ? "border-[var(--color-brand)]" : "border-[var(--color-line)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs ${
                      isDone
                        ? "bg-[var(--color-brand)] text-white"
                        : "bg-[var(--color-paper)] text-[var(--color-brand-dark)]"
                    }`}
                  >
                    {isDone ? "✓" : String(lesson.order).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-medium">{lesson.title}</h2>

                    <div className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                      {lesson.content.split("\n\n").map((paragraph) => (
                        <p key={paragraph.slice(0, 20)} className="mb-2 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <form
                      action={toggleLessonAction.bind(null, enrollment.id, lesson.id)}
                      className="mt-3"
                    >
                      <button
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          isDone
                            ? "border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-brand)]"
                            : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]"
                        }`}
                      >
                        {isDone ? "Batalkan penyelesaian" : "Tandai modul selesai"}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <p className="mt-8 text-xs leading-relaxed text-[var(--color-ink-soft)]">
          Progress tersimpan per akun peserta (email + invoice). Materi dikelola dari CMS.
        </p>
      </main>
    </>
  );
}
