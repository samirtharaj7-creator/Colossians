import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadColossians } from "./colossians-content-utils.mjs";

const corpusRoot = ".research/colossians-corpus/text";
const exactSize = 20;
const normalizedSize = 16;
const fuzzySize = 12;
const fuzzyMasks = [
  new Set([0, 4, 8]),
  new Set([1, 5, 9]),
  new Set([2, 6, 10]),
  new Set([3, 7, 11])
];
const stopwords = new Set(["a", "an", "and", "are", "as", "at", "be", "because", "been", "but", "by", "can", "does", "for", "from", "had", "has", "have", "he", "her", "him", "his", "i", "if", "in", "into", "is", "it", "its", "may", "not", "of", "on", "or", "our", "she", "so", "that", "the", "their", "them", "there", "these", "they", "this", "those", "to", "was", "we", "were", "which", "who", "will", "with", "would", "you", "your"]);

if (!existsSync(corpusRoot)) {
  console.log("Private-source overlap audit skipped: no Colossians corpus is available under .research/colossians-corpus/text.");
  process.exit(0);
}

const words = (value) => (value.toLowerCase().match(/[a-z0-9]+/g) || []);
const reduced = (word) => {
  if (word.length > 6 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  for (const suffix of ["ingly", "edly", "ing", "ed"]) if (word.length > suffix.length + 4 && word.endsWith(suffix)) return word.slice(0, -suffix.length);
  if (word.length > 6 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 5 && word.endsWith("s")) return word.slice(0, -1);
  return word;
};
const contentWords = (value) => words(value).filter((word) => !stopwords.has(word)).map(reduced);
const windows = (tokens, size) => {
  const values = [];
  for (let index = 0; index <= tokens.length - size; index += 1) values.push(tokens.slice(index, index + size).join(" "));
  return values;
};
const tokenWindows = (tokens, size) => {
  const values = [];
  for (let index = 0; index <= tokens.length - size; index += 1) values.push(tokens.slice(index, index + size));
  return values;
};
const fuzzySignatures = (tokens) => fuzzyMasks.map((mask, maskIndex) => (
  `${maskIndex}:${tokens.filter((_, index) => !mask.has(index)).join(" ")}`
));

const chapters = loadColossians();
const publicEntries = [];
const kjvExact = new Set();
const kjvNormalized = new Set();
const kjvFuzzy = new Set();
for (const { content } of chapters) {
  for (const verse of content.verses) {
    windows(words(verse.bibleText), exactSize).forEach((phrase) => kjvExact.add(phrase));
    windows(contentWords(verse.bibleText), normalizedSize).forEach((phrase) => kjvNormalized.add(phrase));
    tokenWindows(contentWords(verse.bibleText), fuzzySize).forEach((tokens) => {
      fuzzySignatures(tokens).forEach((signature) => kjvFuzzy.add(signature));
    });
    publicEntries.push({ reference: verse.verse, field: "commentary", value: verse.commentary.detailedExplanation });
    verse.wordNotes.forEach((note, index) => publicEntries.push({ reference: verse.verse, field: `wordNotes[${index}]`, value: note.explanation }));
  }
}

const generatedExact = new Map();
const generatedNormalized = new Map();
const generatedFuzzy = new Map();
for (const entry of publicEntries) {
  for (const phrase of windows(words(entry.value), exactSize)) {
    if (!kjvExact.has(phrase)) generatedExact.set(phrase, entry);
  }
  for (const phrase of windows(contentWords(entry.value), normalizedSize)) {
    if (!kjvNormalized.has(phrase)) generatedNormalized.set(phrase, entry);
  }
  for (const tokens of tokenWindows(contentWords(entry.value), fuzzySize)) {
    for (const signature of fuzzySignatures(tokens)) {
      if (!kjvFuzzy.has(signature)) generatedFuzzy.set(signature, { entry, tokens });
    }
  }
}

const matches = new Set();
for (const file of readdirSync(corpusRoot).filter((entry) => entry.endsWith(".txt"))) {
  const source = readFileSync(join(corpusRoot, file), "utf8");
  for (const phrase of windows(words(source), exactSize)) {
    const entry = generatedExact.get(phrase);
    if (entry) matches.add(`${entry.reference} ${entry.field}: ${exactSize}-word exact overlap with private source ${file}`);
  }
  for (const phrase of windows(contentWords(source), normalizedSize)) {
    const entry = generatedNormalized.get(phrase);
    if (entry) matches.add(`${entry.reference} ${entry.field}: ${normalizedSize}-content-word normalized overlap with private source ${file}`);
  }
  for (const sourceTokens of tokenWindows(contentWords(source), fuzzySize)) {
    for (const signature of fuzzySignatures(sourceTokens)) {
      const candidate = generatedFuzzy.get(signature);
      if (!candidate) continue;
      const matchingPositions = sourceTokens.reduce((total, token, index) => total + Number(token === candidate.tokens[index]), 0);
      if (matchingPositions >= 10) {
        matches.add(`${candidate.entry.reference} ${candidate.entry.field}: close ${fuzzySize}-content-word overlap (${matchingPositions}/${fuzzySize} aligned words) with private source ${file}`);
      }
    }
  }
}

if (matches.size) {
  const items = [...matches];
  console.error(`Private-source overlap audit found ${items.length} review item(s):\n${items.slice(0, 30).map((match) => `- ${match}`).join("\n")}`);
  process.exit(1);
}

console.log(`Private-source overlap audit passed: ${publicEntries.length} public fields checked against ${readdirSync(corpusRoot).filter((entry) => entry.endsWith(".txt")).length} private source text(s).`);
