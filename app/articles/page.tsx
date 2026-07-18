import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

const studyGuides = [
  {
    href: "/background#authorship-date-and-purpose",
    eyebrow: "Historical setting",
    title: "Authorship, Date, and Purpose",
    summary: "Examine the evidence for Pauline authorship, the likely setting of the imprisonment, and the pastoral purpose of the letter."
  },
  {
    href: "/background#occasion-and-false-teaching",
    eyebrow: "Interpretive context",
    title: "The Teaching Paul Opposed",
    summary: "Trace the letter’s evidence for ritual pressure, ascetic discipline, visionary claims, and misplaced attention to spiritual powers."
  },
  {
    href: "/background#supremacy-and-sufficiency-of-christ",
    eyebrow: "Christology",
    title: "The Supremacy and Sufficiency of Christ",
    summary: "Study why Colossians presents Christ as Creator, Reconciler, Head of the church, and the believer’s complete sufficiency."
  },
  {
    href: "/background#theology-and-enduring-significance",
    eyebrow: "Theology and life",
    title: "Major Themes and Enduring Significance",
    summary: "Connect union with Christ, salvation by grace, moral renewal, Christian community, prayer, witness, judgment, and resurrection hope."
  }
] as const;

export const metadata: Metadata = {
  title: "Colossians Study Guides",
  description: "Guided studies exploring the setting, message, and theology of Colossians."
};

export default function ArticlesPage() {
  return (
    <main className="articles-page">
      <section className="articles-hero" aria-labelledby="articles-title">
        <div className="articles-hero-copy">
          <h1 id="articles-title">Study Guides</h1>
          <p>
            Follow focused pathways through the historical setting, message, and theology of Paul&apos;s letter to the Colossians.
          </p>
        </div>
      </section>

      <section className="articles-shell" aria-label="Colossians study guides">
        <div className="articles-grid">
          {studyGuides.map((guide) => (
            <Link key={guide.href} href={guide.href} className="article-list-card">
              <span className="article-list-icon" aria-hidden="true">
                <FileText className="h-5 w-5" />
              </span>
              <span className="article-list-eyebrow">{guide.eyebrow}</span>
              <strong>{guide.title}</strong>
              <span>{guide.summary}</span>
              <em>
                Open guide
                <ArrowRight className="h-4 w-4" />
              </em>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
