# 03 · Add decision schema type

**Phase:** 1 — Generalize the engine
**Status:** Not started
**Depends on:** 01
**Blocks:** 16 (seed decision entries)

## Context

A lightweight ADR (architecture decision record) pattern, but for business/operational calls instead of code. You already have real content for this: why pre-order exists as a cash-flow/production hedge, why the role is hybrid, why there's an August contractor bridge before September FTE start. Without this type, that reasoning lives only in your personal interview-prep notes and disappears from institutional memory the moment you stop needing it.

## Acceptance criteria

- [ ] New `schemaTypes/documents/decision.ts` with fields: `decision` (the call, one line), `context` (why it came up), `alternativesConsidered` (optional array or Portable Text), `outcome`, `owner` (reference to `sourceAuthor`), `status` (active / superseded — consider a simple string enum, not full workflow), plus the shared fields contract
- [ ] Wired into all steps of the "Adding a new document type" checklist (same as ticket 02): `KNOWLEDGE_TYPES`, webhook filter, `relatedEntriesField.of`, GROQ fallback `$types`, `schemaTypes/index.ts` export
- [ ] `status: superseded` decisions should still be retrievable but the system prompt should flag them as historical — reuse the same "retired" confidence-level language pattern already defined for other types

## Relevant files

- `schemaTypes/documents/decision.ts` (new)
- `schemaTypes/objects/sharedFields.ts`
- `schemaTypes/index.ts`
- `web/src/lib/knowledge.ts`
- Supabase `sanity-webhook` Edge Function

## Notes

Do alongside ticket 02 — identical wiring checklist, easy to batch.
