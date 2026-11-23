export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-line)]" />
      <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-[var(--color-line)]" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[var(--color-line)]" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-48 animate-pulse rounded-2xl bg-[var(--color-line)]/60" />
        ))}
      </div>
      <p className="mt-6 text-sm text-[var(--color-ink-soft)]">Memuat halaman…</p>
    </main>
  );
}
