import {defineType, defineField} from 'sanity'
import {CheckmarkCircleIcon} from '@sanity/icons'
import {
  confidenceField,
  domainField,
  tagsField,
  relatedEntriesField,
  maturityField,
} from '../objects/sharedFields'

export const decisionDocument = defineType({
  name: 'decision',
  title: 'Decision',
  type: 'document',
  icon: CheckmarkCircleIcon,
  description:
    'A business or operational call and the reasoning behind it — lightweight ADR for institutional memory, not code.',
  fields: [
    defineField({
      name: 'decision',
      title: 'The decision',
      type: 'string',
      description: 'The call itself, in one line (e.g. "Use a contractor bridge in August before FTE start").',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'decision'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'context',
      title: 'Context',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Why this came up — the situation, constraints, and pressure that forced a call.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alternativesConsidered',
      title: 'Alternatives considered',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Options that were on the table and not chosen. Optional but valuable for future readers.',
    }),
    defineField({
      name: 'outcome',
      title: 'Outcome',
      type: 'array',
      of: [{type: 'block'}],
      description: 'What we decided and what followed — consequences, results, or current state.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'owner',
      title: 'Owner',
      type: 'reference',
      to: [{type: 'sourceAuthor'}],
      description: 'Who owns this decision — the person accountable for the call.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description:
        'Active = still the current call. Superseded = historical — keep for context; the agent will flag it like retired knowledge.',
      options: {
        list: [
          {title: 'Active — current guidance', value: 'active'},
          {title: 'Superseded — historical, no longer the call', value: 'superseded'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    }),
    domainField,
    tagsField,
    confidenceField,
    maturityField,
    relatedEntriesField,
  ],
  orderings: [
    {
      title: 'Decision A–Z',
      name: 'decisionAsc',
      by: [{field: 'decision', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'decision',
      status: 'status',
      confidence: 'confidence',
    },
    prepare({title, status, confidence}) {
      const icons: Record<string, string> = {
        evergreen: '🌲',
        evolving: '🌱',
        experimental: '🧪',
        retired: '🗄️',
      }
      const statusLabel = status === 'superseded' ? 'superseded' : 'active'
      return {
        title: `${icons[confidence] ?? ''} ${title}`,
        subtitle: statusLabel,
      }
    },
  },
})
