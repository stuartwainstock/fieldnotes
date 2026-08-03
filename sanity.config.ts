import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import type {StructureBuilder} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

const SINGLETON_ID = 'siteContent'

function structure(S: StructureBuilder) {
  return S.list()
    .title('Content')
    .items([
      // Singleton: "Site content" opens the one doc directly
      S.listItem()
        .title('Site content')
        .id(SINGLETON_ID)
        .child(S.document().schemaType(SINGLETON_ID).documentId(SINGLETON_ID)),

      S.divider(),

      // All other document types, excluding the singleton
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== SINGLETON_ID,
      ),
    ])
}

export default defineConfig({
  name: 'default',
  title: process.env.SANITY_STUDIO_TITLE || 'fieldnotes',

  // Instance targeting: override via env for a second dataset (e.g. Eleanor Leftwich)
  // without forking schema code. Defaults stay the fieldnotes.design production dataset.
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'eff153ps',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
