import { collectPublicText, loadColossians } from "./colossians-content-utils.mjs";

const chapters = loadColossians();
const entries = collectPublicText(chapters).filter(({ field }) => field.includes("detailedExplanation") || field.includes("wordNotes"));
const exactNgramSize = 20;
const contentNgramSize = 16;
const exactSeen = new Map();
const contentSeen = new Map();
const exactDuplicates = [];
const contentDuplicates = [];
const stopwords = new Set(["a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "for", "from", "had", "has", "have", "he", "her", "his", "in", "is", "it", "its", "not", "of", "on", "or", "our", "that", "the", "their", "them", "they", "this", "to", "was", "were", "which", "who", "with"]);

function words(value) {
  return value
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function contentWords(value) {
  return words(value).filter((word) => !stopwords.has(word));
}

function shingles(tokens, size) {
  const values = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) values.add(tokens.slice(index, index + size).join(" "));
  return values;
}

const kjvExact = new Set();
const kjvContent = new Set();
for (const { content } of chapters) {
  for (const verse of content.verses) {
    for (const phrase of shingles(words(verse.bibleText), exactNgramSize)) kjvExact.add(phrase);
    for (const phrase of shingles(contentWords(verse.bibleText), contentNgramSize)) kjvContent.add(phrase);
  }
}

for (const { field, value } of entries) {
  for (const phrase of shingles(words(value), exactNgramSize)) {
    if (kjvExact.has(phrase)) continue;
    const previous = exactSeen.get(phrase);
    if (previous && previous !== field) exactDuplicates.push({ phrase, first: previous, second: field });
    else exactSeen.set(phrase, field);
  }
  for (const phrase of shingles(contentWords(value), contentNgramSize)) {
    if (kjvContent.has(phrase)) continue;
    const previous = contentSeen.get(phrase);
    if (previous && previous !== field) contentDuplicates.push({ phrase, first: previous, second: field });
    else contentSeen.set(phrase, field);
  }
}

if (exactDuplicates.length || contentDuplicates.length) {
  const sample = [...exactDuplicates, ...contentDuplicates].slice(0, 16).map(({ phrase, first, second }) => `- ${first} and ${second}: “${phrase}”`).join("\n");
  console.error(`Copying audit failed: found ${exactDuplicates.length} repeated ${exactNgramSize}-word sequence(s) and ${contentDuplicates.length} normalized ${contentNgramSize}-content-word sequence(s).\n${sample}`);
  process.exit(1);
}

console.log(`Copying audit passed: ${entries.length} commentary/word-note fields contain no repeated ${exactNgramSize}-word or normalized ${contentNgramSize}-content-word sequences outside KJV overlap.`);
