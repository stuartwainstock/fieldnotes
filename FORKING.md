# Forking fieldnotes for a new org

This is the canonical workflow for running an org-specific instance of the fieldnotes knowledge-agent engine while still pulling engine improvements from upstream.

**Upstream repo:** [stuartwainstock/fieldnotes](https://github.com/stuartwainstock/fieldnotes)  
**Architecture context:** [CLAUDE.md](./CLAUDE.md) → Multi-instance / white-label

---

## Mental model

| Remote | What it is |
|--------|------------|
| `origin` | **Your** fork — the Eleanor Leftwich (or other org) repo you push to |
| `upstream` | **fieldnotes** — the shared engine. Stay current with this |

Customize **org config and Sanity content**. Do **not** customize engine files in the fork if you can help it — every local edit to an engine file becomes a merge conflict on the next pull.

---

## One-time setup

### 1. Fork on GitHub

Fork [stuartwainstock/fieldnotes](https://github.com/stuartwainstock/fieldnotes) into your org or account (e.g. `your-org/el-fieldnotes`).

### 2. Clone your fork and add upstream

```bash
git clone https://github.com/YOUR_ORG/YOUR_FORK.git
cd YOUR_FORK

git remote add upstream https://github.com/stuartwainstock/fieldnotes.git
git remote -v
# origin    → your fork (fetch/push)
# upstream  → stuartwainstock/fieldnotes (fetch only; do not push here)
```

Optional: disable accidental pushes to upstream:

```bash
git remote set-url --push upstream DISABLE
```

### 3. Point the instance at its own infra

A fork shares **code**, not **data**. Provision separate Supabase and Vercel projects for the org (see Phase 3 tickets). For Sanity, this repo uses **one project (`eff153ps`) with an isolated dataset** for Eleanor Leftwich (`eleanorleftwich`) — shared schema, separate content. Point Studio / web env at that dataset:

```bash
SANITY_STUDIO_PROJECT_ID=eff153ps
SANITY_STUDIO_DATASET=eleanorleftwich
SANITY_STUDIO_TITLE='Eleanor Leftwich'

NEXT_PUBLIC_SANITY_PROJECT_ID=eff153ps
NEXT_PUBLIC_SANITY_DATASET=eleanorleftwich
```

Copy remaining env vars from `.env.example` / `web/.env.example` and fill with the new Supabase/Vercel credentials — never reuse production fieldnotes.design secrets. Upgrade to a fully separate Sanity *project* later if ownership or billing needs a hard split.

### 4. Configure the org (no engine edits)

In Sanity Studio, edit the `siteContent` singleton → **Org config**:

- Display name, agent role line, north-star line
- Brand colors
- Enabled knowledge types
- Domain / tag taxonomy **labels**

Seed domain values and knowledge content in the org’s dataset (`scripts/seed-data.ts` ships `seedDomains` empty on purpose — fill per org).

Code defaults in `config/org.ts` are fallbacks for the reference instance. Prefer Sanity overrides so upstream changes to defaults don’t fight your branding.

---

## Pulling upstream (cadence)

**Prefer merge, not rebase.**

```bash
git fetch upstream
git checkout main          # or your default branch
git merge upstream/main
# resolve conflicts if any — see below
git push origin main
```

### Why merge (not rebase)

- Downstream forks are often shared (you + agents + future collaborators). Rebase rewrites history and forces everyone to reset.
- Merge keeps a clear “here’s when we absorbed upstream” commit — useful when debugging “did we pick up that webhook fix yet?”
- Conflict resolution is the same amount of work either way; merge doesn’t pretend history is linear when it isn’t.

### How often

| Cadence | When |
|---------|------|
| **Weekly** | Default while the engine is moving fast (Phase 1–2 churn) |
| **After a known upstream fix** | Immediately — e.g. webhook flattener bug, schema type you need |
| **Before a big org content push** | So Studio schema and Edge Functions match what you’re about to author |
| **Quiet periods** | Monthly is enough once the engine stabilizes |

Do not let the fork drift for months: large gaps make conflicts harder and hide breaking schema changes until Studio deploy day.

---

## File boundaries (engine vs org)

Canonical tables for the fork/upstream model. Summarized in [CLAUDE.md](./CLAUDE.md) → Engine vs org-config file boundaries. Keep these lists in sync when adding paths.

### Engine — never customize downstream

Edit these **only upstream** (or in a PR *to* upstream). In a fork, leave them alone.

| Path | Why |
|------|-----|
| `web/src/lib/knowledge.ts` | Retrieval + fallback chain |
| `web/src/lib/chatSystemPrompt.ts` | Prompt assembly (org strings injected at runtime) |
| `web/src/lib/orgConfig.ts` | Merge helper — no org values of its own |
| `web/src/app/api/chat/route.ts`, `export/route.ts` | API surface |
| `web/src/lib/exportSlides.ts`, `renderPptx.ts` | Export engine (branding passed in from org config) |
| `web/src/components/ChatPanel.tsx` (and shared chat UI) | Product UI |
| `supabase/functions/**` | Embed + search |
| `supabase/migrations/**` | Shared DB shape |
| `schemaTypes/documents/{framework,process,insight,principle,externalResource,glossary,decision}.ts` | Base knowledge schemas |
| `schemaTypes/objects/sharedFields.ts` | Shared field contract |
| `schemaTypes/documents/domain.ts`, `tag.ts`, `sourceAuthor.ts` | Taxonomy / attribution shapes (labels come from config) |

### Org — customize freely

| Path / place | Why |
|--------------|-----|
| Sanity `siteContent` → `org` | Framing, branding, enabled types, taxonomy labels |
| Sanity knowledge documents | The actual product |
| Sanity domain / tag documents | Org-specific taxonomy **values** |
| Sanity `siteContent` page/SEO/chat copy | Marketing and UI copy for this instance |
| `scripts/seed-data.ts` → `seedDomains` (and org seed content) | Bootstrapping a new dataset |
| Vercel / Supabase / Sanity **project** env + config | Instance isolation |

### Straddle files (be careful)

These are easy to customize by accident. Prefer config/content over editing them in a fork:

| Path | Risk | Prefer |
|------|------|--------|
| `config/org.ts` | Defaults are shared; fork edits conflict on every upstream default tweak | Override via `siteContent.org` |
| `schemaTypes/documents/siteContent.ts` | Schema shape is engine; field *values* are org | Change values in Studio, not the schema, unless adding a new config field for all instances (do that upstream) |
| `web/src/lib/sanity.ts` | Contains reference-instance fallback page copy | Put real copy in `siteContent`; don’t add new design strings here |
| `web/src/app/opengraph-image.tsx` | Easy to hardcode brand/tagline | Drive from `getOrgConfig()` / SEO fields |
| `web/src/app/globals.css` | Default CSS brand tokens | Runtime override via org branding in `layout.tsx` |
| `sanity.config.ts` | `projectId` / `dataset` / title | Point at the org’s project; expect occasional merge noise — keep the diff minimal |
| `scripts/seed-data.ts` | Example tags/entries are design-org flavored | Treat as reference-instance seed; swap content per org |
| `package.json` / lockfiles | Dependency bumps come from upstream | Merge upstream; don’t pin fork-only versions without a reason |

If you must change an engine file for one org, upstream the change as a **config hook** instead of a one-off fork patch whenever possible.

---

## Handling merge conflicts

1. **Identify which side of the boundary the file is on** (tables above).
2. **Engine file conflict** → take upstream (`git checkout --theirs` on a merge into your main from upstream is usually wrong direction — prefer understanding the hunk). Default stance: **keep upstream’s engine behavior**, then re-apply any temporary fork hack as a follow-up PR *to* upstream or replace it with config.
3. **Org config / seed conflict** → keep **your** org values. Upstream may have changed `DEFAULT_ORG_CONFIG` examples; your Sanity overrides still win at runtime.
4. **`config/org.ts` conflict** → accept upstream structure/new keys; restore your default strings only if this fork intentionally ships different code defaults (prefer Sanity).
5. **`sanity.config.ts` conflict** → keep your `projectId` / `dataset` / title; take upstream plugin or structure changes.
6. After resolving: run Studio locally, deploy schema if types changed, redeploy Edge Functions if `supabase/functions/**` changed, smoke-test chat.

```bash
# After a conflicted merge
git status
# fix files…
git add .
git commit   # completes the merge
npm run deploy                    # if schemas changed
# redeploy sanity-webhook / rag-query if functions changed
```

---

## Worked example: upstream adds a schema field

**Situation:** Upstream adds an optional `summary` string on `principle` and updates the webhook flattener so it embeds. Your fork (Eleanor Leftwich) never touched those engine files — only `siteContent.org` and Sanity content.

**Pull:**

```bash
git fetch upstream
git merge upstream/main
# Expected: clean merge (or trivial lockfile conflict only)
git push origin main
```

**What you do next (no org-file edits required for the feature to work):**

1. Deploy Studio schema so editors see `summary` (`npm run deploy` in the fork’s CI or locally with the org’s Sanity project auth).
2. Redeploy `sanity-webhook` if the merge included function changes (`verify_jwt: false` preserved).
3. Optionally reindex principles that should pick up `summary` (`scripts/reindex-knowledge-embeddings.ts` against the org webhook URL).
4. Authors fill `summary` in the org dataset when useful — content stays org-specific; the field shape came from upstream for free.

**What you did *not* do:** edit `principle.ts` or the webhook in the fork. Because those stayed pristine, the merge was boring — which is the point.

**Contrast (painful path):** If the fork had locally patched `principle.ts` to rename a field for one org, the same upstream merge would conflict, and you’d spend the afternoon reconciling. Put org-specific naming in org config labels / content instead.

---

## Checklist before opening the fork to authors

- [ ] `upstream` remote points at `https://github.com/stuartwainstock/fieldnotes.git`
- [ ] Separate Sanity / Supabase / Vercel projects configured
- [ ] `siteContent.org` filled (role line, north star, branding, enabled types)
- [ ] Domains seeded for this org
- [ ] Merged current `upstream/main`
- [ ] Studio schema deployed; Edge Functions deployed
- [ ] Chat smoke test against the org deployment

---

## Related docs

- [CLAUDE.md](./CLAUDE.md) — engine rules, multi-instance section, adding document types, system prompt contract
- Phase 3 tickets — provisioning EL Sanity / Supabase / Vercel and seeding content
