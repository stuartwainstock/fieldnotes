import { defineField } from 'sanity'
import { DEFAULT_ORG_CONFIG } from '../../config/org'

export const confidenceField = defineField({
  name: 'confidence',
  title: 'Confidence level',
  type: 'string',
  description: 'How settled is this knowledge? Shapes how the agent presents it.',
  options: {
    list: [
      { title: '🌲 Evergreen — stable, proven, foundational', value: 'evergreen' },
      { title: '🌱 Evolving — directionally right, still developing', value: 'evolving' },
      { title: '🧪 Experimental — trying it out, not yet validated', value: 'experimental' },
      { title: '🗄️ Retired — no longer applies, kept for context', value: 'retired' },
    ],
    layout: 'radio',
  },
  initialValue: 'evergreen',
})

export const phaseField = defineField({
  name: 'phases',
  title: DEFAULT_ORG_CONFIG.taxonomy.domainFieldTitle,
  type: 'array',
  description: DEFAULT_ORG_CONFIG.taxonomy.domainFieldDescription,
  of: [
    {
      type: 'reference',
      to: [{ type: 'phase' }],
    },
  ],
})

export const tagsField = defineField({
  name: 'tags',
  title: 'Tags',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'tag' }],
    },
  ],
})

export const relatedEntriesField = defineField({
  name: 'relatedEntries',
  title: 'Related entries',
  type: 'array',
  description: 'Connect this to other frameworks, processes, insights or principles. This is the connective tissue — use it generously.',
  of: [
    {
      type: 'reference',
      weak: true,
      to: [
        { type: 'framework' },
        { type: 'process' },
        { type: 'insight' },
        { type: 'principle' },
        { type: 'externalResource' },
      ],
    },
  ],
})

export const maturityField = defineField({
  name: 'maturity',
  title: 'Audience maturity',
  type: 'string',
  description: 'Who is this most useful for? Helps the agent calibrate its responses.',
  options: {
    list: [
      { title: 'Everyone — universal regardless of experience', value: 'universal' },
      { title: 'New to team — helpful context for onboarding', value: 'onboarding' },
      { title: DEFAULT_ORG_CONFIG.practitionerMaturityLabel, value: 'practitioner' },
      { title: 'Senior — nuanced, requires broader context', value: 'senior' },
    ],
    layout: 'radio',
  },
  initialValue: 'universal',
})

// ── Attribution fields ───────────────────────────────────────────────
// Reusable across any document type that might reference an external
// source — a book, article, talk, mentor, etc.

export const sourceAuthorField = defineField({
  name: 'sourceAuthor',
  title: 'Source author',
  type: 'reference',
  to: [{ type: 'sourceAuthor' }],
  description: 'Pick an existing author or create one — reuse across entries.',
})

export const sourceTitleField = defineField({
  name: 'sourceTitle',
  title: 'Source title',
  type: 'string',
  description: 'Book, article, talk, podcast episode, etc.',
})

export const sourceUrlField = defineField({
  name: 'sourceUrl',
  title: 'Source URL',
  type: 'url',
})
