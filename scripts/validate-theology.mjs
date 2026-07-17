import { readFileSync } from "node:fs";
import { collectPublicText, loadColossians } from "./colossians-content-utils.mjs";

const chapters = loadColossians();
const errors = [];
const allowPendingReview = process.argv.includes("--allow-pending-review");
let reviewed = 0;

for (const { content } of chapters) {
  for (const verse of content.verses) {
    if (verse.reviewStatus === "verified-seed") reviewed += 1;
    else if (verse.reviewStatus !== "needs-source-review" || !allowPendingReview) {
      errors.push(`${verse.verse}: expected ${allowPendingReview ? "verified-seed or needs-source-review" : "verified-seed"}, found ${verse.reviewStatus}`);
    }
  }
}

const background = JSON.parse(readFileSync("content/background.json", "utf8"));
const publicText = [...collectPublicText(chapters), { field: "content/background.json", value: JSON.stringify(background) }];
for (const { field, value } of publicText) {
  if (/https?:\/\/|\bwww\./i.test(value)) errors.push(`${field}: public prose must not contain raw URLs`);
  if (/White Estate|Ellen G\.? White|General Conference|Biblical Research Institute/i.test(value)) {
    errors.push(`${field}: contains an unsupported institutional attribution`);
  }
}

if (!allowPendingReview && reviewed !== 95) errors.push(`Expected 95 verified notes, found ${reviewed}`);

if (errors.length) {
  console.error(`Theological validation failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(
  allowPendingReview
    ? "Theological hygiene validation passed; supplied notes remain marked for source review."
    : `Theological validation passed: ${reviewed} verified notes.`
);
