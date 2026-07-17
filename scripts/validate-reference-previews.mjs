import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadColossians } from "./colossians-content-utils.mjs";

const previewPath = resolve("lib/generated/kjv-reference-verses.json");
const previewVerses = JSON.parse(readFileSync(previewPath, "utf8"));
const singleChapterBooks = new Set(["Obadiah", "Philemon", "2 John", "3 John", "Jude"]);
const references = new Set();
const expectedKeys = new Set();
const errors = [];

for (const { content } of loadColossians()) {
  for (const verse of content.verses) {
    for (const reference of verse.crossReferences) references.add(reference.trim());
    for (const note of verse.wordNotes) {
      for (const reference of note.scriptureReferences) references.add(reference.trim());
    }
  }
}

for (const reference of references) {
  const parsed = parseReference(reference);
  if (!parsed) {
    errors.push(`${reference}: could not parse preview reference`);
    continue;
  }

  const previewEndVerse = Math.min(parsed.endVerse, parsed.startVerse + 2);
  for (let verse = parsed.startVerse; verse <= previewEndVerse; verse += 1) {
    const key = `${parsed.book} ${parsed.chapter}:${verse}`;
    expectedKeys.add(key);
    const text = previewVerses[key];
    if (typeof text !== "string" || !text.trim()) errors.push(`${reference}: missing KJV preview text for ${key}`);
  }
}

for (const key of Object.keys(previewVerses)) {
  if (!expectedKeys.has(key)) errors.push(`${key}: stale KJV preview entry`);
}

if (errors.length) {
  console.error(`Reference-preview validation failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(
  `Reference-preview validation passed: ${references.size} unique references backed by ${expectedKeys.size} KJV verse texts.`
);

function parseReference(reference) {
  const match = reference
    .trim()
    .match(/^((?:[1-3] )?[A-Za-z]+(?: [A-Za-z]+)*) (?:(\d+):)?(\d+)(?:[-–—](\d+))?$/u);
  if (!match) return null;

  const [, rawBook, rawChapter, rawStartVerse, rawEndVerse] = match;
  const book = rawBook === "Psalm"
    ? "Psalms"
    : rawBook === "Song of Songs"
      ? "Song of Solomon"
      : rawBook;
  const chapter = rawChapter ? Number(rawChapter) : singleChapterBooks.has(book) ? 1 : NaN;
  const startVerse = Number(rawStartVerse);
  const endVerse = Number(rawEndVerse ?? rawStartVerse);

  if (![chapter, startVerse, endVerse].every(Number.isSafeInteger)) return null;
  if (chapter < 1 || startVerse < 1 || endVerse < startVerse) return null;

  return { book, chapter, startVerse, endVerse };
}
