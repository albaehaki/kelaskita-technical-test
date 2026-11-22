import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { category: true, _count: { select: { enrollments: true } } },
  });

  if (!course || !course.published) notFound();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <nav className="text-sm text-[var(--color-ink-soft)]">
          <Link href="/" className="hover:text-[var(--color-ink)]">
            Beranda
          </Link>
          <span className="mx-2">/</span>
          <Link href="/#kelas" className="hover:text-[var(--color-ink)]">
            Katalog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-ink)]">{course.title}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <article>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-brand-soft)] text-3xl">
                {course.coverEmoji}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
                  {course.category.name}
                </p>
                <p className="text-sm text-[var(--color-ink-soft)]">
                  {course.level} · {course.durationHours} jam materi
                </p>
              </div>
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
              {course.description}
            </p>

            <section className="mt-10">
              <h2 className="text-lg font-semibold">Silabus</h2>
              <ol className="mt-4 divide-y divide-[var(--color-line)] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
                {course.syllabus.map((item, index) => (
                  <li key={item} className="flex items-start gap-4 px-5 py-4">
                    <span className="mt-0.5 text-sm font-semibold text-[var(--color-brand)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[var(--color-ink)]">{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-10 rounded-2xl bg-white p-6">
              <h2 className="text-lg font-semibold">Yang kamu dapat</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Akses materi selamanya",
                  "Proyek akhir yang direview",
                  "Sertifikat penyelesaian",
                  "Grup diskusi peserta",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--color-brand-soft)] text-xs text-[var(--color-brand-dark)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
              <p className="text-sm text-[var(--color-ink-soft)]">Biaya pendaftaran</p>
              <p className="mt-1 text-3xl font-semibold">{rupiah(course.price)}</p>
              <p className="mt-1 text-xs text-[var(--color-ink-soft)]">Sekali bayar, akses permanen</p>

              <Link
                href={`/checkout/${course.slug}`}
                className="mt-5 block rounded-xl bg-[var(--color-brand)] px-4 py-3 text-center text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
              >
                Daftar kelas ini
              </Link>

              <dl className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Durasi</dt>
                  <dd>{course.durationHours} jam</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Level</dt>
                  <dd>{course.level}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Peserta</dt>
                  <dd>{course._count.enrollments} orang</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Pembayaran</dt>
                  <dd>Payment gateway</dd>
                </div>
              </dl>
            </div>

            <p className="mt-4 px-2 text-xs leading-relaxed text-[var(--color-ink-soft)]">
              Butuh invoice untuk perusahaan? Tulis di catatan pendaftaran, kami kirimkan faktur
              atas nama instansi.
            </p>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
