import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article || !article.published) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <Link href="/artikel" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
          ← Semua artikel
        </Link>

        <article className="mt-6">
          <p className="text-xs text-[var(--color-ink-soft)]">
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(article.createdAt)}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
            {article.excerpt}
          </p>
          <div className="prose-basic mt-8 text-[15px]">
            {article.content.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
