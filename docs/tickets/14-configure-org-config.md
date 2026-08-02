# 14 · Configure org config

**Phase:** 3 — Build & seed the Eleanor Leftwich instance
**Status:** Not started
**Depends on:** 13
**Blocks:** 15, 16, 17, 18

## Context

This is where the Phase 1 config layer (ticket 01) gets used for real for the first time. Getting this right validates the whole white-label approach — if configuring a new org still requires touching engine code, Phase 1 didn't actually succeed.

## Acceptance criteria

- [ ] Set org display name, branding/copy for Eleanor Leftwich in the `siteContent` singleton
- [ ] Enable the content types actually needed (likely all of: process, insight, principle, glossary, decision, externalResource)
- [ ] Seed the `domain` taxonomy with Eleanor Leftwich's actual functions: Ecomm, Merchandising/Production, Finance, Marketing, Leadership
- [ ] Write the org-specific system-prompt north-star line (ticket 05's config hook) — something like "if Kendall or Nicola would say it in a 1:1 or onboarding, the agent should be able to say it too"
- [ ] Confirm none of this required editing files outside the config layer — if it did, note what leaked and consider a follow-up ticket

## Relevant files

- `siteContent` singleton (Sanity)
- Config layer from ticket 01

## Notes

This ticket is as much a test of the architecture as it is actual setup work — treat any friction here as a signal, not just a task to push through.
