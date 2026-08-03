import { phaseDocument } from './documents/phase'
import { tagDocument } from './documents/tag'
import { sourceAuthorDocument } from './documents/sourceAuthor'
import { frameworkDocument } from './documents/framework'
import { processDocument } from './documents/process'
import { insightDocument } from './documents/insight'
import { principleDocument } from './documents/principle'
import { externalResourceDocument } from './documents/externalResource'
import { glossaryDocument } from './documents/glossary'
import { siteContentDocument } from './documents/siteContent'
import { stepObject } from './objects/step'

export const schemaTypes = [
  // Taxonomy (define first — referenced by document types)
  phaseDocument,
  tagDocument,
  sourceAuthorDocument,

  // Inline objects
  stepObject,

  // Site-level singleton
  siteContentDocument,

  // Core knowledge document types
  frameworkDocument,
  processDocument,
  insightDocument,
  principleDocument,
  externalResourceDocument,
  glossaryDocument,
]
