import Link from "next/link";
import { getStudentEmail, getStudentEnrollments } from "@/lib/student-auth";
import { StudentLoginForm } from "@/components/student-login-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { rupiah, tanggal } from "@/lib/format";
import { CourseIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kelas Saya" };

export default async function KelasSayaPage() {
  const email = await getStudentEmail();

  if (!email) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-14">
          <h1 className="text-2xl font-semibold tracking-tight">Masuk ke kelas saya</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Area peserta untuk mengakses materi kelas yang sudah dibayar.
          </p>
          <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-white p-6">
            <StudentLoginForm />
          </div>
          <p className="mt-4 text-center text-xs text-[var(--color-ink-soft)]">
            Belum pernah mendaftar?{" "}
            <Link href="/#kelas" className="underline">
              Lihat katalog kelas
            </Link>
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const enrollments = await getStudentEnrollments(email);
  const studentName = enrollments[0]?.studentName ?? email.split("@")[0];

  const totalLessons = enrollments.reduce((sum, e) => sum + e.course.lessons.length, 0);
  const doneLessons = enrollments.reduce((sum, e) => sum + e.progress.length, 0);
  const overall = totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100);
  const completedCourses = enrollments.filter(
    (e) => e.course.lessons.length > 0 && e.progress.length === e.course.lessons.length
  ).length;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Dashboard peserta</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Halo, {studentName}</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{email}</p>
          </div>
          <form action="/api/student/logout" method="post">
            <button className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm hover:border-[var(--color-brand)]">
              Keluar
            </button>
          </form>
        </div>

        {/* Statistik */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Kelas aktif", value: String(enrollments.length) },
            { label: "Modul selesai", value: `${doneLessons}/${totalLessons}` },
            { label: "Progress total", value: `${overall}%` },
            { label: "Kelas tuntas", value: String(completedCourses) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
              <p className="text-xs text-[var(--color-ink-soft)]">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Progress keseluruhan */}
        <div className="mt-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress belajar keseluruhan</span>
            <span className="text-[var(--color-ink-soft)]">{overall}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-paper)]">
            <div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${overall}%` }} />
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-white p-8 text-center">
            <p className="text-sm text-[var(--color-ink-soft)]">Belum ada kelas lunas untuk email ini.</p>
            <Link
              href="/#kelas"
              className="mt-4 inline-block rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm text-white"
            >
              Lihat katalog
            </Link>
          </div>
        ) : (
          <section className="mt-6 space-y-4">
            <h2 className="text-sm font-medium text-[var(--color-ink-soft)]">Kelas yang kamu ikuti</h2>

            {enrollments.map((enrollment) => {
              const total = enrollment.course.lessons.length;
              const done = enrollment.progress.length;
              const percent = total === 0 ? 0 : Math.round((done / total) * 100);
              const finished = total > 0 && done === total;

              return (
                <article
                  key={enrollment.id}
                  className="rounded-2xl border border-[var(--color-line)] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
                      <CourseIcon slug={enrollment.course.slug} className="h-6 w-6" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-[var(--color-brand-dark)]">
                          {enrollment.course.category.name}
                        </p>
                        {finished && (
                          <span className="rounded-full bg-[var(--color-brand-soft)] px-2 py-0.5 text-[11px] text-[var(--color-brand-dark)]">
                            selesai
                          </span>
                        )}
                      </div>
                      <h3 className="mt-0.5 font-medium">{enrollment.course.title}</h3>
                      <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                        {done}/{total} modul · lunas {enrollment.paidAt ? tanggal(enrollment.paidAt) : "-"} ·{" "}
                        {rupiah(enrollment.amount)}
                      </p>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-paper)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-brand)]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/kelas-saya/${enrollment.course.slug}`}
                        className="rounded-xl bg-[var(--color-brand)] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
                      >
                        {done === 0 ? "Mulai belajar" : finished ? "Ulangi materi" : "Lanjut belajar"}
                      </Link>
                      {finished && (
                        <Link
                          href={`/kelas-saya/${enrollment.course.slug}/sertifikat`}
                          className="rounded-xl border border-[var(--color-brand)] px-4 py-2 text-center text-sm font-medium text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-soft)]"
                        >
                          Lihat sertifikat
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
