# 15 · Seed glossary entries

**Phase:** 3 — Build & seed the Eleanor Leftwich instance
**Status:** Not started
**Depends on:** 02, 13, 14
**Blocks:** 19

## Context

You already have this content — it just needs to move from your personal interview-prep notes into Sanity. This is the fastest way to get something genuinely useful running on day one.

## Acceptance criteria

- [ ] `I.N.D.Y.` — the fractional/embedded advisory group (Siv Paumgarten, Hillary Shafir, Jorie Waterman); note they're strategic advisors, not decision-makers
- [ ] `SOW` — statement of work (relevant to the undocumented August contractor terms)
- [ ] `PEO` — professional employer organization (why FTE start is gated to Sept 1)
- [ ] `PDP` — product detail page
- [ ] `AOV` — average order value
- [ ] `BLUF` — bottom line up front (also worth a `principle` or `process` entry on how you structure decks/emails using it)
- [ ] `Core` — ready-to-ship product line
- [ ] `Conservatory` — pre-order, limited-run, high-labor fabrications (hand-crochet, 200+ labor hours)
- [ ] Each entry tagged with `confidence: evergreen` (these are established facts, not experimental) and cross-linked via `relatedEntries` where it makes sense (e.g. Core ↔ Conservatory, PEO ↔ the Aug/Sept decision entry from ticket 16)

## Relevant files

- Sanity Studio, `glossary` document type

## Notes

Good candidate for a quick import script if there end up being more than a handful — see `scripts/seed-data.ts` and `scripts/import-mymind.ts` for the existing patterns, though manual entry through Studio is probably faster for ~8 entries.
