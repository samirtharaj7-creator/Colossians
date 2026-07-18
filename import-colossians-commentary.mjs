import { readFileSync, writeFileSync } from "node:fs";

const EXPECTED_VERSE_COUNTS = [29, 23, 25, 18];
const chapter = Number(process.argv[2]);
const sourcePath = process.argv[3];

if (
  !Number.isInteger(chapter)
  || chapter < 1
  || chapter > EXPECTED_VERSE_COUNTS.length
  || !sourcePath
) {
  throw new Error("Usage: node import-colossians-commentary.mjs CHAPTER(1-4) /path/to/commentary.md");
}

const expectedVerses = EXPECTED_VERSE_COUNTS[chapter - 1];
const chapterFile = `content/colossians/chapter-${String(chapter).padStart(2, "0")}.json`;
const content = JSON.parse(readFileSync(chapterFile, "utf8"));
const source = readFileSync(sourcePath, "utf8");
const scriptureHeadingPattern = /^(?:#{1,6}\s+)?((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+):(\d+)\s*$/u;
const commentaryByVerse = new Map();
let currentVerse = null;
let currentLines = [];

function saveCurrentVerse() {
  if (currentVerse === null) return;
  const commentary = currentLines.join("\n").trim().replace(/\n{3,}/g, "\n\n");
  if (!commentary) throw new Error(`Colossians ${chapter}:${currentVerse} has no commentary.`);
  if (commentaryByVerse.has(currentVerse)) {
    throw new Error(`Duplicate commentary heading for Colossians ${chapter}:${currentVerse}.`);
  }
  commentaryByVerse.set(currentVerse, commentary);
}

for (const [lineIndex, line] of source.split(/\r?\n/).entries()) {
  const heading = line.match(scriptureHeadingPattern);
  if (!heading) {
    if (currentVerse !== null) currentLines.push(line);
    continue;
  }

  const [, bookName, sourceChapterText, verseText] = heading;
  const sourceChapter = Number(sourceChapterText);
  const verseNumber = Number(verseText);
  if (bookName.toLocaleLowerCase("en-US") !== "colossians") {
    throw new Error(`Line ${lineIndex + 1}: expected a Colossians heading, found ${bookName} ${sourceChapter}:${verseNumber}.`);
  }
  if (sourceChapter !== chapter) {
    throw new Error(`Line ${lineIndex + 1}: expected Colossians ${chapter}, found Colossians ${sourceChapter}:${verseNumber}.`);
  }
  if (verseNumber < 1 || verseNumber > expectedVerses) {
    throw new Error(`Line ${lineIndex + 1}: Colossians ${chapter} has no verse ${verseNumber}.`);
  }

  saveCurrentVerse();
  currentVerse = verseNumber;
  currentLines = [];
}
saveCurrentVerse();

const missingVerses = Array.from(
  { length: expectedVerses },
  (_, index) => index + 1,
).filter((verseNumber) => !commentaryByVerse.has(verseNumber));
if (missingVerses.length) {
  throw new Error(
    `Missing commentary sections for Colossians ${chapter}:${missingVerses.join(", ")}.`,
  );
}

if (content.chapterNumber !== chapter) {
  throw new Error(`${chapterFile} declares chapter ${content.chapterNumber}; expected ${chapter}.`);
}
if (!Array.isArray(content.verses) || content.verses.length !== expectedVerses) {
  throw new Error(`${chapterFile} must contain exactly ${expectedVerses} verse records.`);
}

content.verses.forEach((verse, index) => {
  const verseNumber = index + 1;
  const expectedReference = `Colossians ${chapter}:${verseNumber}`;
  if (verse.verse !== expectedReference) {
    throw new Error(`${chapterFile} contains ${verse.verse}; expected ${expectedReference}.`);
  }
  if (!verse.commentary || typeof verse.commentary !== "object") {
    throw new Error(`${expectedReference} has no commentary record.`);
  }
});

content.verses.forEach((verse, index) => {
  verse.commentary.detailedExplanation = commentaryByVerse.get(index + 1);
  verse.reviewStatus = "needs-source-review";
});

writeFileSync(chapterFile, `${JSON.stringify(content, null, 2)}\n`);
console.log(`Imported commentary for Colossians ${chapter}:1-${expectedVerses}.`);
