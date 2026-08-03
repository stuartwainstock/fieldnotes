/**
 * SEED DATA
 * ─────────────────────────────────────────────────────────────────
 * Run this via the Sanity CLI or import via the Sanity dashboard.
 * Provides: an empty domain taxonomy slot (org fills at seed time),
 * a starter tag taxonomy, and one example of each document type so
 * authoring is immediately concrete.
 *
 * To import: paste into a Sanity dataset import script or use
 * the Sanity CLI: `sanity dataset import seed.ndjson <dataset>`
 * (convert this file to NDJSON format for the CLI)
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Domain taxonomy values are org-specific — not baked into the engine.
 * Populate this array at seed time per org (see ticket 14 for Eleanor Leftwich).
 *
 * Example entry:
 * { _type: 'domain', name: 'Ecomm', slug: { current: 'ecomm' }, order: 1, color: '#7F77DD' }
 */
export type SeedDomain = {
  _type: 'domain'
  name: string
  slug: {current: string}
  description?: string
  order?: number
  color?: string
}

export const seedDomains: SeedDomain[] = []

export const seedTags = [
  // Discipline
  { _type: 'tag', label: 'Research', slug: { current: 'research' }, category: 'discipline' },
  { _type: 'tag', label: 'Systems thinking', slug: { current: 'systems-thinking' }, category: 'discipline' },
  { _type: 'tag', label: 'Interaction design', slug: { current: 'interaction-design' }, category: 'discipline' },
  { _type: 'tag', label: 'Content design', slug: { current: 'content-design' }, category: 'discipline' },
  { _type: 'tag', label: 'Design systems', slug: { current: 'design-systems' }, category: 'discipline' },

  // Activity
  { _type: 'tag', label: 'Critique', slug: { current: 'critique' }, category: 'activity' },
  { _type: 'tag', label: 'Facilitation', slug: { current: 'facilitation' }, category: 'activity' },
  { _type: 'tag', label: 'Prototyping', slug: { current: 'prototyping' }, category: 'activity' },
  { _type: 'tag', label: 'Synthesis', slug: { current: 'synthesis' }, category: 'activity' },
  { _type: 'tag', label: 'Stakeholder alignment', slug: { current: 'stakeholder-alignment' }, category: 'activity' },

  // Mindset
  { _type: 'tag', label: 'Problem framing', slug: { current: 'problem-framing' }, category: 'mindset' },
  { _type: 'tag', label: 'Ambiguity tolerance', slug: { current: 'ambiguity-tolerance' }, category: 'mindset' },
  { _type: 'tag', label: 'User empathy', slug: { current: 'user-empathy' }, category: 'mindset' },
  { _type: 'tag', label: 'Opinionated design', slug: { current: 'opinionated-design' }, category: 'mindset' },

  // Quality
  { _type: 'tag', label: 'Craft', slug: { current: 'craft' }, category: 'quality' },
  { _type: 'tag', label: 'Clarity', slug: { current: 'clarity' }, category: 'quality' },
  { _type: 'tag', label: 'Intentionality', slug: { current: 'intentionality' }, category: 'quality' },

  // Stakeholder
  { _type: 'tag', label: 'Engineering', slug: { current: 'engineering' }, category: 'stakeholder' },
  { _type: 'tag', label: 'Product', slug: { current: 'product' }, category: 'stakeholder' },
  { _type: 'tag', label: 'Leadership', slug: { current: 'leadership' }, category: 'stakeholder' },
]

/**
 * EXAMPLE ENTRIES
 * One per document type — illustrates how to fill out each field
 * and gives the agent real content to retrieve on day one.
 */

export const exampleFramework = {
  _type: 'framework',
  title: 'How Might We (HMW)',
  slug: { current: 'how-might-we' },
  summary: 'A reframing technique that turns problem statements into design opportunities. Shifts the team from "we can\'t because..." to "what if we...". Most powerful at the transition from discovery to definition.',
  whenToUse: 'Use when the team is stuck in problem mode and needs to shift toward possibility. Especially effective after a synthesis session when you have a clear insight but haven\'t yet turned it into direction. Run it in a workshop to generate divergent angles quickly.',
  antiPatterns: 'Don\'t use HMW to restate the solution you\'ve already decided on. If every HMW in a session is pointing at the same answer, the team has skipped the divergence step. Also avoid using it so early in discovery that there isn\'t enough real insight to draw from — HMW built on assumptions rather than evidence produces shallow directions.',
  signalsOfGoodWork: [
    'HMWs feel surprising — they open up angles the team hadn\'t considered',
    'Multiple incompatible HMWs exist, creating genuine creative tension',
    'The team debates which HMW to pursue rather than converging immediately',
    'HMWs are grounded in real user language or observed behaviour',
  ],
  signalsOfPoorWork: [
    'Every HMW points toward the same pre-decided solution',
    'HMWs are too broad ("how might we improve the experience") or too narrow ("how might we add a filter")',
    'The exercise produces HMWs in 10 minutes and moves on — no genuine divergence happened',
    'HMWs are framed around business goals rather than user needs',
  ],
  commonMistakes: [
    'Running it too early before there\'s real insight to draw from',
    'Skipping the voting/prioritisation step — all HMWs feel equally valid',
    'Writing HMWs as solutions disguised as questions',
  ],
  confidence: 'evergreen',
  maturity: 'universal',
}

export const examplePrinciple = {
  _type: 'principle',
  statement: 'Show the work, not just the answer.',
  slug: { current: 'show-the-work' },
  origin: 'Learned from years of watching good designers lose alignment battles they should have won.',
  elaboration: [
    {
      _type: 'block',
      children: [{ _type: 'span', text: 'The design is rarely what gets challenged in a review — the reasoning behind it is. When you present only the final direction, you force stakeholders to either trust you blindly or project their own reasoning onto your decision. Neither is healthy.' }],
    },
    {
      _type: 'block',
      children: [{ _type: 'span', text: 'Showing your work means making the criteria explicit: what were you optimising for, what did you consider and reject, and what trade-offs did you accept? This invites stakeholders into the decision rather than asking them to ratify it.' }],
    },
  ],
  goodExample: 'Presenting three directions in a review with a clear articulation of the design question each one answers — not as options to pick from, but as proof that the problem space was genuinely explored.',
  antiExample: 'Arriving at a stakeholder review with a single polished comp and framing it as "the solution". When challenged, having no visible reasoning to fall back on.',
  tension: 'There\'s a version of "showing work" that becomes defensive documentation — covering yourself rather than inviting collaboration. The goal is transparency, not justification.',
  confidence: 'evergreen',
  maturity: 'universal',
}
