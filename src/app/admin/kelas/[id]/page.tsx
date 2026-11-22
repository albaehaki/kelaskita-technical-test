import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CourseForm } from "../course-form";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/kelas" className="text-sm text-[var(--color-ink-soft)]">
          ← Kelas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit kelas</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{course.title}</p>
      </header>

      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
        <CourseForm
          course={{
            id: course.id,
            title: course.title,
            slug: course.slug,
            summary: course.summary,
            description: course.description,
            level: course.level,
            price: course.price,
            durationHours: course.durationHours,
            coverEmoji: course.coverEmoji,
            categoryId: course.categoryId,
            syllabus: course.syllabus,
            published: course.published,
          }}
        />
      </div>
    </div>
  );
}
