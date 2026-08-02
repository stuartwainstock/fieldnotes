# 11 · Provision Eleanor Leftwich Supabase project

**Phase:** 2 — Fork & instance tooling
**Status:** Not started
**Depends on:** —
**Blocks:** 13, 19 (smoke test)

## Context

Unlike Sanity, Supabase doesn't have a lightweight "dataset" equivalent — real tenant isolation would need `org_id`-based RLS in a shared project, which is explicitly out of scope until there's demand from a second org (see Someday: multi-tenant SaaS exploration). For now, a fully separate Supabase project per org is simpler and matches the "separate Supabase project per org" decision already locked in TASKS.md.

## Acceptance criteria

- [ ] Create a new Supabase project for the Eleanor Leftwich instance
- [ ] Enable `pgvector` extension
- [ ] Run the `match_knowledge` function migration (post-ticket 06, if that's landed) and the `knowledge_embeddings` table setup
- [ ] Run the `chat_queries` migration (`supabase/migrations/20260518_create_chat_queries.sql`)
- [ ] Confirm RLS is enabled with service-role-only access — no anonymous access, matching the existing security posture
- [ ] Record `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the forked repo's `.env.local` (never commit, never prefix with `NEXT_PUBLIC_`)

## Relevant files

- `lib/supabase.ts`
- `supabase/migrations/`
- `.env.example`

## Notes

Do this before ticket 19 (smoke test) — nothing in the chat flow works without it.
