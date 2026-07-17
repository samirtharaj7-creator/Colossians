import type { Metadata } from "next";
import { getBackgroundContent, type BackgroundBlock } from "@/lib/background";
import { preload } from "react-dom";

export const metadata: Metadata = {
  title: "Introduction to the Book of Colossians",
  description: "Explore the authorship, date, audience, literary form, biblical world, structure, and purpose of Colossians."
};

function BackgroundBlockView({ block, sectionTitle }: { block: BackgroundBlock; sectionTitle: string }) {
  if (block.type === "paragraph") return <p>{block.text}</p>;
  if (block.type === "heading") return <h3 className="background-group-heading">{block.title}</h3>;
  if (block.type === "subsection") {
    return (
      <section className="background-subsection">
        <h3>{block.title}</h3>
        {block.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
    );
  }
  return (
    <div className="background-table-wrap" role="region" aria-label={`${sectionTitle}: ${block.title}`} tabIndex={0}>
      <table className="background-data-table">
        <caption className="sr-only">{block.title}</caption>
        <thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row[0]}`}>{row.map((cell, index) => <td key={`${index}-${cell.slice(0, 24)}`}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BackgroundPage() {
  preload("/assets/colossians-hero-engraving.webp?v=mbe-20260715-1", {
    as: "image",
    type: "image/webp",
    fetchPriority: "high"
  });

  const content = getBackgroundContent();
  return (
    <main className="background-page colossians-background-page">
      <section className="background-hero" aria-labelledby="background-title">
        <div className="background-hero-copy">
          <h1 id="background-title" aria-label={content.title}>
            <span className="background-title-prefix">Introduction to the Book of</span>
            <span className="background-title-book">Colossians</span>
          </h1>
          <p className="background-subtitle">{content.subtitle}</p>
        </div>
      </section>
      <section className="background-section-nav" aria-label="Introduction page sections">
        <div className="background-section-nav-scroll"><nav>
          {content.sections.map((section, index) => (
            <a key={section.id} href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>
          ))}
        </nav></div>
      </section>
      <section className="background-shell" aria-label="Introduction to Colossians">
        <div className="background-study">
          <div className="background-section-list">
            {content.sections.map((section, index) => (
              <section key={section.id} id={section.id} className="background-section">
                <span className="background-section-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="background-section-body">
                  <h2>{section.title}</h2>
                  {section.blocks.map((block, blockIndex) => <BackgroundBlockView key={`${section.id}-${block.type}-${blockIndex}`} block={block} sectionTitle={section.title} />)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
