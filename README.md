# Colossians Commentary

Verse-by-verse commentary project for the book of Colossians, with the complete KJV text and 303 public commentary notes.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run validate:content
npm run audit:humanization
npm run validate:theology:draft
npm run validate:theology
npm run audit:copying
npm run audit:source-overlap
npm run validate
npm run typecheck
npm run lint
npm run build
```

`audit:source-overlap` checks public commentary and Word / Phrase Notes for exact, normalized, and close phrase overlap against a private corpus when source text is available under `.research/colossians-corpus/text/`. The `.research` tree is ignored by Git; source identities and research-process material must never be copied into public content.

`validate:theology:draft` runs the doctrinal and attribution controls while notes are still marked `needs-source-review`; the final `validate:theology` command additionally requires every note to be promoted to `verified-seed`.

## Deployment

The static export deploys to
`https://colossians.mybibleexplorer.com` through GitHub Pages whenever `main`
is pushed. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the one-time repository,
Pages, DNS, and HTTPS setup.
