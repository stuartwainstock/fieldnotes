import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'
import { DEFAULT_ORG_CONFIG } from '../../config/org'

const tagLabels = DEFAULT_ORG_CONFIG.taxonomy.tagCategoryLabels

export const tagDocument = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'label' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Groups tags in the UI and helps the agent understand tag intent',
      options: {
        list: [
          { title: tagLabels.discipline, value: 'discipline' },
          { title: tagLabels.activity, value: 'activity' },
          { title: tagLabels.mindset, value: 'mindset' },
          { title: tagLabels.stakeholder, value: 'stakeholder' },
          { title: tagLabels.quality, value: 'quality' },
          { title: tagLabels.tool, value: 'tool' },
          { title: tagLabels.other, value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional clarification for when the tag label alone is ambiguous',
    }),
  ],
  orderings: [
    {
      title: 'Category then label',
      name: 'categoryLabel',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'label', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'label', subtitle: 'category' },
  },
})
