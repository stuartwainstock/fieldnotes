import {defineType, defineField} from 'sanity'
import {BookIcon} from '@sanity/icons'
import {
  confidenceField,
  phaseField,
  tagsField,
  relatedEntriesField,
  maturityField,
  sourceAuthorField,
  sourceTitleField,
  sourceUrlField,
} from '../objects/sharedFields'

export const glossaryDocument = defineType({
  name: 'glossary',
  title: 'Glossary term',
  type: 'document',
  icon: BookIcon,
  description:
    'An acronym or internal term — expansion plus definition — so the team (and the agent) share the same vocabulary.',
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      description: 'The acronym or jargon as people say it (e.g. "AOV", "BLUF", "Core").',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'term'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'expansion',
      title: 'Expansion',
      type: 'string',
      description:
        'What the acronym stands for, if applicable (e.g. "Average Order Value"). Leave blank for non-acronym terms.',
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'array',
      of: [{type: 'block'}],
      description:
        'What this means here — plain language, and any nuance that matters for how the team uses it.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Optional grouping (e.g. "Finance", "Ops", "Product") to browse related terms.',
    }),
    sourceAuthorField,
    sourceTitleField,
    sourceUrlField,
    phaseField,
    tagsField,
    confidenceField,
    maturityField,
    relatedEntriesField,
  ],
  orderings: [
    {
      title: 'Term A–Z',
      name: 'termAsc',
      by: [{field: 'term', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'term',
      subtitle: 'expansion',
      confidence: 'confidence',
    },
    prepare({title, subtitle, confidence}) {
      const icons: Record<string, string> = {
        evergreen: '🌲',
        evolving: '🌱',
        experimental: '🧪',
        retired: '🗄️',
      }
      return {
        title: `${icons[confidence] ?? ''} ${title}`,
        subtitle: subtitle || undefined,
      }
    },
  },
})
