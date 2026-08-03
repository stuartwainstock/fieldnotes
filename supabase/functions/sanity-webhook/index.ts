import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.108.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SANITY_PROJECT_ID = Deno.env.get('SANITY_PROJECT_ID') ?? 'eff153ps'
const SANITY_DATASET = Deno.env.get('SANITY_DATASET') ?? 'production'
const SANITY_API_TOKEN = Deno.env.get('SANITY_API_TOKEN') ?? ''

const EMBEDDING_MODEL = 'text-embedding-3-small'
const KNOWLEDGE_TYPES = new Set([
  'framework',
  'process',
  'insight',
  'principle',
  'externalResource',
  'glossary',
  'decision',
])

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function portableTextToPlain(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter((b: {_type?: string}) => b._type === 'block')
    .map((b: {children?: {text?: string}[]}) =>
      (b.children ?? []).map((c) => c.text ?? '').join(''),
    )
    .join('\n')
}

/** Build a single text blob from a Sanity document for embedding. */
function documentToText(doc: Record<string, unknown>): string {
  const parts: string[] = []
  const add = (label: string, val: unknown) => {
    if (typeof val === 'string' && val.trim()) parts.push(`${label}: ${val.trim()}`)
  }
  const addArray = (label: string, val: unknown) => {
    if (Array.isArray(val) && val.length) parts.push(`${label}: ${val.join('; ')}`)
  }

  add('Title', doc.title ?? doc.statement ?? doc.term ?? doc.decision ?? doc.name)
  add('Type', doc._type)
  add('Summary', doc.summary)
  add('Expansion', doc.expansion)
  add('Category', doc.category)
  add('Status', doc.status)

  const bodyText = portableTextToPlain(
    doc.body ?? doc.elaboration ?? doc.myTake ?? doc.definition,
  )
  if (bodyText) parts.push(`Body: ${bodyText}`)

  const contextText = portableTextToPlain(doc.context)
  if (contextText) parts.push(`Context: ${contextText}`)

  const outcomeText = portableTextToPlain(doc.outcome)
  if (outcomeText) parts.push(`Outcome: ${outcomeText}`)

  add('When to use', doc.whenToUse)
  add('Anti-patterns', doc.antiPatterns)
  add('Quote', doc.quote)
  add('Inputs', doc.inputs)
  add('Outputs', doc.outputs)
  add('Duration', doc.duration)
  add('Why it matters', doc.whyItMatters)
  add('Good example', doc.goodExample)
  add('Counter-example', doc.antiExample)
  add('Tension', doc.tension)
  add('Origin', doc.origin)
  add('Source title', doc.sourceTitle)
  add('Source URL', doc.sourceUrl)
  add('URL', doc.url)
  addArray('Signals of good work', doc.signalsOfGoodWork)
  addArray('Signals of poor work', doc.signalsOfPoorWork)
  addArray('Common mistakes', doc.commonMistakes)
  addArray('Key takeaways', doc.keyTakeaways)
  addArray('Implications', doc.implications)
  addArray('Alternatives considered', doc.alternativesConsidered)

  if (Array.isArray(doc.steps)) {
    const stepText = doc.steps
      .map((s: {title?: string; description?: unknown}, i: number) => {
        const desc = portableTextToPlain(s.description)
        return `Step ${i + 1}: ${s.title ?? ''}${desc ? ` — ${desc}` : ''}`
      })
      .join('\n')
    if (stepText) parts.push(`Steps:\n${stepText}`)
  }

  return parts.join('\n')
}

function buildMetadata(doc: Record<string, unknown>): Record<string, unknown> {
  const metadata: Record<string, unknown> = {}
  if (doc.confidence) metadata.confidence = doc.confidence
  if (doc.maturity) metadata.maturity = doc.maturity
  if (Array.isArray(doc.domains)) {
    metadata.domains = doc.domains.map((p: {_ref?: string}) => p._ref ?? p)
  }
  if (Array.isArray(doc.tags)) {
    metadata.tags = doc.tags.map((t: {_ref?: string}) => t._ref ?? t)
  }
  if (typeof doc.sourceTitle === 'string' && doc.sourceTitle.trim()) {
    metadata.sourceTitle = doc.sourceTitle.trim()
  }
  if (typeof doc.sourceUrl === 'string' && doc.sourceUrl.trim()) {
    metadata.sourceUrl = doc.sourceUrl.trim()
  }
  if (typeof doc.url === 'string' && doc.url.trim()) {
    metadata.url = doc.url.trim()
  }
  if (typeof doc.status === 'string' && doc.status.trim()) {
    metadata.status = doc.status.trim()
  }
  return metadata
}

