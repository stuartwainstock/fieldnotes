# 09 · Establish engine vs. org-config file boundaries

**Phase:** 2 — Fork & instance tooling
**Status:** Not started
**Depends on:** 01, 07
**Blocks:** 08

## Context

The single biggest risk to the fork/upstream model long-term is merge pain — if a downstream org customizes files that upstream also changes, every pull becomes a conflict-resolution exercise. This ticket draws the line explicitly so it's a documented convention, not something you have to remember.

## Acceptance criteria

- [ ] Short convention note (in CLAUDE.md's new section from ticket 07, or a standalone `CONTRIBUTING.md`) listing which files/directories are "engine — never customize downstream" (retrieval logic, Edge Functions, chat UI components, base schema shapes) vs. "org config — customize freely" (the `siteContent` singleton, taxonomy seed data, branding)
- [ ] Where possible, structure new code so org-specific values can't leak into engine files even by accident (e.g. no hardcoded strings in `route.ts` after ticket 05)
- [ ] Flag any existing files that straddle the line and would need splitting

## Relevant files

- `CLAUDE.md` or new `CONTRIBUTING.md`

## Notes

This is a documentation/convention ticket, not a code ticket — but it's the thing that makes ticket 08's workflow actually work in practice rather than just in theory.
