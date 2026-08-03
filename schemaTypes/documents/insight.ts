import { defineType, defineField } from 'sanity'
import { BulbOutlineIcon } from '@sanity/icons'
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

export const insightDocument = defineType({
  name: 'insight',
  title: 'Insight',
  type: 'document',
  icon: BulbOutlineIcon,
  description: 'A learning from research, reading, or lived experience — with your interpretation attached.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'A short, memorable label for this insight. Not the quote — your framing of it.',
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
      name: 'quote',
      title: 'Source quote or observation',
      type: 'text',
      rows: 4,
      description: 'The raw material — a pull quote, a research finding, or an observation.',
    }),
    defineField({
      name: 'myTake',
      title: 'My take',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Your interpretation. Why does this matter? What does it mean for how your team works? This is the most valuable field — it\'s what makes this your knowledge base, not just a bookmark list.',
    }),
    defineField({
      name: 'implications',
      title: 'Practical implications',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What should someone do differently because of this insight?',
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
      authorName: 'sourceAuthor.name',
      confidence: 'confidence',
    },
    prepare({ title, authorName, confidence }) {
      const icons: Record<string, string> = {
        evergreen: '🌲',
        evolving: '🌱',
        experimental: '🧪',
        retired: '🗄️',
      }
      return {
        title: `${icons[confidence] ?? ''} ${title}`,
        subtitle: authorName ? `via ${authorName}` : undefined,
      }
    },
  },
})
