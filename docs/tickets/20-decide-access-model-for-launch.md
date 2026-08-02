# 20 · Decide access model for launch

**Phase:** 3 — Build & seed the Eleanor Leftwich instance
**Status:** Not started
**Depends on:** 19
**Blocks:** —

## Context

The current auth model is a single shared `CHAT_ACCESS_TOKEN` — fine for a team of one, not fine once other Eleanor Leftwich employees are using it. This doesn't need to be solved before launch, but it needs a conscious decision, not a default you drift into.

## Acceptance criteria

- [ ] Explicit decision: launch with the shared token for now (acceptable if it's just you initially), or invest in real per-user auth before anyone else gets access
- [ ] If shared token: document who has it and a rotation plan for when that stops being appropriate
- [ ] If real auth: scope that as a follow-up ticket rather than blocking launch on it — Supabase Auth or a simple email allowlist are the lightest options, full SSO is probably overkill at this team size
- [ ] Revisit this decision explicitly before onboarding wave 2 of users, not reactively after an access problem

## Relevant files

- `web/src/app/chat/page.tsx` — token gating
- `CHAT_ACCESS_TOKEN` env var

## Notes

This is intentionally the last ticket in the roadmap — it's a policy decision more than an engineering task, and it's fine for it to stay "shared token, revisit later" for a while.
