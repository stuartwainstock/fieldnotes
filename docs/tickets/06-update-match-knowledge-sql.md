# 06 · Update match_knowledge SQL

**Phase:** 1 — Generalize the engine
**Status:** Not started
**Depends on:** 02, 03, 04
**Blocks:** —

## Context

The `match_knowledge` Postgres function supports optional filters (type, confidence, phase) with the pattern: nullable parameter, conditional WHERE clause, no impact when null. New types (`glossary`, `decision`) and the renamed `phase` → `domain` field need to work cleanly with this function without breaking existing filter behavior.

## Acceptance criteria

- [ ] Confirm `glossary` and `decision` are valid values for the existing `type` filter param — likely no schema change needed, just verification
- [ ] Update the phase/domain filter param name if ticket 04 renames the field, and update the corresponding column/join if the underlying table structure references `phase`
- [ ] Add a migration file following the existing convention (see `supabase/migrations/20260518_create_chat_queries.sql` for style)
- [ ] Test filtered queries (by type, by domain) return expected results against seeded data
- [ ] No new filter dimensions unless something in Phase 1-3 actually needs one — don't add speculative filters

## Relevant files

- `supabase/migrations/` (new migration)
- `match_knowledge` SQL function definition

## Notes

This is verification-heavy, not a big rewrite — the function's filter pattern already generalizes well, this is mostly making sure the rename in ticket 04 didn't leave a dangling column reference.
