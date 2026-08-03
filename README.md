# fieldnotes

**A second brain for a product design team** — live at [fieldnotes.design](https://www.fieldnotes.design). Not a chatbot, not a wiki — a system that turns institutional design leadership knowledge into something self-service, so that quality standards are *implicit* in the answers rather than something a designer has to go hunting for.

A designer asks a question. The agent answers with the team's own judgment, frameworks, and principles — cited, opinionated, and calibrated to the asker's experience level.

> **North star:** if the design lead would say it in a critique, the agent should be able to say it too.

---

## The idea

Most design knowledge lives in people's heads, scattered Slack threads, and abandoned wiki pages. It decays. It's invisible to new hires. It can't scale past the few senior people who hold it.

This project treats that knowledge as **structured, authored content** — frameworks, processes, insights, principles, and annotated references — and puts a reasoning layer on top of it. The result is a teammate you can ask "how should I run this discovery phase?" or "what does good critique look like here?" and get an answer that sounds like *your* team, not a generic AI.

Two things make it more than a search box:

- **It has a point of view.** Every entry carries a `confidence` level (evergreen → experimental) and a `maturity` level (onboarding → senior). The agent uses these to calibrate *how* it talks — stating evergreen principles with conviction, caveating experimental ones, and giving juniors more foundational context than it gives senior practitioners.
- **It only speaks from the team's knowledge.** Answers are grounded in retrieved content via RAG. If the knowledge base doesn't cover something, the agent says so — and suggests what kind of entry would fill the gap.

---

## The tech powering it

```
Sanity Studio (authoring) ──webhook──▶ Supabase Edge Function (embed + store)
                                              │
                                              ▼
   User question ──▶ Next.js API route ──▶ Edge Function (embed + search)
                                              │
                                              ▼
              Claude ◀── RAG context ◀── pgvector similarity search
```

| Layer | Powered by | Why it's here |
|-------|-----------|---------------|
| **Authoring** | [Sanity](https://www.sanity.io) v6 — Studio, Portable Text, GROQ | The team writes knowledge in structured documents with rich field types. No code required to teach the agent something new. |
| **Vector store + search** | [Supabase](https://supabase.com) Postgres + `pgvector` | Stores embeddings and runs cosine-similarity search via the `match_knowledge` SQL function. RLS locked to `service_role` — no anonymous access, ever. |
| **Ingestion + retrieval** | Supabase **Edge Functions** (Deno) | One function embeds and stores on publish; another embeds and searches on query. Both log for observability. |
| **Embeddings** | OpenAI `text-embedding-3-small` (1536-dim) | The one place we *don't* use Claude — Anthropic has no embeddings API. Embeddings are OpenAI; all reasoning is Claude. |
| **Reasoning** | [Anthropic Claude](https://www.anthropic.com) (`claude-sonnet-4-6`) | Receives retrieved context in its system prompt and answers only from it — opinionated, cited, and calibrated to confidence and maturity. |
| **Web surface** | [Next.js 16](https://nextjs.org) + React 19 on [Vercel](https://vercel.com) | Server-side API route handles retrieval and the Claude call. No sensitive keys ever reach the browser. |
| **Design system docs** | [Storybook](https://storybook.js.org) v10 + [Chromatic](https://www.chromatic.com) | Living documentation of UI tokens and patterns, with visual regression review in CI. |
| **Slides export** | [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) | Turn any answer into a branded `.pptx` — Claude restructures the reply into slides, the browser downloads the deck. |

---

## What makes the architecture interesting

**Retrieval that never breaks.** Context retrieval is a deliberate degradation chain, not a single point of failure:

```
RAG (semantic search) → GROQ (empty RAG) → GROQ (RAG error) → GROQ (no question)
```

The chat **always works** — even with Supabase entirely unconfigured, it falls back to a bounded Sanity GROQ fetch. Every path is labelled so you can see exactly how an answer was sourced.

**Knowledge as a graph, not a list.** Document types (`framework`, `process`, `insight`, `principle`, `externalResource`, `glossary`, `decision`) share a common contract — confidence, maturity, domains, tags, attribution, and weak `relatedEntries` references that wire entries together. Renaming a domain or tag updates everywhere automatically, because taxonomy is reference-based, not string-based.

**Interpretation over bookmarks.** The most valuable fields aren't the raw material — they're the takes. An Insight's `myTake`, a Principle's `elaboration` and `tension`. A quote without interpretation is just a bookmark; the interpretation is what makes this a knowledge base.

**Built to add surfaces.** The retrieval layer is shared by design. Today's surface is a web chat; the same pipeline is meant to feed a future Slack bot, a Figma plugin, and CLI/editor integrations. The system prompt can vary per surface — the context format doesn't.

---

## At a glance

- **Sanity project** `eff153ps` · **dataset** `production`
- **Studio** runs from the repo root (`npm run dev`, port 3333) and deploys to Sanity hosting (`npm run deploy`)
- **Web app** lives in [`web/`](web/) (Next.js, port 3000) and deploys to Vercel at [www.fieldnotes.design](https://www.fieldnotes.design) — public pages: `/`, `/about`, `/chat`
- **Knowledge types** authored in [`schemaTypes/`](schemaTypes/); shared fields are the single source of truth in [`schemaTypes/objects/sharedFields.ts`](schemaTypes/objects/sharedFields.ts). Marketing copy, the nav, and the About page are editable via the `siteContent` singleton
- **Analytics** — GA4 pageviews plus per-question logging to Supabase, with an executive dashboard at `/admin/queries`
- **Discoverability** — generated `sitemap.xml` and `robots.txt`, with canonical/OG URLs driven by `NEXT_PUBLIC_SITE_URL`
- **Quality bar** — automated WCAG 2.1 AA checks (Playwright + axe) and Chromatic visual review run in CI

## Going deeper

- **[`CLAUDE.md`](CLAUDE.md)** — the authoritative architecture and content-authoring guide. Read this before changing schemas or the pipeline.
- **[`FORKING.md`](FORKING.md)** — how to fork for a new org, pull upstream with merge, and keep org customizations out of engine files.
- **[`web/README.md`](web/README.md)** — running the Next.js app, environment variables, Storybook, analytics, and deploy.

> The agent knows nothing that isn't authored in Sanity. There's no hardcoded knowledge in the prompt — everything it says comes from the team's content, retrieved at query time. That's the whole point.
