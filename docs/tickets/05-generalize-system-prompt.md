# 05 · Generalize the system prompt

**Phase:** 1 — Generalize the engine
**Status:** Not started
**Depends on:** 01
**Blocks:** —

## Context

`web/src/app/api/chat/route.ts` currently opens with `"You are the design-thinking knowledge assistant for a small internal team."` — a leftover from before the product was even branded "fieldnotes," let alone generalized. The north-star framing ("if the design lead would say it in a critique, the agent should be able to say it too") is also design-specific. The confidence/maturity calibration logic underneath it is already generic and shouldn't change.

## Acceptance criteria

- [ ] System prompt's opening line and north-star framing pull from the org config (ticket 01) instead of being hardcoded
- [ ] Confidence-level language (evergreen = confident, evolving = directional, experimental = caveated, retired = flagged) stays exactly as-is
- [ ] Maturity-level language (onboarding = more foundational context, senior = concise and nuanced) stays exactly as-is
- [ ] The "answer only from context" and "cite entry types and titles" rules stay as-is
- [ ] `retrievalMethod` label still included for transparency/debugging
- [ ] Verify with a test question that the new framing reads naturally, not like a template with blanks filled in

## Relevant files

- `web/src/app/api/chat/route.ts`

## Notes

Small, surgical change — the risk here is more about writing a good generic prompt than about code complexity. Worth drafting the actual Eleanor Leftwich framing (ticket 14) at the same time to sanity-check the template flexes correctly.
