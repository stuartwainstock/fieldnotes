# 02 · Add glossary/term schema type

**Phase:** 1 — Generalize the engine
**Status:** Not started
**Depends on:** 01
**Blocks:** 15 (seed glossary entries)

## Context

This is the type the whole white-label idea started from — documenting acronyms and internal jargon (I.N.D.Y., SOW, PEO, PDP, AOV, BLUF, Core, Conservatory) so new hires don't have to ask what things mean. None of the existing five knowledge types fit: `tag` is taxonomy only, not a definition; nothing else captures "term → expansion → definition."

## Acceptance criteria

- [ ] New `schemaTypes/documents/glossary.ts` with fields: `term`, `expansion` (what the acronym stands for, if applicable), `definition` (Portable Text), `category` (optional), plus the shared fields contract (`confidence`, `maturity`, `phases`/`domain`, `tags`, `relatedEntries`)
- [ ] Follow the shared-fields import pattern from `schemaTypes/objects/sharedFields.ts` — no inline duplicate field definitions
- [ ] Wired into every step of CLAUDE.md's "Adding a new document type" checklist:
  - [ ] Added to `KNOWLEDGE_TYPES` in the `sanity-webhook` Edge Function
  - [ ] Added to the webhook filter in Sanity (`_type in [...]`)
  - [ ] Added to `relatedEntriesField.of` in `sharedFields.ts`
  - [ ] Added to the GROQ fallback `$types` array in `web/src/lib/knowledge.ts`
  - [ ] Exported from `schemaTypes/index.ts`
- [ ] Attribution fields follow the framework/process/insight/principle pattern (`sourceAuthor`, `sourceTitle`, `sourceUrl`), not the externalResource `author` pattern

## Relevant files

- `schemaTypes/documents/glossary.ts` (new)
- `schemaTypes/objects/sharedFields.ts`
- `schemaTypes/index.ts`
- `web/src/lib/knowledge.ts`
- Supabase `sanity-webhook` Edge Function

## Notes

Same wiring checklist applies to ticket 03 (decision type) — worth doing both together since the steps are identical.
