import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { CourseCard } from "@/components/course-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CourseIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [courses, articles, enrollmentCount] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.enrollment.count({ where: { status: "PAID" } }),
  ]);

  const cheapest = courses.reduce(
    (min, course) => (course.price < min ? course.price : min),
    courses[0]?.price ?? 0
  );

  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:pt-24">
          <div className="grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
                Belajar IT dari praktisi,
                <br />
                bukan dari slide mati.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-ink-soft)]">
                Enam kelas inti, silabus yang jelas, dan proyek akhir yang bisa langsung masuk
                portofolio. Daftar, bayar, dan mulai belajar di hari yang sama.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="#kelas"
                  className="rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
                >
                  Lihat katalog kelas
                </Link>
                <Link
                  href="/artikel"
                  className="rounded-xl border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-medium hover:border-[var(--color-brand)]"
                >
                  Baca artikel
                </Link>
              </div>

              <dl className="mt-8 grid max-w-md grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-6 sm:mt-10 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-[var(--color-ink-soft)]">Kelas aktif</dt>
                  <dd className="mt-1 text-xl font-semibold">{courses.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-ink-soft)]">Peserta lunas</dt>
                  <dd className="mt-1 text-xl font-semibold">{enrollmentCount}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-xs text-[var(--color-ink-soft)]">Mulai dari</dt>
                  <dd className="mt-1 text-xl font-semibold">
                    {courses.length ? rupiah(cheapest) : "Belum tersedia"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Kartu kelas unggulan */}
            <div className="rounded-3xl border border-[var(--color-line)] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,28,23,0.4)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Kelas paling dicari</p>
                <span className="rounded-full bg-[var(--color-brand-soft)] px-2 py-1 text-xs text-[var(--color-brand-dark)]">
                  update mingguan
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {courses.slice(0, 3).map((course, index) => (
                  <li key={course.id}>
                    <Link
                      href={`/kelas/${course.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-transparent p-2 hover:border-[var(--color-line)] hover:bg-[var(--color-paper)]"
                    >
                      <span className="w-5 text-sm font-semibold text-[var(--color-ink-soft)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
                        <CourseIcon slug={course.slug} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{course.title}</span>
                        <span className="block text-xs text-[var(--color-ink-soft)]">
                          {course.level} · {course.durationHours} jam
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-sm font-semibold sm:block">{rupiah(course.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl bg-[var(--color-paper)] p-4 text-sm text-[var(--color-ink-soft)]">
                Pembayaran diproses lewat payment gateway dengan status yang bisa dilacak
                real-time. Bukti pendaftaran langsung dikirim setelah lunas.
              </div>
            </div>
          </div>
        </section>

        {/* Katalog */}
        <section id="kelas" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
                Katalog
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                Pilih kelas sesuai tahapmu
              </h2>
            </div>
            <p className="text-sm text-[var(--color-ink-soft)]">
              {courses.length} kelas · materi diperbarui berkala
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        {/* Cara kerja */}
        <section id="cara-kerja" className="scroll-mt-20 border-y border-[var(--color-line)] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Dari daftar sampai belajar, empat langkah
            </h2>

            <ol className="mt-8 grid gap-6 md:grid-cols-4">
              {[
                {
                  title: "Pilih kelas",
                  body: "Baca silabus dan prasyarat. Tidak ada kelas yang dipaksakan untuk semua orang.",
                },
                {
                  title: "Isi pendaftaran",
                  body: "Data peserta dan domisili (provinsi/kota) diambil dari API wilayah resmi.",
                },
                {
                  title: "Bayar",
                  body: "Invoice dibuat otomatis, pembayaran diproses payment gateway.",
                },
                {
                  title: "Mulai belajar",
                  body: "Status lunas memicu notifikasi otomatis dan akses materi dikirim ke email.",
                },
              ].map((step, index) => (
                <li key={step.title} className="rounded-2xl bg-[var(--color-paper)] p-5">
                  <span className="text-xs font-semibold text-[var(--color-brand)]">
                    LANGKAH {index + 1}
                  </span>
                  <h3 className="mt-2 font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Artikel */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Catatan belajar</h2>
            <Link href="/artikel" className="inline-flex min-h-7 items-center text-sm font-medium text-[var(--color-brand-dark)]">
              Semua artikel
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/artikel/${article.slug}`}
                className="rounded-2xl border border-[var(--color-line)] bg-white p-5 transition hover:border-[var(--color-brand)]"
              >
                <p className="text-xs text-[var(--color-ink-soft)]">
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
                    article.createdAt
                  )}
                </p>
                <h3 className="mt-2 font-medium leading-snug">{article.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {article.excerpt}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-[var(--color-brand-dark)]">
                  Baca
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-4">
          <div className="rounded-3xl bg-[var(--color-ink)] px-6 py-12 text-center text-white md:px-12">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Siap mulai dari kelas pertama?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Tidak perlu bayar semuanya di depan. Pilih satu kelas, selesaikan proyek akhirnya,
              lalu lanjut ke tahap berikutnya.
            </p>
            <Link
              href="#kelas"
              className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-brand-soft)]"
            >
              Lihat katalog
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
