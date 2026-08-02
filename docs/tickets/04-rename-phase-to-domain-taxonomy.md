# 04 · Rename phase → generic domain/function taxonomy

**Phase:** 1 — Generalize the engine
**Status:** Not started
**Depends on:** 01
**Blocks:** 14 (configure org config for EL instance)

## Context

`phase` currently represents stages of the *design* process (Discovery, Definition, Delivery). That's meaningless for a non-design org. The underlying mechanism — a reference-based taxonomy where renaming a value updates everywhere automatically — is exactly right and shouldn't change. Only the seed data and the field's framing are design-specific.

## Acceptance criteria

- [ ] Rename the `phase` document type to something generic — `domain` or `function` (pick one; `domain` reads more industry-neutral)
- [ ] Remove hardcoded design-process seed data from `scripts/seed-data.ts`
- [ ] Taxonomy values become something each org config supplies at seed time, not something baked into the schema
- [ ] Update every reference to `phases` in `sharedFields.ts`, document type definitions, and `web/src/lib/knowledge.ts` GROQ queries to the new field/type name
- [ ] Confirm `match_knowledge` SQL function's phase filter param still works under the new name (see ticket 06)

## Relevant files

- `schemaTypes/documents/phase.ts` → rename
- `schemaTypes/objects/sharedFields.ts` — `phaseField`
- `scripts/seed-data.ts`
- `web/src/lib/knowledge.ts`

## Notes

This is a rename across a moderate number of files — grep for `phase` case-insensitively before starting to catch every reference, including the Supabase `match_knowledge` function.
