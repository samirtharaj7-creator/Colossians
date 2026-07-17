# Colossians Commentary Workspace

## Intake state

The live application contains four Colossians chapter files under `content/colossians/`. Every canonical verse has a structural slot, but Scripture text and commentary fields intentionally begin empty.

Use `generate-colossians-intake.mjs` only when intentionally resetting all four chapters to blank intake files.

## Commentary voice

- Work passage-by-passage so adjacent verse notes share context without needless repetition.
- Use a blended pastoral-scholarly and formal voice, with varied paragraph shape and length governed by the text.
- Avoid stock openings, balanced disclaimer chains, transferable applications, and automatic polished conclusions.
- Preserve the project’s biblical and theological safeguards while integrating them into the exegesis.
- Add no more than two selective `wordNotes` per verse. Greek lexical notes should show the Greek form and transliteration, explain the contextual sense, and avoid root or gloss fallacies.

## Copyright and research

- Form independent factual synthesis in original wording.
- Do not copy long or distinctive passages from research sources.
- Keep public `sources` and `sourceAudit` arrays empty unless the user explicitly changes this policy.
- Never place PDFs, extracted source text, or private research indexes inside the application content tree.
