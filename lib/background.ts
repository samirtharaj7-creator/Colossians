import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const text = z.string().trim().min(1);
const paragraphBlock = z.object({ type: z.literal("paragraph"), text });
const subsectionBlock = z.object({
  type: z.literal("subsection"),
  title: text,
  body: z.array(text).min(1)
});
const headingBlock = z.object({ type: z.literal("heading"), title: text });
const comparisonBlock = z.object({
  type: z.literal("comparison"),
  title: text,
  headers: z.array(text).min(2),
  rows: z.array(z.array(text).min(2)).min(1)
}).refine((value) => value.rows.every((row) => row.length === value.headers.length), {
  message: "Every table row must match the header count"
});
const block = z.discriminatedUnion("type", [paragraphBlock, headingBlock, subsectionBlock, comparisonBlock]);
const backgroundContentSchema = z.object({
  title: text,
  subtitle: text,
  sections: z.array(z.object({
    id: text,
    title: text,
    blocks: z.array(block).min(1)
  })).min(1)
});

export type BackgroundContent = z.infer<typeof backgroundContentSchema>;
export type BackgroundBlock = BackgroundContent["sections"][number]["blocks"][number];

export function getBackgroundContent(): BackgroundContent {
  const path = join(process.cwd(), "content", "background.json");
  return backgroundContentSchema.parse(JSON.parse(readFileSync(path, "utf8")));
}
