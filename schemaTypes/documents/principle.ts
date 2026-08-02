import { defineType, defineField } from 'sanity'
import { BlockquoteIcon } from '@sanity/icons'
import { DEFAULT_ORG_CONFIG } from '../../config/org'
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

export const principleDocument = defineType({
  name: 'principle',
  title: 'Principle',
  type: 'document',
  icon: BlockquoteIcon,
  description: DEFAULT_ORG_CONFIG.principleTypeDescription,
  fields: [
    defineField({
      name: 'statement',
      title: 'The principle',
      type: 'string',
      description: DEFAULT_ORG_CONFIG.principleStatementDescription,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'statement' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'elaboration',
      title: 'Elaboration',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The thinking behind it. What does this mean in practice? Where does it come from?',
    }),
    defineField({
      name: 'origin',
      title: 'Origin',
      type: 'string',
      description: 'Where did this come from? Your own experience, a mentor, a book? Attribution builds credibility.',
    }),
    defineField({
      name: 'goodExample',
      title: 'Good example',
      type: 'text',
      rows: 3,
      description: 'A concrete situation where this principle led to better work.',
    }),
    defineField({
      name: 'antiExample',
      title: 'Counter-example',
      type: 'text',
      rows: 3,
      description: 'What does violating this principle look like in practice? Negative examples teach as much as positive ones.',
    }),
    defineField({
      name: 'tension',
      title: 'Tensions',
      type: 'text',
      rows: 2,
      description: 'Are there situations where this principle conflicts with another? Good principles have edges.',
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
  preview: {
    select: {
      title: 'statement',
      subtitle: 'origin',
      confidence: 'confidence',
    },
    prepare({ title, subtitle, confidence }) {
      const icons: Record<string, string> = {
        evergreen: '🌲',
        evolving: '🌱',
        experimental: '🧪',
        retired: '🗄️',
      }
      return {
        title: `${icons[confidence] ?? ''} ${title}`,
        subtitle: subtitle ? `— ${subtitle}` : undefined,
      }
    },
  },
})
