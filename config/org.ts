/**
 * Org config — the single place that isolates "what makes an org different"
 * from "how the engine works."
 *
 * Defaults live here (and in Sanity `siteContent.org` when editors override them).
 * Studio schemas import these strings so field titles/descriptions stay org-aware
 * without hardcoding design-team language into engine schema files.
 *
 * Web runtime: prefer `getOrgConfig()` in `web/src/lib/orgConfig.ts`, which merges
 * Sanity overrides on top of these defaults.
 */

/** Knowledge document types the engine knows how to embed + retrieve. */
export const KNOWLEDGE_TYPE_REGISTRY = [
  'framework',
  'process',
  'insight',
  'principle',
  'externalResource',
  'glossary',
] as const

export type KnowledgeTypeId = (typeof KNOWLEDGE_TYPE_REGISTRY)[number]

export type OrgBranding = {
  /** Primary brand color (hex), maps to `--brand` */
  brand: string
  /** Muted brand (hex), maps to `--brand-muted` */
  brandMuted: string
  /** Light brand wash (hex), maps to `--brand-light` */
  brandLight: string
  /** CTA / accent (hex), maps to `--cta` */
  cta: string
  /** CTA hover (hex), maps to `--cta-hover` */
  ctaHover: string
}

export type OrgTaxonomyLabels = {
  /** Document type title in Studio (currently "Phase"; later "Domain") */
  domainTypeTitle: string
  /** Description on the domain/phase document type */
  domainTypeDescription: string
  /** Title on the reference field shared across knowledge docs */
  domainFieldTitle: string
  /** Description on that reference field */
  domainFieldDescription: string
  /** Display titles for tag category option values */
  tagCategoryLabels: {
    discipline: string
    activity: string
    mindset: string
    stakeholder: string
    quality: string
    tool: string
    other: string
  }
}

export type OrgConfig = {
  /** Short org / product display name */
  displayName: string
  /**
   * Opening line of the chat system prompt.
   * Example: "You are the knowledge assistant for the fieldnotes design team."
   */
  agentRoleLine: string
  /**
   * North-star framing injected into the system prompt.
   * Example: "If the design lead would say it in a critique, you should be able to say it too."
   */
  northStarLine: string
  /** Slide-export structuring prompt opener */
  exportRoleLine: string
  branding: OrgBranding
  /**
   * Subset of `KNOWLEDGE_TYPE_REGISTRY` this org uses.
   * Types not listed stay in the engine but are not the org's active set.
   */
  enabledKnowledgeTypes: KnowledgeTypeId[]
  taxonomy: OrgTaxonomyLabels
  /** Practitioner maturity option copy — org-calibrated competency framing */
  practitionerMaturityLabel: string
  /** Principle document type description */
  principleTypeDescription: string
  /** Principle statement field description */
  principleStatementDescription: string
}

/** fieldnotes defaults — the reference design-org instance of this engine. */
export const DEFAULT_ORG_CONFIG: OrgConfig = {
  displayName: 'fieldnotes',
  agentRoleLine:
    'You are the knowledge assistant for a product design team. Your job is to surface their published judgment — frameworks, processes, principles, and insights — with the same conviction a design lead would bring to a critique.',
  northStarLine:
    "If the design lead would say it in a critique, you should be able to say it too.",
  exportRoleLine: 'You restructure team knowledge into presentation slides.',
  branding: {
    brand: '#2B4ACB',
    brandMuted: '#4A64D6',
    brandLight: '#E8EDFF',
    cta: '#B8470F',
    ctaHover: '#9E3D12',
  },
  enabledKnowledgeTypes: [...KNOWLEDGE_TYPE_REGISTRY],
  taxonomy: {
    domainTypeTitle: 'Phase',
    domainTypeDescription:
      "A stage in the team's process. Keep these high-level — they're the primary lens for organising all knowledge.",
    domainFieldTitle: 'Phases',
    domainFieldDescription: 'Which phase(s) of the process does this apply to?',
    tagCategoryLabels: {
      discipline: 'Discipline — area of practice',
      activity: 'Activity — a type of work or exercise',
      mindset: 'Mindset — a way of thinking or orienting',
      stakeholder: 'Stakeholder — who this involves',
      quality: 'Quality — a standard or attribute of good work',
      tool: 'Tool — a specific tool or medium',
      other: 'Other',
    },
  },
  practitionerMaturityLabel: 'Practitioner — assumes core team competency',
  principleTypeDescription:
    'A core belief, one-liner, or opinionated stance on how good work gets done.',
  principleStatementDescription:
    "The one-liner itself. Should be quotable and memorable — the kind of thing you'd say in a critique or 1:1.",
}

/** CSS custom properties produced from branding hexes. */
export function brandingToCssVars(branding: OrgBranding): Record<string, string> {
  return {
    '--brand': branding.brand,
    '--brand-muted': branding.brandMuted,
    '--brand-light': branding.brandLight,
    '--cta': branding.cta,
    '--cta-hover': branding.ctaHover,
  }
}

export function isKnowledgeTypeId(value: string): value is KnowledgeTypeId {
  return (KNOWLEDGE_TYPE_REGISTRY as readonly string[]).includes(value)
}
