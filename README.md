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

`npm run validate` runs the importer regression test, content and reference-preview checks, the strict theological-review and review-manifest gates, the copying audit, and the optional private-source overlap audit used by deployment. `npm run audit:humanization` remains available as an editorial report and does not alter commentary or block deployment.

`audit:source-overlap` checks public commentary and Word / Phrase Notes for exact, normalized, and close phrase overlap against a private corpus when source text is available under `.research/colossians-corpus/text/`. The `.research` tree is ignored by Git; source identities and research-process material must never be copied into public content.

All 95 verse notes, the four chapter introductions, and the public interface copy have completed editorial and theological review. The internal manifest at `audits/colossians-editorial-theology-review.json` records review coverage and fingerprints without exposing private research material. Scripture is the primary authority; current official Seventh-day Adventist belief statements and the voted *Methods of Bible Study* provide the denominational and interpretive baseline. Public `sources` and `sourceAudit` arrays remain empty by policy.

`validate:theology:draft` remains available for future drafting. It enforces public-copy hygiene and the targeted doctrinal controls while deferring the strict review-status and manifest-integrity gates. It is not used by the deployment validation command.

## Deployment

The static export deploys to
`https://colossians.mybibleexplorer.com` through GitHub Pages whenever `main`
is pushed. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the one-time repository,
Pages, DNS, and HTTPS setup.
