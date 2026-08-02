# 13 · Fork the repo

**Phase:** 3 — Build & seed the Eleanor Leftwich instance
**Status:** Not started
**Depends on:** 07, 08, 09 (Phase 1 generalization + fork workflow doc should land first)
**Blocks:** 14, 15, 16, 17, 18, 19

## Context

This is the actual fork point. Doing it after Phase 1 is complete (not before) is the whole reason the roadmap is sequenced this way — forking a design-specific codebase now would mean redoing the generalization work inside the fork instead of upstream, recreating exactly the merge pain the fork/upstream model exists to avoid.

## Acceptance criteria

- [ ] Fork `stuartwainstock/fieldnotes` on GitHub to a new repo (e.g. `eleanor-leftwich-knowledge` or similar — pick a name that doesn't imply it's the canonical version)
- [ ] Clone locally, add `fieldnotes` as the `upstream` remote per the workflow doc (ticket 08)
- [ ] Confirm `git fetch upstream` works and shows the expected branch/commit history
- [ ] Update `package.json` name field and any remaining branding strings for the new instance

## Relevant files

- New repo (forked)

## Notes

Don't start customizing until this ticket is done — everything in Phase 3 assumes the fork exists and upstream is wired up correctly.
