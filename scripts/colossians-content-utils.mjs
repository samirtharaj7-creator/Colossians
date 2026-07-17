import { readFileSync } from "node:fs";

export const EXPECTED_VERSE_COUNTS = [29, 23, 25, 18];

export function loadColossians() {
  return EXPECTED_VERSE_COUNTS.map((expectedVerses, index) => {
    const chapterNumber = index + 1;
    const path = `content/colossians/chapter-${String(chapterNumber).padStart(2, "0")}.json`;
    const content = JSON.parse(readFileSync(path, "utf8"));
    return { chapterNumber, expectedVerses, path, content };
  });
}

export function commentaryFor(reference, chapters) {
  for (const { content } of chapters) {
    const verse = content.verses.find((entry) => entry.verse === reference);
    if (verse) return verse.commentary.detailedExplanation;
  }
  throw new Error(`Missing commentary for ${reference}`);
}

export function collectPublicText(chapters) {
  const entries = [];
  const visit = (value, field) => {
    if (typeof value === "string") {
      if (value.trim()) entries.push({ field, value });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, `${field}[${index}]`));
      return;
    }
    if (!value || typeof value !== "object") return;

    for (const [key, child] of Object.entries(value)) {
      // These keys are removed before chapter content is serialized to the client.
      if (key === "sources" || key === "sourceAudit") continue;
      visit(child, field ? `${field}.${key}` : key);
    }
  };

  for (const { content, path } of chapters) visit(content, path);
  return entries;
}

export function collectStringLeaves(value, field = "") {
  const entries = [];
  const visit = (current, currentField) => {
    if (typeof current === "string") {
      if (current.trim()) entries.push({ field: currentField, value: current });
      return;
    }
    if (Array.isArray(current)) {
      current.forEach((entry, index) => visit(entry, `${currentField}[${index}]`));
      return;
    }
    if (!current || typeof current !== "object") return;
    for (const [key, child] of Object.entries(current)) {
      visit(child, currentField ? `${currentField}.${key}` : key);
    }
  };

  visit(value, field);
  return entries;
}
