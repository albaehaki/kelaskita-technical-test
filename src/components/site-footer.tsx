import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-line)] bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-brand)] text-white">
              K
            </span>
            KelasKita
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-ink-soft)]">
            Kelas IT praktis dengan proyek akhir, pendampingan, dan sertifikat penyelesaian.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium">Navigasi</p>
          <ul className="mt-3 space-y-2 text-[var(--color-ink-soft)]">
            <li>
              <Link href="/#kelas" className="hover:text-[var(--color-ink)]">
                Katalog kelas
              </Link>
            </li>
            <li>
              <Link href="/artikel" className="hover:text-[var(--color-ink)]">
                Artikel
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-[var(--color-ink)]">
                Masuk CMS
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium">Kontak</p>
          <ul className="mt-3 space-y-2 text-[var(--color-ink-soft)]">
            <li>halo@kelaskita.test</li>
            <li>0812-9846-0513</li>
            <li>Bekasi, Jawa Barat</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)] py-5 text-center text-xs text-[var(--color-ink-soft)]">
        © {new Date().getFullYear()} KelasKita — dibuat sebagai technical test.
      </div>
    </footer>
  );
}
