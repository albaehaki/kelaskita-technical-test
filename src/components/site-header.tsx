import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-brand)] text-white">
            K
          </span>
          <span className="text-lg">KelasKita</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[var(--color-ink-soft)] md:flex">
          <Link href="/#kelas" className="hover:text-[var(--color-ink)]">
            Katalog Kelas
          </Link>
          <Link href="/artikel" className="hover:text-[var(--color-ink)]">
            Artikel
          </Link>
          <Link href="/kelas-saya" className="hover:text-[var(--color-ink)]">
            Kelas Saya
          </Link>
          <Link href="/#cara-kerja" className="hover:text-[var(--color-ink)]">
            Cara Kerja
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/admin"
            className="hidden rounded-lg px-3 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-dark)] sm:block"
          >
            CMS
          </Link>
          <Link
            href="/#kelas"
            className="rounded-lg bg-[var(--color-brand)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)] sm:px-4"
          >
            <span className="sm:hidden">Katalog</span>
            <span className="hidden sm:inline">Mulai belajar</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
