import {defineType, defineField} from 'sanity'
import {ProjectsIcon} from '@sanity/icons'
import {DEFAULT_ORG_CONFIG} from '../../config/org'

export const domainDocument = defineType({
  name: 'domain',
  title: DEFAULT_ORG_CONFIG.taxonomy.domainTypeTitle,
  type: 'document',
  icon: ProjectsIcon,
  description: DEFAULT_ORG_CONFIG.taxonomy.domainTypeDescription,
  fields: [
    defineField({
      name: 'name',
      title: `${DEFAULT_ORG_CONFIG.taxonomy.domainTypeTitle} name`,
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'What this domain covers — scope, typical work, or questions it organises.',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Controls display order. 1 = first.',
    }),
    defineField({
      name: 'color',
      title: 'Colour',
      type: 'string',
      description: 'Optional hex colour for visual differentiation in the studio',
      validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/, {name: 'hex colour'}).warning(),
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', subtitle: 'description'},
    prepare({title, subtitle}) {
      return {title, subtitle}
    },
  },
})
