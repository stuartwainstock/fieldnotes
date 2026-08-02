# 10 · Provision Eleanor Leftwich Sanity dataset

**Phase:** 2 — Fork & instance tooling
**Status:** Not started
**Depends on:** —
**Blocks:** 13, 14

## Context

Sanity supports multiple datasets under one project — shared schema/Studio code, isolated content. That's a lighter-weight isolation boundary than a full separate project, and it's the natural fit here. Decide up front whether you want the Eleanor Leftwich instance under your existing personal Sanity project (`eff153ps`) as a new dataset, or as a fully separate project if you'd rather keep billing/ownership cleanly split from day one.

## Acceptance criteria

- [ ] Decide: new dataset under existing project, or new project — document the reasoning either way
- [ ] Create the dataset/project in Sanity
- [ ] Confirm schema deploys correctly to the new dataset (`npm run deploy` or equivalent from the forked repo, once ticket 13 exists)
- [ ] Record the new project ID / dataset name in the forked repo's `.env.local` (not committed) and note it exists in `.env.example`

## Relevant files

- `.env.example`, `.env.local` (new, in the forked repo)
- `sanity.config.ts`, `sanity.cli.ts`

## Notes

This can happen before or in parallel with the fork itself (ticket 13) — the dataset/project just needs to exist by the time you're configuring the forked repo's env vars.
