import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { rupiah } from "@/lib/format";
import { CourseForm } from "./course-form";
import { deleteCourseAction, toggleCourseAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelola Kelas" };

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    include: { category: true, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Kelas</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {courses.length} kelas · kelola konten yang tampil di website.
        </p>
      </header>

      <details className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-brand-dark)]">
          + Tambah kelas baru
        </summary>
        <div className="mt-5 border-t border-[var(--color-line)] pt-5">
          <CourseForm />
        </div>
      </details>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        <div className="divide-y divide-[var(--color-line)]">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-xl">
                {course.coverEmoji}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{course.title}</p>
                <p className="truncate text-xs text-[var(--color-ink-soft)]">
                  {course.category.name} · {course._count.enrollments} peserta ·{" "}
                  {course.published ? "tayang" : "draft"}
                </p>
              </div>

              <span className="text-sm font-medium">{rupiah(course.price)}</span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/kelas/${course.id}`}
                  className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs hover:border-[var(--color-brand)]"
                >
                  Edit
                </Link>

                <form action={toggleCourseAction.bind(null, course.id)}>
                  <button className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs hover:border-[var(--color-brand)]">
                    {course.published ? "Sembunyikan" : "Tayangkan"}
                  </button>
                </form>

                <form action={deleteCourseAction.bind(null, course.id)}>
                  <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-[var(--color-ink-soft)]">
        Kelas yang sudah punya transaksi tidak dihapus permanen — hanya disembunyikan, supaya
        riwayat pendaftaran tetap utuh.
      </p>
    </div>
  );
}
