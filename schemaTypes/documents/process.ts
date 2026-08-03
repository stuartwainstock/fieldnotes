import { defineType, defineField } from 'sanity'
import { ArrowRightIcon } from '@sanity/icons'
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

export const processDocument = defineType({
  name: 'process',
  title: 'Process',
  type: 'document',
  icon: ArrowRightIcon,
  description: 'A step-by-step way of working. The "how we do things here" knowledge.',
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
      description: 'What this process achieves and why it exists.',
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: 'inputs',
      title: 'Inputs',
      type: 'text',
      rows: 2,
      description: 'What you need to have or know before starting this process.',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [{ type: 'step' }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'outputs',
      title: 'Outputs',
      type: 'text',
      rows: 2,
      description: 'What a completed process produces — decisions made, artifacts created.',
    }),
    defineField({
      name: 'duration',
      title: 'Typical duration',
      type: 'string',
      description: 'e.g. "2 hours", "1–2 days", "ongoing across a sprint"',
    }),
    defineField({
      name: 'signalsOfGoodWork',
      title: 'Signals of good work',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What does a well-run version of this process look like?',
    }),
    defineField({
      name: 'signalsOfPoorWork',
      title: 'Signals of poor work',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'How can you tell this process is being rushed or done superficially?',
    }),
    defineField({
      name: 'commonMistakes',
      title: 'Common mistakes',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'The recurring pitfalls — what goes wrong and why.',
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
