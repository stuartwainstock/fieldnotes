/**
 * One-off: rename Sanity `phase` → `domain` and `phases` → `domains`.
 * Keeps document IDs stable so embedding metadata refs stay valid.
 *
 * Usage (from repo root, with SANITY_API_TOKEN in .env.local):
 *   npx tsx --env-file=.env.local scripts/migrate-phase-to-domain.ts
 */
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'eff153ps',
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error('SANITY_API_TOKEN is required')
  }

  const phases = await client.fetch(`*[_type == "phase"]`)
  console.log(`Found ${phases.length} phase docs`)

  const tx = client.transaction()
  for (const doc of phases) {
    const {_id, _rev, _createdAt, _updatedAt, ...rest} = doc
    tx.createOrReplace({...rest, _id, _type: 'domain'})
    console.log(`  phase → domain: ${_id} (${doc.name})`)
  }

  const withPhases = await client.fetch(
    `*[defined(phases) && count(phases) > 0]{_id, _type, phases}`,
  )
  console.log(`Found ${withPhases.length} docs with phases[]`)
  for (const doc of withPhases) {
    tx.patch(doc._id, (p) => p.set({domains: doc.phases}).unset(['phases']))
    console.log(`  phases → domains: ${doc._id} (${doc._type})`)
  }

  if (phases.length === 0 && withPhases.length === 0) {
    console.log('Nothing to migrate')
    return
  }

  await tx.commit({visibility: 'sync'})
  const check = await client.fetch(`{
    "domains": count(*[_type == "domain"]),
    "phasesLeft": count(*[_type == "phase"]),
    "withDomains": count(*[defined(domains) && count(domains) > 0]),
    "withPhasesLeft": count(*[defined(phases) && count(phases) > 0])
  }`)
  console.log('Done:', check)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
