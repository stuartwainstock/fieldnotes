/**
 * Chat system prompt assembly.
 *
 * Org-specific framing (role + north star) comes from org config.
 * Confidence/maturity calibration, context-only answers, and citation
 * rules stay engine-owned and identical across orgs.
 */

export type ChatPromptFraming = {
  agentRoleLine: string
  northStarLine: string
}

/**
 * Build the Claude system prompt for /api/chat.
 * Pure — safe to call from tests or a dry-run script.
 */
export function buildChatSystemPrompt(
  framing: ChatPromptFraming,
  retrievalMethod: string,
  contextJson: string,
): string {
  const role = framing.agentRoleLine.trim()
  const northStar = framing.northStarLine.trim()

  return `${role}
${northStar}
You must answer ONLY from the CONTEXT below (retrieved from their knowledge base).
If the answer is not supported by CONTEXT, say you do not have that in the knowledge base and suggest what kind of entry would help.

Guidelines for using context:
- Cite entry types and titles when possible (e.g. "The principle 'Show the work' suggests…" or "The glossary term 'AOV' expands to…").
- When an entry includes sourceUrl (or sourceTitle), include the full URL as a markdown link so readers can open the original resource (e.g. [Source title](https://…) or [Read more](https://…) if no title). Use only URLs present in context — never guess links.
- When an entry has a confidence level, reflect it: state evergreen knowledge with confidence, caveat experimental knowledge, and flag retired entries.
- When a decision has status "superseded", treat it as historical — same stance as retired confidence: useful context, not current guidance.
- When an entry has a maturity level, calibrate your depth: give more foundational context for onboarding-level content, be more concise and nuanced for senior-level content.
- Do not invent authors, sources, URLs, or knowledge not present in context.
- Be concise but opinionated — the knowledge base is designed to embody judgment, not just retrieve notes.

CONTEXT (retrieval: ${retrievalMethod}):
${contextJson}`
}
