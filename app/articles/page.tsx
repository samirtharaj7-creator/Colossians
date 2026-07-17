import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { colossiansArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Colossians Articles",
  description: "Focused studies exploring the setting, message, and theology of Colossians."
};

export default function ArticlesPage() {
  return (
    <main className="articles-page">
      <section className="articles-hero" aria-labelledby="articles-title">
        <div className="articles-hero-copy">
          <h1 id="articles-title">Articles</h1>
          <p>
            Focused studies on the historical setting, message, and theology of Paul&apos;s letter to the Colossians.
          </p>
        </div>
      </section>

      <section className="articles-shell" aria-label="Colossians article library">
        {colossiansArticles.length > 0 ? (
          <div className="articles-grid">
            {colossiansArticles.map((article) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="article-list-card">
                <span className="article-list-icon" aria-hidden="true">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="article-list-eyebrow">{article.eyebrow}</span>
                <strong>{article.title}</strong>
                <span>{article.summary}</span>
                <em>
                  Read article
                  <ArrowRight className="h-4 w-4" />
                </em>
              </Link>
            ))}
          </div>
        ) : (
          <div className="articles-empty">
            <span className="article-list-icon" aria-hidden="true">
              <FileText className="h-5 w-5" />
            </span>
            <p className="articles-kicker">Article library</p>
            <h2>Focused studies will appear here.</h2>
            <p>The page and article-card system are ready for the material you provide.</p>
            <Link href="/colossians/1">
              Read the commentary
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
