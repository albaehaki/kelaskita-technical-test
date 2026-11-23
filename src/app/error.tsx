"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-16">
      <div className="max-w-md rounded-2xl border border-[var(--color-line)] bg-white p-7 text-center">
        <p className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">Kesalahan</p>
        <h1 className="mt-2 text-xl font-semibold">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Data tidak berhasil diambil. Coba muat ulang halaman. Kalau masih gagal, kembali ke
          beranda dan ulangi dari sana.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-sm hover:border-[var(--color-brand)]"
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
