import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function ArticleListPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Catatan belajar</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Tulisan pendek soal belajar, karier, dan hal teknis yang sering ditanyakan.
        </p>

        <div className="mt-10 space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/artikel/${article.slug}`}
              className="block rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:border-[var(--color-brand)]"
            >
              <p className="text-xs text-[var(--color-ink-soft)]">
                {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(article.createdAt)}
              </p>
              <h2 className="mt-2 text-lg font-medium">{article.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {article.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export async function generateMetadata() {
  return { title: "Artikel" };
}
