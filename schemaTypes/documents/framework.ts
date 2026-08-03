import { defineType, defineField } from 'sanity'
import { ComponentIcon } from '@sanity/icons'
import {
  confidenceField,
  domainField,
  tagsField,
  relatedEntriesField,
  maturityField,
  sourceAuthorField,
  sourceTitleField,
  sourceUrlField,
} from '../objects/sharedFields'

export const frameworkDocument = defineType({
  name: 'framework',
  title: 'Framework',
  type: 'document',
  icon: ComponentIcon,
  description: 'A mental model, method, or structured way of thinking. The "what to use when" knowledge.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'One to three sentences. This is what the agent surfaces first — make it sharp.',
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: 'body',
      title: 'Full explanation',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The complete picture. Write it as if explaining to a smart new team member.',
    }),
    defineField({
      name: 'whenToUse',
      title: 'When to use this',
      type: 'text',
      rows: 4,
      description: 'Specific situations, triggers, or questions that call for this framework.',
    }),
    defineField({
      name: 'antiPatterns',
      title: 'When NOT to use this',
      type: 'text',
      rows: 3,
      description: 'The traps — situations where people reach for this but shouldn\'t.',
    }),
    defineField({
      name: 'signalsOfGoodWork',
      title: 'Signals of good work',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Observable tells that this is being applied well. What does good look like?',
    }),
    defineField({
      name: 'signalsOfPoorWork',
      title: 'Signals of poor work',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Red flags. What does going through the motions look like vs. doing it well?',
    }),
    defineField({
      name: 'commonMistakes',
      title: 'Common mistakes',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'The recurring pitfalls you\'ve seen teams fall into.',
    }),
    sourceAuthorField,
    sourceTitleField,
    sourceUrlField,
    domainField,
    tagsField,
    confidenceField,
    maturityField,
    relatedEntriesField,
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'summary',
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
        subtitle,
      }
    },
  },
})
