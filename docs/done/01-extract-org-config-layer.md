# 01 · Extract org config layer

**Phase:** 1 — Generalize the engine
**Status:** Done
**Depends on:** —
**Blocks:** 02, 03, 04, 05

## Context

Right now org-specific choices (branding, which content types are enabled, taxonomy labels, system-prompt framing) are scattered across schema files and hardcoded strings in `route.ts`. That coupling is what would make forking painful — every downstream org would touch the same files as engine changes, guaranteeing merge conflicts. This ticket creates a single config layer that isolates "what makes an org different" from "how the engine works."

The repo already has a working precedent for this: the `siteContent` singleton in Sanity (see `sanity.config.ts`, the `SINGLETON_ID` pattern) drives landing/chat copy today. Extend that pattern rather than inventing a parallel one.

## Acceptance criteria

- [x] Define a config shape covering: org display name, branding (colors/copy), which knowledge document types are enabled, taxonomy labels (what `domain`/`tag` categories are called), and the system-prompt north-star line
- [x] Config is editable without touching engine code — either fully in the `siteContent` singleton, or a thin `config/org.ts` that reads from it
- [x] `route.ts` and any schema descriptions that currently hardcode design-specific language read from this config instead
- [x] Documented in CLAUDE.md (feeds into ticket 07)

## Relevant files

- `config/org.ts` — defaults + shape (`DEFAULT_ORG_CONFIG`)
- `web/src/lib/orgConfig.ts` — runtime merge via `getOrgConfig()`
- `schemaTypes/documents/siteContent.ts` — editable `org` object
- `web/src/app/api/chat/route.ts` / `export/route.ts` — consume framing from config
- `schemaTypes/documents/{phase,tag,principle}.ts`, `objects/sharedFields.ts` — Studio labels from defaults
- `CLAUDE.md` — org config layer section

## Notes

Everything else in Phase 1 hangs off this — do it first.

**Done notes:** `enabledKnowledgeTypes` is on the config shape and editable in Studio; webhook/GROQ still embed the full engine registry until tickets 02–03 wire new types through. Filtering retrieval by enabled types can follow once the registry grows.
