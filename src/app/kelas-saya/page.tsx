import Link from "next/link";
import { getStudentEmail, getStudentEnrollments } from "@/lib/student-auth";
import { StudentLoginForm } from "@/components/student-login-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { tanggal } from "@/lib/format";

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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Area peserta</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Kelas Saya</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Masuk sebagai {email}</p>
          </div>
          <form action="/api/student/logout" method="post">
            <button className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm hover:border-[var(--color-brand)]">
              Keluar
            </button>
          </form>
        </div>

        {enrollments.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-8 text-center">
            <p className="text-sm text-[var(--color-ink-soft)]">
              Belum ada kelas lunas untuk email ini.
            </p>
            <Link
              href="/#kelas"
              className="mt-4 inline-block rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm text-white"
            >
              Lihat katalog
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-2xl border border-[var(--color-line)] bg-white p-5"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-2xl">
                    {enrollment.course.coverEmoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[var(--color-brand-dark)]">
                      {enrollment.course.category.name}
                    </p>
                    <h2 className="mt-0.5 font-medium">{enrollment.course.title}</h2>
                    <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                      {enrollment.course.lessons.length} modul · lunas {enrollment.paidAt ? tanggal(enrollment.paidAt) : "-"}
                    </p>
                  </div>

                  <Link
                    href={`/kelas-saya/${enrollment.course.slug}`}
                    className="rounded-xl bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
                  >
                    Buka materi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
