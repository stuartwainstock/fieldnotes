# 12 · Provision Eleanor Leftwich Vercel deployment

**Phase:** 2 — Fork & instance tooling
**Status:** Not started
**Depends on:** 13 (fork must exist first)
**Blocks:** 19 (smoke test)

## Context

The forked repo needs its own Vercel project pointed at the fork, not the original fieldnotes repo — same lesson as the recent `design-thinking` → `fieldnotes` rename, where the GitHub↔Vercel link needed verifying after the name changed. Set this up cleanly from the start rather than repointing an existing project.

## Acceptance criteria

- [ ] New Vercel project created from the forked GitHub repo
- [ ] All required env vars set per `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `CHAT_ACCESS_TOKEN`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` or Vercel's own production URL resolves correctly (see the hardcoded fallback in `web/src/lib/siteUrl.ts` — update it once the real domain is known, or leave the Vercel-provided fallback if no custom domain yet)
- [ ] Test deploy succeeds and the chat surface loads
- [ ] Decide on a domain — subdomain of an existing domain, a new domain, or the default Vercel URL for now

## Relevant files

- `web/.env.example`
- `web/src/lib/siteUrl.ts`

## Notes

Comment-only test push is a good way to verify the GitHub→Vercel hook is healthy before relying on it, same trick used for the fieldnotes rename.
