/**
 * Re-trigger sanity-webhook for all knowledge documents.
 * Run after changing the webhook flattener (e.g. adding sourceUrl to embeddings).
 *
 * Usage:
 *   SUPABASE_URL=... npx tsx scripts/reindex-knowledge-embeddings.ts
 *   npx tsx scripts/reindex-knowledge-embeddings.ts --dry-run
 *
 * Reads SUPABASE_URL from env (or web/.env.local via dotenv if you add it).
 * Optional: SANITY_API_TOKEN for authenticated Sanity reads (usually not required).
 */

import {createClient} from '@sanity/client'
import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ID = 'eff153ps'
const DATASET = 'production'
const DRY_RUN = process.argv.includes('--dry-run')

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), 'web', '.env.local')
  if (!fs.existsSync(envPath)) return
  const text = fs.readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (!m || process.env[m[1]]) continue
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

loadEnvLocal()

const supabaseUrl = process.env.SUPABASE_URL
if (!supabaseUrl && !DRY_RUN) {
  console.error('❌ Set SUPABASE_URL (e.g. from web/.env.local)')
  process.exit(1)
}

const webhookUrl = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/sanity-webhook`
  : ''

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const KNOWLEDGE_TYPES = [
  'framework',
  'process',
  'insight',
  'principle',
  'externalResource',
  'glossary',
] as const

async function main() {
  const ids = await client.fetch<{_id: string; _type: string}[]>(
    `*[_type in $types && !(_id in path("drafts.**"))]{_id, _type}`,
    {types: KNOWLEDGE_TYPES},
  )

  console.log(`Found ${ids.length} knowledge documents`)
  if (DRY_RUN) {
    console.log('Dry run — would POST to', webhookUrl)
    ids.slice(0, 5).forEach((d) => console.log(' ', d._type, d._id))
    if (ids.length > 5) console.log(`  … and ${ids.length - 5} more`)
    return
  }

  let ok = 0
  let fail = 0
  for (const doc of ids) {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({_id: doc._id, _type: doc._type, transition: 'update'}),
    })
    const body = await res.text()
    if (res.ok) {
      ok++
      process.stdout.write('.')
    } else {
      fail++
      console.error(`\n✗ ${doc._id}: ${res.status} ${body.slice(0, 120)}`)
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
