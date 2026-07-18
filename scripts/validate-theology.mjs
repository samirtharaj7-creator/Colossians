import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  collectPublicText,
  collectStringLeaves,
  commentaryFor,
  loadColossians
} from "./colossians-content-utils.mjs";

const chapters = loadColossians();
const errors = [];
const allowPendingReview = process.argv.includes("--allow-pending-review");
let reviewed = 0;
const reviewPath = "audits/colossians-editorial-theology-review.json";
const reviewManifest = JSON.parse(readFileSync(reviewPath, "utf8"));
const reviewedFiles = {
  background: "content/background.json",
  heroCopy: "components/hero-section.tsx",
  headerCopy: "components/site-header.tsx",
  studyGuideCopy: "app/articles/page.tsx",
  siteMetadata: "app/layout.tsx"
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function reviewFingerprint(verse) {
  return sha256(JSON.stringify({
    verse: verse.verse,
    bibleText: verse.bibleText,
    detailedExplanation: verse.commentary.detailedExplanation,
    wordNotes: verse.wordNotes,
    crossReferences: verse.crossReferences,
    reviewStatus: verse.reviewStatus
  }));
}

for (const { content } of chapters) {
  for (const verse of content.verses) {
    if (verse.reviewStatus === "verified-seed") reviewed += 1;
    else if (verse.reviewStatus !== "needs-source-review" || !allowPendingReview) {
      errors.push(`${verse.verse}: expected ${allowPendingReview ? "verified-seed or needs-source-review" : "verified-seed"}, found ${verse.reviewStatus}`);
    }
  }
}

const background = JSON.parse(readFileSync("content/background.json", "utf8"));
const publicText = [
  ...collectPublicText(chapters),
  ...collectStringLeaves(background, "content/background.json")
];
for (const { field, value } of publicText) {
  if (/https?:\/\/|\bwww\./i.test(value)) errors.push(`${field}: public prose must not contain raw URLs`);
  if (/\bAdventist\b|White Estate|Ellen G\.? White|General Conference|Biblical Research Institute|\bBRI\b/i.test(value)) {
    errors.push(`${field}: contains an unsupported institutional attribution`);
  }
  if (/\b(?:Saviour|offence|cancelled)\b|\bworshipping community\b/i.test(value)) {
    errors.push(`${field}: contains an unquoted non-American spelling`);
  }
  if (/\b(?:tbd|todo|placeholder|lorem ipsum|coming soon|add (?:your|the) (?:own )?(?:notes|commentary))\b/i.test(value)) {
    errors.push(`${field}: contains placeholder language`);
  }
}

const safeguards = [
  { reference: "Colossians 1:15", patterns: [/first being God created/is, /context excludes/is, /Creator[^.!?]{0,80}created order[^.!?]{0,80}cannot be placed/is] },
  { reference: "Colossians 1:16", patterns: [/all things were created/is, /created[^.!?]{0,80}finite/is, /Creator-creature distinction/is] },
  { reference: "Colossians 1:18", patterns: [/bodily and resurrection-centered/is, /not[^.!?]{0,100}immortal soul/is] },
  { reference: "Colossians 1:20", patterns: [/does not require universal salvation/is, /faith and repentance/is, /evil[^.!?]{0,100}final end/is] },
  { reference: "Colossians 1:22", patterns: [/genuine humanity/is, /divine-human identity/is, /once-for-all death/is] },
  { reference: "Colossians 1:23", patterns: [/Perseverance is not[^.!?]{0,80}earns salvation/is, /grace[^.!?]{0,100}human response/is] },
  { reference: "Colossians 1:24", patterns: [/cannot mean[^.!?]{0,140}atoning death was deficient/is, /no apostle[^.!?]{0,100}add redemptive merit/is] },
  { reference: "Colossians 1:27", patterns: [/not a naturally immortal soul/is, /raised[^.!?]{0,100}mortal bodies/is] },
  { reference: "Colossians 2:9", patterns: [/full deity and genuine humanity/is, /neither the highest created being/is, /rose bodily/is] },
  { reference: "Colossians 2:10", patterns: [/received, not self-generated/is, /do not become divine beings/is] },
  { reference: "Colossians 2:12", patterns: [/immersion/is, /Water does not operate mechanically/is, /future hope of literal bodily resurrection/is] },
  { reference: "Colossians 2:14", patterns: [/not be made to teach[^.!?]{0,140}Ten Commandments/is, /continuing heavenly ministry/is, /once for all/is] },
  { reference: "Colossians 2:16", patterns: [/seventh-day Sabbath was sanctified at creation/is, /neither transfers[^.!?]{0,100}Sunday nor establishes Sunday sacredness/is] },
  { reference: "Colossians 2:17", patterns: [/sacrifice is complete and unrepeatable/is, /continues to minister[^.!?]{0,100}true heavenly sanctuary/is] },
  { reference: "Colossians 2:18", patterns: [/grammatically capable of more than one interpretation/is, /must be tested by Scripture/is] },
  { reference: "Colossians 2:23", patterns: [/body[^.!?]{0,100}not evil in itself/is, /destined for resurrection/is, /not a payment offered for salvation/is] },
  { reference: "Colossians 3:4", patterns: [/visible return/is, /bodily resurrection and transformation/is, /not an immortal soul/is] },
  { reference: "Colossians 3:6", patterns: [/coming judgment/is, /second death/is, /remov(?:e|al)[^.!?]{0,80}evil/is] },
  { reference: "Colossians 3:11", patterns: [/equal before Christ/is, /does not teach that all human beings are automatically saved/is] },
  { reference: "Colossians 3:12", patterns: [/Election is[^.!?]{0,100}gift of grace/is, /not a ground for superiority or careless presumption/is] },
  { reference: "Colossians 3:13", patterns: [/not be confused with[^.!?]{0,120}concealing abuse/is, /strong boundaries/is] },
  { reference: "Colossians 3:15", patterns: [/not mean preserving outward calm[^.!?]{0,100}truth or justice/is, /should not reduce[^.!?]{0,100}private feeling/is] },
  { reference: "Colossians 3:18", patterns: [/does not declare women[^.!?]{0,100}inferior/is, /No human authority is absolute/is, /concealment of abuse/is] },
  { reference: "Colossians 3:19", patterns: [/no room for harsh patriarchy/is, /self-giving love/is] },
  { reference: "Colossians 3:20", patterns: [/highest allegiance remains with Christ/is, /demand to[^.!?]{0,100}sin carries no divine obligation/is] },
  { reference: "Colossians 3:22", patterns: [/Historical honesty/is, /cannot simply be equated with modern employment/is, /not be turned into divine approval/is] },
  { reference: "Colossians 3:24", patterns: [/resurrection/is, /does not mean eternal life is earned/is] },
  { reference: "Colossians 3:25", patterns: [/works do not create a claim upon salvation/is, /not endless preservation in sin/is] },
  { reference: "Colossians 4:1", patterns: [/does not present the institution of slavery as God.s ideal/is, /accountability/is, /judgment/is] },
  { reference: "Colossians 4:2", patterns: [/not anxious date-setting/is, /return/is] },
  { reference: "Colossians 4:12", patterns: [/maturity, not a state[^.!?]{0,140}sinless self-sufficiency/is, /continuing need of grace/is] },
  { reference: "Colossians 4:16", patterns: [/identity is unknown/is, /need not imply[^.!?]{0,140}revelation has been lost/is] }
];

for (const { reference, patterns } of safeguards) {
  const commentary = commentaryFor(reference, chapters);
  for (const pattern of patterns) {
    if (!pattern.test(commentary)) errors.push(`${reference}: missing theological safeguard ${pattern}`);
  }
}

if (!allowPendingReview) {
  if (reviewManifest.schemaVersion !== 1 || reviewManifest.book !== "Colossians") {
    errors.push(`${reviewPath}: expected schemaVersion 1 for Colossians`);
  }

  const currentVerses = chapters.flatMap(({ content }) => content.verses);
  const fingerprints = reviewManifest.verseFingerprints ?? {};
  if (Object.keys(fingerprints).length !== currentVerses.length) {
    errors.push(`${reviewPath}: expected ${currentVerses.length} verse fingerprints, found ${Object.keys(fingerprints).length}`);
  }
  for (const verse of currentVerses) {
    const actual = reviewFingerprint(verse);
    if (fingerprints[verse.verse] !== actual) {
      errors.push(`${verse.verse}: content changed after the recorded editorial/theology review`);
    }
  }
  for (const reference of Object.keys(fingerprints)) {
    if (!currentVerses.some((verse) => verse.verse === reference)) {
      errors.push(`${reviewPath}: stale verse fingerprint ${reference}`);
    }
  }

  for (const [key, path] of Object.entries(reviewedFiles)) {
    const actual = sha256(readFileSync(path));
    if (reviewManifest.reviewedFileHashes?.[key] !== actual) {
      errors.push(`${path}: changed after the recorded editorial/theology review`);
    }
  }
}

if (!allowPendingReview && reviewed !== 95) errors.push(`Expected 95 verified notes, found ${reviewed}`);

if (errors.length) {
  console.error(`Theological validation failed with ${errors.length} error(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(
  allowPendingReview
    ? `Theological content validation passed: ${safeguards.length} targeted doctrinal controls; review-status and manifest gates deferred.`
    : `Theological validation passed: ${reviewed} verified notes, ${safeguards.length} targeted doctrinal controls, and a current review manifest.`
);
