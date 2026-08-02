/**
 * Runtime org config for the Next.js app.
 *
 * Merges Sanity `siteContent.org` overrides onto `DEFAULT_ORG_CONFIG` from
 * `config/org.ts`. Prefer this helper over reading siteContent fields directly
 * when you need agent framing, branding, enabled types, or taxonomy labels.
 */

import {
  DEFAULT_ORG_CONFIG,
  KNOWLEDGE_TYPE_REGISTRY,
  brandingToCssVars,
  isKnowledgeTypeId,
  type KnowledgeTypeId,
  type OrgBranding,
  type OrgConfig,
  type OrgTaxonomyLabels,
} from '../../../config/org'
import {getSiteContent} from '@/lib/sanity'

export type {
  KnowledgeTypeId,
  OrgBranding,
  OrgConfig,
  OrgTaxonomyLabels,
}
export {DEFAULT_ORG_CONFIG, KNOWLEDGE_TYPE_REGISTRY, brandingToCssVars}

type PartialOrg = {
  displayName?: string | null
  agentRoleLine?: string | null
  northStarLine?: string | null
  exportRoleLine?: string | null
  enabledKnowledgeTypes?: string[] | null
  branding?: Partial<OrgBranding> | null
  taxonomy?: Partial<Omit<OrgTaxonomyLabels, 'tagCategoryLabels'>> & {
    tagCategoryLabels?: Partial<OrgTaxonomyLabels['tagCategoryLabels']> | null
  } | null
  practitionerMaturityLabel?: string | null
  principleTypeDescription?: string | null
  principleStatementDescription?: string | null
}

function pickString(value: string | null | undefined, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function mergeBranding(partial: Partial<OrgBranding> | null | undefined): OrgBranding {
  const base = DEFAULT_ORG_CONFIG.branding
  if (!partial || typeof partial !== 'object') return {...base}
  return {
    brand: pickString(partial.brand, base.brand),
    brandMuted: pickString(partial.brandMuted, base.brandMuted),
    brandLight: pickString(partial.brandLight, base.brandLight),
    cta: pickString(partial.cta, base.cta),
    ctaHover: pickString(partial.ctaHover, base.ctaHover),
  }
}

function mergeTaxonomy(
  partial: PartialOrg['taxonomy'],
): OrgTaxonomyLabels {
  const base = DEFAULT_ORG_CONFIG.taxonomy
  if (!partial || typeof partial !== 'object') {
    return {
      ...base,
      tagCategoryLabels: {...base.tagCategoryLabels},
    }
  }
  return {
    domainTypeTitle: pickString(partial.domainTypeTitle, base.domainTypeTitle),
    domainTypeDescription: pickString(partial.domainTypeDescription, base.domainTypeDescription),
    domainFieldTitle: pickString(partial.domainFieldTitle, base.domainFieldTitle),
    domainFieldDescription: pickString(partial.domainFieldDescription, base.domainFieldDescription),
    tagCategoryLabels: {
      ...base.tagCategoryLabels,
      ...(partial.tagCategoryLabels ?? {}),
    },
  }
}

function mergeEnabledTypes(raw: string[] | null | undefined): KnowledgeTypeId[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [...DEFAULT_ORG_CONFIG.enabledKnowledgeTypes]
  }
  const filtered = raw.filter(isKnowledgeTypeId)
  return filtered.length > 0 ? filtered : [...DEFAULT_ORG_CONFIG.enabledKnowledgeTypes]
}

/** Merge a partial Sanity org object onto defaults. Pure — safe for tests. */
export function mergeOrgConfig(partial: PartialOrg | null | undefined): OrgConfig {
  if (!partial || typeof partial !== 'object') {
    return {
      ...DEFAULT_ORG_CONFIG,
      branding: {...DEFAULT_ORG_CONFIG.branding},
      enabledKnowledgeTypes: [...DEFAULT_ORG_CONFIG.enabledKnowledgeTypes],
      taxonomy: {
        ...DEFAULT_ORG_CONFIG.taxonomy,
        tagCategoryLabels: {...DEFAULT_ORG_CONFIG.taxonomy.tagCategoryLabels},
      },
    }
  }

  return {
    displayName: pickString(partial.displayName, DEFAULT_ORG_CONFIG.displayName),
    agentRoleLine: pickString(partial.agentRoleLine, DEFAULT_ORG_CONFIG.agentRoleLine),
    northStarLine: pickString(partial.northStarLine, DEFAULT_ORG_CONFIG.northStarLine),
    exportRoleLine: pickString(partial.exportRoleLine, DEFAULT_ORG_CONFIG.exportRoleLine),
    branding: mergeBranding(partial.branding),
    enabledKnowledgeTypes: mergeEnabledTypes(partial.enabledKnowledgeTypes),
    taxonomy: mergeTaxonomy(partial.taxonomy),
    practitionerMaturityLabel: pickString(
      partial.practitionerMaturityLabel,
      DEFAULT_ORG_CONFIG.practitionerMaturityLabel,
    ),
    principleTypeDescription: pickString(
      partial.principleTypeDescription,
      DEFAULT_ORG_CONFIG.principleTypeDescription,
    ),
    principleStatementDescription: pickString(
      partial.principleStatementDescription,
      DEFAULT_ORG_CONFIG.principleStatementDescription,
    ),
  }
}

/**
 * Load the effective org config for this deployment.
 * Reads `siteContent.org` when present; otherwise returns code defaults.
 */
export async function getOrgConfig(): Promise<OrgConfig> {
  const site = await getSiteContent()
  return mergeOrgConfig(site.org ?? null)
}

/** Inline style string for overriding brand CSS variables from org config. */
export function orgBrandingStyle(branding: OrgBranding): string {
  const vars = brandingToCssVars(branding)
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')
}
