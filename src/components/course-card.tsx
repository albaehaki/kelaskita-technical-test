import Link from "next/link";
import { rupiah } from "@/lib/format";
import { CourseIcon } from "@/components/icons";

export type CourseCardData = {
  slug: string;
  title: string;
  summary: string;
  level: string;
  price: number;
  durationHours: number;
  coverEmoji: string;
  category: { name: string };
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/kelas/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-brand)] hover:shadow-[0_12px_30px_-18px_rgba(15,122,82,0.45)]"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
          <CourseIcon slug={course.slug} className="h-6 w-6" />
        </span>
        <span className="rounded-full border border-[var(--color-line)] px-2.5 py-1 text-xs text-[var(--color-ink-soft)]">
          {course.level}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--color-brand)]">
        {course.category.name}
      </p>
      <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:text-[var(--color-brand-dark)]">
        {course.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        {course.summary}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
        <span className="text-sm font-semibold text-[var(--color-ink)]">{rupiah(course.price)}</span>
        <span className="text-xs text-[var(--color-ink-soft)]">{course.durationHours} jam</span>
      </div>
    </Link>
  );
}
