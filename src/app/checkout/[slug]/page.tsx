import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { getProvinces } from "@/lib/wilayah";
import { SiteHeader } from "@/components/site-header";
import { CheckoutForm } from "@/components/checkout-form";
import { CourseIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || !course.published) notFound();

  const provinces = await getProvinces();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <Link href={`/kelas/${course.slug}`} className="text-sm text-[var(--color-ink-soft)]">
          ← Kembali ke detail kelas
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Pendaftaran kelas
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Isi data peserta, lalu lanjut ke pembayaran.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
            <CheckoutForm courseId={course.id} initialProvinces={provinces.data} />

            <p className="mt-5 border-t border-[var(--color-line)] pt-4 text-xs text-[var(--color-ink-soft)]">
              Sumber data wilayah:{" "}
              <a
                href="https://www.emsifa.com/api-wilayah-indonesia/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                API Wilayah Indonesia
              </a>{" "}
              ({provinces.source === "api" ? "live" : "fallback statis"}).
            </p>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]">
                  <CourseIcon slug={course.slug} className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-medium">{course.title}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    {course.level} · {course.durationHours} jam
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-2 border-t border-[var(--color-line)] pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Biaya kelas</dt>
                  <dd>{rupiah(course.price)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-soft)]">Biaya admin</dt>
                  <dd>Rp0</dd>
                </div>
                <div className="flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{rupiah(course.price)}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl bg-[var(--color-paper)] p-4 text-xs leading-relaxed text-[var(--color-ink-soft)]">
                Pembayaran diproses payment gateway. Status invoice bisa dicek kapan saja lewat
                tautan yang muncul setelah checkout.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
