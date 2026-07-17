import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookChapterStrip } from "@/components/book-chapter-strip";
import { ChapterStudy, type PublicChapterContent } from "@/components/verse-accordion";
import { COLOSSIANS, getColossiansChapter, getColossiansChapterAdjacency, getColossiansStaticParams } from "@/lib/colossians";
import { getReferencePreviewsForChapter } from "@/lib/reference-previews";
import type { ChapterContent } from "@/lib/schemas";

export function generateStaticParams() {
  return getColossiansStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  const content = getColossiansChapter(chapter);
  if (!content) notFound();
  return { title: `Colossians ${content.chapterNumber}`, description: `Colossians ${content.chapterNumber} with the King James text and verse-by-verse commentary.` };
}

export default async function ColossiansChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  const content = getColossiansChapter(chapter);
  const adjacency = getColossiansChapterAdjacency(chapter);
  if (!content || !adjacency) notFound();
  const publicContent = withoutAuditSources(content);
  const referencePreviews = getReferencePreviewsForChapter(content);
  return (
    <main className="reader-page">
      <BookChapterStrip
        activeChapter={content.chapterNumber}
        bookSlug={COLOSSIANS.slug}
        bookName={COLOSSIANS.name}
        chapterCount={COLOSSIANS.chapterCount}
        verseCounts={COLOSSIANS.verseCounts}
      />
      <ChapterStudy
        chapter={publicContent}
        bookName={COLOSSIANS.name}
        referencePreviews={referencePreviews}
      />
      <nav className="reader-chapter-nav no-print" aria-label="Colossians adjacent chapters">
        {adjacency.previous ? <Link href={`/colossians/${adjacency.previous}`}><ChevronLeft className="h-4 w-4" />Colossians {adjacency.previous}</Link> : <span />}
        {adjacency.next ? <Link href={`/colossians/${adjacency.next}`}>Colossians {adjacency.next}<ChevronRight className="h-4 w-4" /></Link> : null}
      </nav>
    </main>
  );
}

function withoutAuditSources(chapter: ChapterContent): PublicChapterContent {
  return JSON.parse(JSON.stringify(chapter, (key, value) => key === "sources" || key === "sourceAudit" ? undefined : value)) as PublicChapterContent;
}
