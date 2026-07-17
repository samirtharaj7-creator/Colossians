# Colossians Commentary

Verse-by-verse commentary project for all four chapters of Colossians, with the complete KJV text and 95 public commentary notes.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run validate:content
npm run validate
npm run typecheck
npm run lint
npm run build
```

`npm run validate` runs the content and reference-preview checks, theological-hygiene review, copying audit, and optional private-source overlap audit used by deployment. `npm run audit:humanization` remains available as an editorial report but does not alter supplied commentary or block deployment.

`audit:source-overlap` checks public commentary and Word / Phrase Notes for exact, normalized, and close phrase overlap against a private corpus when source text is available under `.research/colossians-corpus/text/`. The `.research` tree is ignored by Git; source identities and research-process material must never be copied into public content.

`validate:theology:draft` runs the theological-hygiene and attribution controls while supplied notes remain marked `needs-source-review`. The final `validate:theology` command additionally requires all 95 notes to be promoted to `verified-seed` after source review.

## Deployment

The static export deploys to
`https://colossians.mybibleexplorer.com` through GitHub Pages whenever `main`
is pushed. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the one-time repository,
Pages, DNS, and HTTPS setup.