async function fetchSanityDocument(
  id: string,
): Promise<Record<string, unknown> | null> {
  const query = encodeURIComponent(`*[_id == "${id}"][0]`)
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`
  const headers: Record<string, string> = {}
  if (SANITY_API_TOKEN) headers.Authorization = `Bearer ${SANITY_API_TOKEN}`
  const res = await fetch(url, {headers})
  if (!res.ok) {
    console.error('Sanity fetch failed', res.status, await res.text())
    return null
  }
  const json = await res.json()
  return json.result ?? null
}

async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({model: EMBEDDING_MODEL, input: text}),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI embeddings error: ${res.status} ${err}`)
  }
  const json = await res.json()
  return json.data[0].embedding
}

async function logWebhook(
  sanityId: string,
  event: string,
  status: string,
  errorDetail?: string,
) {
  await supabase.from('webhook_log').insert({
    sanity_id: sanityId,
    event,
    status,
    error_detail: errorDetail ?? null,
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {status: 405})
  }

  const body = await req.text()

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', {status: 400})
  }

  const sanityId = String(payload._id ?? payload.documentId ?? '')
  const docType = String(payload._type ?? '')
  const transition =
    req.headers.get('sanity-webhook-transition') ??
    String(payload.transition ?? payload.event ?? 'update')

  if (!sanityId) {
    return new Response(
      JSON.stringify({skipped: true, reason: 'no _id'}),
      {headers: {'Content-Type': 'application/json'}},
    )
  }

  if (transition === 'delete' || transition === 'unpublish') {
    await supabase.from('knowledge_embeddings').delete().eq('sanity_id', sanityId)
    await logWebhook(sanityId, transition, 'success')
    return new Response(JSON.stringify({ok: true, event: transition}), {
      headers: {'Content-Type': 'application/json'},
    })
  }

  if (docType && !KNOWLEDGE_TYPES.has(docType)) {
    return new Response(
      JSON.stringify({skipped: true, reason: `type ${docType} not indexed`}),
      {headers: {'Content-Type': 'application/json'}},
    )
  }

  try {
    const doc = await fetchSanityDocument(sanityId)
    if (!doc) {
      await logWebhook(sanityId, transition, 'error', 'Document not found in Sanity')
      return new Response(JSON.stringify({error: 'Document not found'}), {
        status: 404,
      })
    }

    if (!KNOWLEDGE_TYPES.has(String(doc._type))) {
      return new Response(
        JSON.stringify({skipped: true, reason: `type ${doc._type} not indexed`}),
        {headers: {'Content-Type': 'application/json'}},
      )
    }

    const contentText = documentToText(doc)
    if (!contentText.trim()) {
      await logWebhook(sanityId, transition, 'error', 'Empty content after extraction')
      return new Response(JSON.stringify({skipped: true, reason: 'empty content'}), {
        headers: {'Content-Type': 'application/json'},
      })
    }

    const embedding = await generateEmbedding(contentText)
    const metadata = buildMetadata(doc)
    const title = String(doc.title ?? doc.statement ?? doc.term ?? doc.decision ?? doc.name ?? sanityId)

    const {error: upsertError} = await supabase.from('knowledge_embeddings').upsert(
      {
        sanity_id: sanityId,
        document_type: doc._type,
        title,
        content_text: contentText,
        embedding: JSON.stringify(embedding),
        metadata,
        updated_at: new Date().toISOString(),
      },
      {onConflict: 'sanity_id'},
    )

    if (upsertError) throw upsertError

    await logWebhook(sanityId, transition, 'success')
    return new Response(JSON.stringify({ok: true, sanity_id: sanityId, title}), {
      headers: {'Content-Type': 'application/json'},
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Webhook processing error', msg)
    await logWebhook(sanityId, transition, 'error', msg)
    return new Response(JSON.stringify({error: msg}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    })
  }
})
