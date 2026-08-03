import { defineType, defineField } from 'sanity'
import { BookIcon } from '@sanity/icons'
import {
  confidenceField,
  domainField,
  tagsField,
  relatedEntriesField,
  maturityField,
} from '../objects/sharedFields'

export const externalResourceDocument = defineType({
  name: 'externalResource',
  title: 'Reference',
  type: 'document',
  icon: BookIcon,
  description: 'An external resource worth keeping — annotated so the agent knows why it matters.',
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
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'resourceType',
      title: 'Resource type',
      type: 'string',
      options: {
        list: [
          { title: 'Article', value: 'article' },
          { title: 'Book', value: 'book' },
          { title: 'Talk or podcast', value: 'talk' },
          { title: 'Tool or template', value: 'tool' },
          { title: 'Research or report', value: 'research' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'sourceAuthor'}],
      description: 'Same reusable authors as insights — create once, link everywhere.',
    }),
    defineField({
      name: 'whyItMatters',
      title: 'Why it matters',
      type: 'text',
      rows: 3,
      description: 'The agent uses this to decide when to surface this reference. Be specific — "interesting read" is not useful.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key takeaways',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'The two or three things someone should remember from this.',
    }),
    defineField({
      name: 'quotes',
      title: 'Notable quotes',
      type: 'array',
      of: [{ type: 'text' }],
      description: 'Specific lines worth remembering or referencing.',
    }),
    domainField,
    tagsField,
    confidenceField,
    maturityField,
    relatedEntriesField,
  ],
  preview: {
    select: {
      title: 'title',
      authorName: 'author.name',
      resourceType: 'resourceType',
    },
    prepare({ title, authorName, resourceType }) {
      const typeIcons: Record<string, string> = {
        article: '📄',
        book: '📚',
        talk: '🎙️',
        tool: '🔧',
        research: '🔬',
        other: '🔗',
      }
      return {
        title: `${typeIcons[resourceType] ?? '🔗'} ${title}`,
        subtitle: authorName ?? undefined,
      }
    },
  },
})
