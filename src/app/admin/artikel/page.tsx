import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tanggal } from "@/lib/format";
import { createArticleAction, deleteArticleAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Artikel" };

export default async function AdminArticlesPage() {
  await requireAdmin();

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  const inputClass =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-brand)]";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Artikel</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {articles.length} tulisan · konten blog di website publik.
        </p>
      </header>

      <details className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-brand-dark)]">
          + Tulis artikel baru
        </summary>

        <form action={createArticleAction} className="mt-5 space-y-4 border-t border-[var(--color-line)] pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Judul</span>
              <input name="title" required className={inputClass} />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Slug</span>
              <input name="slug" required placeholder="judul-artikel" className={inputClass} />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Ringkasan</span>
            <textarea name="excerpt" rows={2} required className={inputClass} />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Isi (pisahkan paragraf dengan baris kosong)</span>
            <textarea name="content" rows={6} required className={inputClass} />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Terbitkan
          </label>

          <button className="rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]">
            Simpan artikel
          </button>
        </form>
      </details>

      <section className="divide-y divide-[var(--color-line)] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        {articles.map((article) => (
          <div key={article.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{article.title}</p>
              <p className="truncate text-xs text-[var(--color-ink-soft)]">
                {tanggal(article.createdAt)} · {article.published ? "terbit" : "draft"}
              </p>
            </div>
            <form action={deleteArticleAction.bind(null, article.id)}>
              <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                Hapus
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
