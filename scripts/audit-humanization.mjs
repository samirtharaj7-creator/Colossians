import { loadColossians } from "./colossians-content-utils.mjs";

const chapters = loadColossians();
const notes = chapters.flatMap(({ chapterNumber, content }) => content.verses.map((verse) => ({
  chapterNumber,
  reference: verse.verse,
  text: verse.commentary.detailedExplanation
})));

const words = (value) => value.trim().split(/\s+/).filter(Boolean);
const sentences = (value) => (value.match(/[^.!?]+[.!?]+(?:[”’"')\]]*)|[^.!?]+$/g) || []).map((sentence) => sentence.trim()).filter(Boolean);
const paragraphs = notes.flatMap((note) => note.text.split(/\n\n+/).map((paragraph) => ({ reference: note.reference, paragraph })));
const noteMetrics = notes.map((note) => ({
  ...note,
  wordCount: words(note.text).length,
  paragraphCount: note.text.split(/\n\n+/).length
}));

function countPattern(pattern) {
  return notes.reduce((total, note) => total + (note.text.match(pattern) || []).length, 0);
}

const formulas = {
  doesNot: countPattern(/\bdoes not\b/gi),
  notBut: countPattern(/\bnot\b[^.!?]{0,140}\bbut\b/gi),
  thisDoesNotMean: countPattern(/\bThis does not mean\b/gi),
  atTheSameTime: countPattern(/\bAt the same time\b/gi),
  thisVerse: countPattern(/\bThis verse\b/gi),
  theVerseAlso: countPattern(/\bThe verse also\b/gi),
  theVerseTherefore: countPattern(/\bThe verse therefore\b/gi)
};
const disclaimerPattern = /\b(?:does not mean|does not say|must not|should not|cannot be used|never be used|is not permission|does not authorize)\b/gi;
const genericEndingPattern = /\b(?:for believers,?|for the church,?|christian maturity|this verse (?:calls|invites)|the verse (?:calls|invites)|the proper response)\b/i;
const stockOpeners = ["This verse", "The verse", "This statement", "The statement", "The warning", "The command", "The words"];
const stockOpenerCounts = Object.fromEntries(stockOpeners.map((opener) => [opener, notes.filter((note) => note.text.trim().toLowerCase().startsWith(opener.toLowerCase())).length]));
const fillerWords = ["deeply", "genuine", "quietly", "tenderness", "beautifully"];
const fillerCounts = Object.fromEntries(fillerWords.map((word) => [word, countPattern(new RegExp(`\\b${word}\\b`, "gi"))]));
const genericEndingNotes = notes.filter((note) => genericEndingPattern.test(note.text.split(/\n\n+/).at(-1) || ""));
const denseDisclaimerNotes = notes.filter((note) => (note.text.match(disclaimerPattern) || []).length >= 5);

function ngrams(value, size = 4) {
  const tokens = value.toLowerCase().match(/[a-z0-9]+/g) || [];
  const result = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) result.add(tokens.slice(index, index + size).join(" "));
  return result;
}

function jaccard(left, right) {
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  const smaller = left.size <= right.size ? left : right;
  const larger = left.size <= right.size ? right : left;
  for (const value of smaller) if (larger.has(value)) overlap += 1;
  return overlap / (left.size + right.size - overlap);
}

const adjacentSimilarity = [];
for (const { chapterNumber, content } of chapters) {
  for (let index = 1; index < content.verses.length; index += 1) {
    const previous = content.verses[index - 1];
    const current = content.verses[index];
    const score = jaccard(ngrams(previous.commentary.detailedExplanation), ngrams(current.commentary.detailedExplanation));
    if (score >= 0.42) adjacentSimilarity.push({ chapterNumber, first: previous.verse, second: current.verse, score: Number(score.toFixed(3)) });
  }
}

const repeatedParagraphs = new Map();
for (const { reference, paragraph } of paragraphs) {
  const normalized = paragraph.toLowerCase().replace(/\s+/g, " ").trim();
  if (normalized.length < 100) continue;
  const references = repeatedParagraphs.get(normalized) || [];
  references.push(reference);
  repeatedParagraphs.set(normalized, references);
}
const duplicateParagraphs = [...repeatedParagraphs.entries()].filter(([, references]) => references.length > 1);

const repeatedSentences = new Map();
for (const note of notes) {
  for (const sentence of sentences(note.text)) {
    const normalized = sentence.toLowerCase().replace(/\s+/g, " ").trim();
    if (words(normalized).length < 12) continue;
    const references = repeatedSentences.get(normalized) || [];
    references.push(note.reference);
    repeatedSentences.set(normalized, references);
  }
}
const duplicateSentences = [...repeatedSentences.entries()].filter(([, references]) => references.length > 1);

const bandCounts = new Map();
for (const note of noteMetrics) {
  const start = Math.floor(note.wordCount / 25) * 25;
  const label = `${start}-${start + 24}`;
  bandCounts.set(label, (bandCounts.get(label) || 0) + 1);
}
const densestBand = [...bandCounts.entries()].sort((a, b) => b[1] - a[1])[0];

function coefficientOfVariation(values) {
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

const chapterMetrics = chapters.map(({ chapterNumber }) => {
  const values = noteMetrics.filter((note) => note.chapterNumber === chapterNumber).map((note) => note.wordCount);
  return {
    chapterNumber,
    notes: values.length,
    averageWords: Math.round(values.reduce((total, value) => total + value, 0) / values.length),
    minimumWords: Math.min(...values),
    maximumWords: Math.max(...values),
    coefficientOfVariation: Number(coefficientOfVariation(values).toFixed(3))
  };
});

const threeOrFourSentenceParagraphs = paragraphs.filter(({ paragraph }) => {
  const count = sentences(paragraph).length;
  return count === 3 || count === 4;
}).length;
const concentratedNotes = noteMetrics.filter((note) => note.wordCount >= 350 && note.wordCount <= 450).length;
const failures = [];

if (concentratedNotes / notes.length > 0.75) failures.push(`350–450-word concentration remains ${(100 * concentratedNotes / notes.length).toFixed(1)}%; expected at most 75%`);
if (densestBand[1] / notes.length > 0.3) failures.push(`densest 25-word band ${densestBand[0]} contains ${(100 * densestBand[1] / notes.length).toFixed(1)}%; expected at most 30%`);
if (threeOrFourSentenceParagraphs / paragraphs.length > 0.65) failures.push(`three/four-sentence paragraphs remain ${(100 * threeOrFourSentenceParagraphs / paragraphs.length).toFixed(1)}%; expected at most 65%`);
if (formulas.doesNot > 450) failures.push(`“does not” appears ${formulas.doesNot} times; expected at most 450`);
if (formulas.notBut > 160) failures.push(`not-X-but-Y appears ${formulas.notBut} times; expected at most 160`);
if (formulas.thisDoesNotMean > 20) failures.push(`“This does not mean” appears ${formulas.thisDoesNotMean} times; expected at most 20`);
if (formulas.atTheSameTime > 15) failures.push(`“At the same time” appears ${formulas.atTheSameTime} times; expected at most 15`);
if (formulas.thisVerse > 25) failures.push(`“This verse” appears ${formulas.thisVerse} times; expected at most 25`);
if (duplicateParagraphs.length) failures.push(`${duplicateParagraphs.length} substantive paragraph(s) repeat across notes`);
if (duplicateSentences.length > 4) failures.push(`${duplicateSentences.length} long sentence(s) repeat across notes; expected at most 4`);
if (genericEndingNotes.length > 35) failures.push(`${genericEndingNotes.length} notes retain generic application endings; expected at most 35`);
if (denseDisclaimerNotes.length > 15) failures.push(`${denseDisclaimerNotes.length} notes contain five or more disclaimer frames; expected at most 15`);
if (adjacentSimilarity.some((item) => item.score >= 0.62)) failures.push(`${adjacentSimilarity.filter((item) => item.score >= 0.62).length} adjacent note pair(s) retain severe phrase-level similarity`);

console.log(JSON.stringify({
  notes: notes.length,
  totalWords: noteMetrics.reduce((total, note) => total + note.wordCount, 0),
  wordRange: [Math.min(...noteMetrics.map((note) => note.wordCount)), Math.max(...noteMetrics.map((note) => note.wordCount))],
  concentrated350To450: { count: concentratedNotes, percent: Number((100 * concentratedNotes / notes.length).toFixed(1)) },
  densest25WordBand: { band: densestBand[0], count: densestBand[1], percent: Number((100 * densestBand[1] / notes.length).toFixed(1)) },
  threeOrFourSentenceParagraphs: { count: threeOrFourSentenceParagraphs, total: paragraphs.length, percent: Number((100 * threeOrFourSentenceParagraphs / paragraphs.length).toFixed(1)) },
  formulas,
  stockOpenerCounts,
  genericEndingNotes: genericEndingNotes.length,
  denseDisclaimerNotes: denseDisclaimerNotes.length,
  fillerCounts,
  adjacentSimilarityFlags: adjacentSimilarity,
  duplicateParagraphs: duplicateParagraphs.length,
  duplicateLongSentences: duplicateSentences.length,
  chapterMetrics,
  lowVariationChapters: chapterMetrics.filter((chapter) => chapter.notes >= 10 && chapter.coefficientOfVariation < 0.075).map((chapter) => chapter.chapterNumber)
}, null, 2));

if (failures.length) {
  console.error(`Humanization audit failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}

console.log("Humanization audit passed.");
