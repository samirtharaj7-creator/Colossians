import { loadColossians } from "./colossians-content-utils.mjs";
import {
  SCRIPTURE_VERSE_COUNTS,
  SINGLE_CHAPTER_BOOKS,
  normalizeScriptureBookName
} from "./scripture-canon.mjs";

const chapters = loadColossians();
const errors = [];
let verseTotal = 0;

const emptyVerseFields = [
  "explanation",
  "historicalBackground",
  "literaryContext",
  "theologicalInsight",
  "structuralNotes",
  "relatedConnection",
  "application"
];
const emptyCommentaryFields = [
  "exegesis",
  "historicalBackground",
  "technicalNotes",
  "theologicalInsight",
  "structuralNotes",
  "otherCommentaryInsights",
  "application"
];
const allowedReviewStatuses = new Set(["verified-seed"]);
const expectedChapterTitles = [
  "The Supremacy of Christ",
  "Complete in Christ",
  "The New Life in Christ",
  "Prayer, Witness, and Final Greetings"
];
const placeholderPattern = /\b(?:tbd|todo|placeholder|lorem ipsum|coming soon|add (?:your|the) (?:own )?(?:notes|commentary))\b/i;
let crossReferenceTotal = 0;
let versesWithCrossReferences = 0;

function validateScriptureReference(citation, context) {
  if (typeof citation !== "string" || !citation.trim()) {
    errors.push(`${context}: reference must be a nonblank string`);
    return null;
  }

  const match = citation.trim().match(/^((?:[1-3] )?[A-Za-z]+(?: [A-Za-z]+)*) (?:(\d+):)?(\d+)(?:[-–—](\d+))?$/u);
  if (!match) {
    errors.push(`${context}: invalid Scripture reference ${citation}`);
    return null;
  }

  const [, rawBookName, chapterText, startText, endText] = match;
  const bookName = normalizeScriptureBookName(rawBookName);
  const verseCounts = SCRIPTURE_VERSE_COUNTS[bookName];
  if (!verseCounts) {
    errors.push(`${context}: unrecognized biblical book ${rawBookName}`);
    return null;
  }
  if (!chapterText && !SINGLE_CHAPTER_BOOKS.has(bookName)) {
    errors.push(`${context}: chapter is required for ${rawBookName}`);
    return null;
  }
  const chapter = chapterText ? Number(chapterText) : 1;
  const startVerse = Number(startText);
  const endVerse = Number(endText ?? startText);
  if (!Number.isSafeInteger(chapter) || chapter < 1 || chapter > verseCounts.length) {
    errors.push(`${context}: ${bookName} has no chapter ${chapter}`);
    return null;
  }
  if (!Number.isSafeInteger(startVerse) || startVerse < 1) errors.push(`${context}: starting verse must be positive`);
  if (!Number.isSafeInteger(endVerse) || endVerse < startVerse) errors.push(`${context}: verse range is reversed`);
  const chapterVerseCount = verseCounts[chapter - 1];
  if (startVerse > chapterVerseCount || endVerse > chapterVerseCount) {
    errors.push(`${context}: reference exceeds ${bookName} ${chapter}:${chapterVerseCount}`);
  }

  return { bookName, chapter, startVerse, endVerse };
}

function validatePrivateFieldsAreEmpty(value, field, errors) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validatePrivateFieldsAreEmpty(entry, `${field}[${index}]`, errors));
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    const childField = `${field}.${key}`;
    if (key === "sources" || key === "reviewFlags") {
      if (!Array.isArray(child)) errors.push(`${childField} must be an array`);
      else if (child.length) errors.push(`${childField} must remain empty`);
      continue;
    }
    if (key === "sourceAudit") {
      if (!child || typeof child !== "object" || Array.isArray(child)) {
        errors.push(`${childField} must be an object of empty arrays`);
      } else {
        for (const [category, values] of Object.entries(child)) {
          if (!Array.isArray(values)) errors.push(`${childField}.${category} must be an array`);
          else if (values.length) errors.push(`${childField}.${category} must remain empty`);
        }
      }
      continue;
    }
    validatePrivateFieldsAreEmpty(child, childField, errors);
  }
}

