import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ChapterContentSchema, type ChapterContent } from "@/lib/schemas";
import { padChapter } from "@/lib/utils";

export const COLOSSIANS = {
  slug: "colossians",
  name: "Colossians",
  chapterCount: 4,
  verseCounts: [29, 23, 25, 18]
} as const;

export type ChapterAdjacency = { previous: number | null; next: number | null };

export function getColossiansStaticParams() {
  return Array.from({ length: COLOSSIANS.chapterCount }, (_, index) => ({ chapter: String(index + 1) }));
}

export function parseColossiansChapterNumber(chapter: number | string): number | null {
  const rawChapter = String(chapter);
  if (!/^[1-9]\d*$/.test(rawChapter)) return null;
  const chapterNumber = Number(rawChapter);
  if (!Number.isSafeInteger(chapterNumber) || chapterNumber > COLOSSIANS.chapterCount) return null;
  return chapterNumber;
}

export function getColossiansChapter(chapter: number | string): ChapterContent | null {
  const chapterNumber = parseColossiansChapterNumber(chapter);
  if (chapterNumber === null) return null;
  const path = join(process.cwd(), "content", COLOSSIANS.slug, `chapter-${padChapter(chapterNumber)}.json`);
  if (!existsSync(path)) return null;
  const parsed = ChapterContentSchema.parse(JSON.parse(readFileSync(path, "utf8")));
  const expectedVerseCount = COLOSSIANS.verseCounts[chapterNumber - 1];
  if (parsed.chapterNumber !== chapterNumber || parsed.verses.length !== expectedVerseCount) {
    throw new Error(`Colossians ${chapterNumber} content structure is invalid.`);
  }
  parsed.verses.forEach((verse, index) => {
    if (verse.verse !== `Colossians ${chapterNumber}:${index + 1}`) {
      throw new Error(`Colossians ${chapterNumber} contains an invalid verse slot.`);
    }
  });
  return parsed;
}

export function getColossiansChapterAdjacency(chapter: number | string): ChapterAdjacency | null {
  const chapterNumber = parseColossiansChapterNumber(chapter);
  if (chapterNumber === null) return null;
  return {
    previous: chapterNumber > 1 ? chapterNumber - 1 : null,
    next: chapterNumber < COLOSSIANS.chapterCount ? chapterNumber + 1 : null
  };
}
