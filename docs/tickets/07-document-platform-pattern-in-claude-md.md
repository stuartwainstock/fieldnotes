# 07 · Document the platform pattern in CLAUDE.md

**Phase:** 1 — Generalize the engine
**Status:** Not started
**Depends on:** 01, 02, 03, 04, 05
**Blocks:** 08 (fork/upstream workflow doc builds on this)

## Context

CLAUDE.md is the authoritative reference for anyone (human or AI) working in this codebase — it's what a fresh Cursor or Claude session reads first. Once Phase 1 is done, the architecture has fundamentally changed (config-driven, multi-instance-capable) and the doc needs to say so, or every future session will re-derive design-specific assumptions from the existing text.

## Acceptance criteria

- [ ] New "Multi-instance / white-label" section added to CLAUDE.md covering: the config layer (what lives in config vs. hardcoded), the two new document types and what they're for, the renamed taxonomy, and a summary of the fork/upstream isolation model
- [ ] Update the "Adding a new document type" checklist if anything about the process changed
- [ ] Update the "Document types and their purpose" section to include `glossary` and `decision`
- [ ] Scrub remaining design-specific language from the rest of the doc (e.g. "the design lead would say it in a critique" framing) — replace with the generic equivalent
- [ ] Leave a short "Instance history" note: this repo was renamed from `design-thinking` to `fieldnotes` on Aug 2, 2026, generalized for white-labeling shortly after

## Relevant files

- `CLAUDE.md`

## Notes

This is the ticket that makes Phase 2 and Phase 3 possible without you personally re-explaining the architecture every time — do it last in Phase 1, once everything it needs to describe actually exists.
