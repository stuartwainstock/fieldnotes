# 19 · Smoke test end-to-end

**Phase:** 3 — Build & seed the Eleanor Leftwich instance
**Status:** Not started
**Depends on:** 10, 11, 12, 13, 14, 15, 16, 17
**Blocks:** 20

## Context

Validates that the full pipeline actually works on the new instance before you rely on it or show it to anyone else: Sanity publish → webhook → embed → store → chat retrieval → Claude answer.

## Acceptance criteria

- [ ] Publish a new glossary entry in Studio (e.g. a term not yet seeded) and confirm the webhook fires and `webhook_log` shows a successful event
- [ ] Confirm the entry appears in `knowledge_embeddings` in Supabase with a populated vector
- [ ] Ask the chat a question that should retrieve that entry via RAG (not GROQ fallback) and confirm `retrievalMethod` in the response shows `rag`
- [ ] Ask a question the knowledge base can't answer and confirm the agent says so and suggests what kind of entry would help, rather than hallucinating
- [ ] Test the fallback chain deliberately — temporarily misconfigure Supabase env vars (or test before ticket 11 is fully wired) and confirm chat still works via GROQ fallback
- [ ] Test on both desktop and mobile if the UI matters for this audience

## Relevant files

- Full retrieval pipeline — `web/src/lib/knowledge.ts`, `web/src/app/api/chat/route.ts`, Supabase Edge Functions

## Notes

Don't skip the deliberate fallback-chain test — it's the thing most likely to silently regress if any Phase 1 change touched retrieval logic.
