import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const importerPath = join(repoRoot, "import-colossians-commentary.mjs");
const fixtureRoot = mkdtempSync(join(tmpdir(), "colossians-import-test-"));
const fixtureContentDir = join(fixtureRoot, "content", "colossians");
const fixtureChapterPath = join(fixtureContentDir, "chapter-01.json");
const sourcePath = join(fixtureRoot, "commentary.md");
const originalChapter = readFileSync(
  join(repoRoot, "content", "colossians", "chapter-01.json"),
  "utf8",
);

function sourceFor(bookName = "Colossians") {
  return Array.from(
    { length: 29 },
    (_, index) => `## ${bookName} 1:${index + 1}\nCommentary fixture for verse ${index + 1}.`,
  ).join("\n\n");
}

function runImporter(source) {
  writeFileSync(sourcePath, source);
  return spawnSync(process.execPath, [importerPath, "1", sourcePath], {
    cwd: fixtureRoot,
    encoding: "utf8",
  });
}

function restoreFixture(chapter = originalChapter) {
  writeFileSync(fixtureChapterPath, chapter);
}

try {
  mkdirSync(fixtureContentDir, { recursive: true });
  restoreFixture();

  const validResult = runImporter(sourceFor());
  assert.equal(validResult.status, 0, validResult.stderr);
  const imported = JSON.parse(readFileSync(fixtureChapterPath, "utf8"));
  const expected = JSON.parse(originalChapter);
  expected.verses.forEach((verse, index) => {
    verse.commentary.detailedExplanation = `Commentary fixture for verse ${index + 1}.`;
    verse.reviewStatus = "needs-source-review";
  });
  assert.deepEqual(imported, expected, "import changed fields other than commentary and review status");

  restoreFixture();
  const wrongBookResult = runImporter(sourceFor("Hebrews"));
  assert.notEqual(wrongBookResult.status, 0, "foreign-book headings were accepted");
  assert.match(wrongBookResult.stderr, /expected a Colossians heading, found Hebrews 1:1/);
  assert.equal(readFileSync(fixtureChapterPath, "utf8"), originalChapter, "failed import changed target");

  restoreFixture();
  const duplicateResult = runImporter(`${sourceFor()}\n\n## Colossians 1:1\nDuplicate.`);
  assert.notEqual(duplicateResult.status, 0, "duplicate heading was accepted");
  assert.match(duplicateResult.stderr, /Duplicate commentary heading for Colossians 1:1/);
  assert.equal(readFileSync(fixtureChapterPath, "utf8"), originalChapter, "failed import changed target");

  const wrongTarget = JSON.parse(originalChapter);
  wrongTarget.verses[0].verse = "Hebrews 1:1";
  const wrongTargetText = `${JSON.stringify(wrongTarget, null, 2)}\n`;
  restoreFixture(wrongTargetText);
  const wrongTargetResult = runImporter(sourceFor());
  assert.notEqual(wrongTargetResult.status, 0, "foreign-book target record was accepted");
  assert.match(wrongTargetResult.stderr, /contains Hebrews 1:1; expected Colossians 1:1/);
  assert.equal(readFileSync(fixtureChapterPath, "utf8"), wrongTargetText, "failed import changed target");

  console.log("Colossians commentary importer safeguards passed.");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
