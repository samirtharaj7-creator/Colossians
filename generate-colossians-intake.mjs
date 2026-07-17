import { mkdirSync, writeFileSync } from "node:fs";

const verseCounts = [29, 23, 25, 18];
const blankAudit = () => ({
  exegesis: [], historicalBackground: [], technicalNotes: [], theologicalInsight: [],
  structuralNotes: [], otherCommentaryInsights: [], application: []
});
const blankCommentary = () => ({
  detailedExplanation: "", exegesis: "", historicalBackground: "", technicalNotes: "",
  theologicalInsight: "", structuralNotes: "", otherCommentaryInsights: "", application: "", reviewFlags: []
});
const blankVerse = (chapter, verse) => ({
  verse: `Colossians ${chapter}:${verse}`,
  bibleText: "", explanation: "", historicalBackground: "", literaryContext: "",
  theologicalInsight: "", structuralNotes: "", relatedConnection: "", crossReferences: [],
  application: "", sources: [], commentary: blankCommentary(), wordNotes: [],
  sourceAudit: blankAudit(), reviewStatus: "placeholder"
});
const blankChapter = (chapter, verseCount) => ({
  chapterNumber: chapter, title: "", summary: "", historicalContext: "", literaryContext: "",
  themes: [], outline: [],
  verses: Array.from({ length: verseCount }, (_, index) => blankVerse(chapter, index + 1)),
  symbols: [], charts: [], images: [], crossReferences: [], relatedConnections: [],
  teachingNotes: { openingQuestion: "", mainPoint: "", keyVerses: [], importantTerms: [], discussionQuestions: [], commonMisunderstandings: [], emphasis: "", closingAppeal: "" },
  evangelisticNotes: { mainDoctrinalTheme: "", keyBibleTexts: [], flow: [], simpleIllustrations: [], appealQuestion: "", cautions: [], sources: [] },
  reflectionQuestions: [], sources: []
});

mkdirSync("content/colossians", { recursive: true });
verseCounts.forEach((count, index) => {
  const chapter = index + 1;
  writeFileSync(`content/colossians/chapter-${String(chapter).padStart(2, "0")}.json`, `${JSON.stringify(blankChapter(chapter, count), null, 2)}\n`);
});