for (const { chapterNumber, expectedVerses, path, content } of chapters) {
  if (content.chapterNumber !== chapterNumber) errors.push(`${path}: chapterNumber must be ${chapterNumber}`);
  if (!Array.isArray(content.verses)) {
    errors.push(`${path}: verses must be an array`);
    continue;
  }
  if (content.verses.length !== expectedVerses) errors.push(`${path}: expected ${expectedVerses} verses, found ${content.verses.length}`);
  if (content.title !== expectedChapterTitles[chapterNumber - 1]) {
    errors.push(`${path}: title must be ${JSON.stringify(expectedChapterTitles[chapterNumber - 1])}; found ${JSON.stringify(content.title)}`);
  }

  if (!Array.isArray(content.outline)) {
    errors.push(`${path}: outline must be an array`);
  } else {
    content.outline.forEach((section, outlineIndex) => {
      const range = section?.range?.match(/^(\d+):(\d+)(?:[-–—](\d+))?$/u);
      if (!range) {
        errors.push(`${path}: outline[${outlineIndex}].range is invalid`);
        return;
      }
      const [, outlineChapterText, startText, endText] = range;
      const outlineChapter = Number(outlineChapterText);
      const startVerse = Number(startText);
      const endVerse = Number(endText ?? startText);
      if (outlineChapter !== chapterNumber || startVerse < 1 || endVerse < startVerse || endVerse > expectedVerses) {
        errors.push(`${path}: outline[${outlineIndex}].range falls outside Colossians ${chapterNumber}:1-${expectedVerses}`);
      }
      if (!section.title?.trim() || !section.summary?.trim()) {
        errors.push(`${path}: outline[${outlineIndex}] must contain a title and summary`);
      }
    });
  }

  verseTotal += content.verses.length;
  content.verses.forEach((verse, index) => {
    const expectedReference = `Colossians ${chapterNumber}:${index + 1}`;
    if (verse.verse !== expectedReference) errors.push(`${path}: found ${verse.verse}; expected ${expectedReference}`);
    if (!verse.bibleText?.trim()) errors.push(`${expectedReference}: missing KJV text`);
    else if (placeholderPattern.test(verse.bibleText)) errors.push(`${expectedReference}: KJV text contains placeholder language`);
    const detailedExplanation = verse.commentary?.detailedExplanation?.trim() ?? "";
    if (!detailedExplanation) errors.push(`${expectedReference}: missing detailed commentary`);
    else {
      const wordCount = detailedExplanation.split(/\s+/u).filter(Boolean).length;
      if (wordCount < 100) errors.push(`${expectedReference}: detailed commentary is not substantive (${wordCount} words; expected at least 100)`);
      if (placeholderPattern.test(detailedExplanation)) errors.push(`${expectedReference}: detailed commentary contains placeholder language`);
    }
    if (!allowedReviewStatuses.has(verse.reviewStatus)) {
      errors.push(`${expectedReference}: reviewStatus must be verified-seed, found ${verse.reviewStatus}`);
    }

    for (const field of emptyVerseFields) {
      if (verse[field]?.trim()) errors.push(`${expectedReference}: public prose must remain in commentary.detailedExplanation; ${field} is populated`);
    }
    for (const field of emptyCommentaryFields) {
      if (verse.commentary[field]?.trim()) errors.push(`${expectedReference}: commentary.${field} must remain empty`);
    }

    const crossReferences = Array.isArray(verse.crossReferences) ? verse.crossReferences : [];
    if (!Array.isArray(verse.crossReferences)) {
      errors.push(`${expectedReference}: crossReferences must be an array`);
    } else {
      if (crossReferences.length > 0) versesWithCrossReferences += 1;
    }
    crossReferenceTotal += crossReferences.length;
    const seenCrossReferences = new Set();
    crossReferences.forEach((citation, referenceIndex) => {
      const context = `${expectedReference}: crossReferences[${referenceIndex}]`;
      const parsed = validateScriptureReference(citation, context);
      if (typeof citation !== "string") return;
      const normalized = citation.trim().toLocaleLowerCase().replace(/[–—]/gu, "-");
      if (seenCrossReferences.has(normalized)) errors.push(`${expectedReference}: duplicate cross reference ${citation}`);
      seenCrossReferences.add(normalized);
      if (
        parsed?.bookName === "Colossians"
        && parsed.chapter === chapterNumber
        && parsed.startVerse <= index + 1
        && parsed.endVerse >= index + 1
      ) {
        errors.push(`${expectedReference}: cross reference must not cite its own verse or a range containing it (${citation})`);
      }
    });

    if (!Array.isArray(verse.wordNotes)) {
      errors.push(`${expectedReference}: wordNotes must be an array`);
      return;
    }
    if (verse.wordNotes.length > 2) errors.push(`${expectedReference}: wordNotes may contain at most two entries`);
    const wordNoteTerms = new Set();
    verse.wordNotes.forEach((note, noteIndex) => {
      const label = `${expectedReference}: wordNotes[${noteIndex}]`;
      if (!note.term?.trim()) errors.push(`${label}.term must be populated`);
      else if (wordNoteTerms.has(note.term.trim())) errors.push(`${label}.term duplicates another Word / Phrase Note`);
      else wordNoteTerms.add(note.term.trim());
      if (!note.explanation?.trim() || note.explanation.trim().length < 40) errors.push(`${label}.explanation must contain substantive contextual explanation`);
      const hasGreek = /[\u0370-\u03ff\u1f00-\u1fff]/u.test(note.term);
      if (hasGreek && !/[([](?=[^)\]]*\p{Script=Latin})[\p{Script=Latin}\p{Mark}'’ .,/;:·…–—-]+[)\]]/u.test(note.term)) {
        errors.push(`${label}.term must pair Greek text with a transliteration`);
      }
      const scriptureReferences = new Set();
      if (!Array.isArray(note.scriptureReferences)) {
        errors.push(`${label}.scriptureReferences must be an array`);
        return;
      }
      for (const reference of note.scriptureReferences) {
        validateScriptureReference(reference, `${label}.scriptureReferences`);
        if (scriptureReferences.has(reference)) errors.push(`${label}.scriptureReferences contains a duplicate reference: ${reference}`);
        scriptureReferences.add(reference);
      }
    });
  });

  validatePrivateFieldsAreEmpty(content, path, errors);
}

if (verseTotal !== 95) errors.push(`Expected 95 total verses, found ${verseTotal}`);

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(
  `Content validation passed: ${chapters.length} chapters, ${verseTotal} complete KJV/commentary records, `
  + `and ${crossReferenceTotal} selective cross references across ${versesWithCrossReferences} verses.`
);
