# 08 · Write the fork/upstream workflow doc

**Phase:** 2 — Fork & instance tooling
**Status:** Not started
**Depends on:** 07
**Blocks:** 13 (fork the repo)

## Context

The whole point of the fork model is that fieldnotes.design stays the "newest and best" and downstream instances pull improvements in — but that only works if the pull workflow is actually documented somewhere, not just understood in your head. This doc is what you (or anyone else forking this later) follows.

## Acceptance criteria

- [ ] Document how to fork the repo and add `fieldnotes` (renamed from `design-thinking`) as the `upstream` remote: `git remote add upstream https://github.com/stuartwainstock/fieldnotes.git`
- [ ] Document the pull cadence: `git fetch upstream && git merge upstream/main` (or rebase — pick one and explain why), and how often to do it
- [ ] Document how to handle merge conflicts when they do happen, given ticket 09's file boundaries
- [ ] Include a worked example (even hypothetical) of pulling an upstream schema change into a downstream org's config-driven instance without touching org-specific files

## Relevant files

- New: `docs/FORKING.md` or a section in CLAUDE.md — your call, but pick one canonical location and link to it from the other

## Notes

Depends on ticket 07 existing first since this doc will reference the config layer and file boundaries it describes.
