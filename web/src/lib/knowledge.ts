/**
 * Knowledge retrieval — two strategies:
 *
 * 1. RAG (primary): Embed the user's question via the Supabase `rag-query`
 *    Edge Function, which performs vector similarity search and returns the
 *    most relevant documents. Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * 2. Sanity GROQ (fallback): Fetch the most recent documents directly from
 *    Sanity. Used when Supabase isn't configured or the RAG call fails.
 */

import {getSanityReadClient} from './sanity'

// ── Types ────────────────────────────────────────────────────────────

export type KnowledgeMatch = {
  sanity_id: string
  document_type: string
  title: string
  content_text: string
  metadata: Record<string, unknown>
  similarity: number
}

export type KnowledgeSnippet = Record<string, unknown>

// ── RAG retrieval (primary) ──────────────────────────────────────────

function getSupabaseConfig(): {url: string; key: string} | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return {url, key}
}

/** Call the rag-query Edge Function for semantic search. */
export async function fetchRAGContext(
  question: string,
  options?: {
    matchCount?: number
    filterType?: string
    filterConfidence?: string
    filterDomain?: string
  },
): Promise<KnowledgeMatch[]> {
  const config = getSupabaseConfig()
  if (!config) throw new Error('Supabase not configured for RAG')

  const res = await fetch(`${config.url}/functions/v1/rag-query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.key}`,
      apikey: config.key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: question,
      match_count: options?.matchCount ?? 8,
      filter_type: options?.filterType ?? null,
      filter_confidence: options?.filterConfidence ?? null,
      filter_domain: options?.filterDomain ?? null,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`rag-query failed: ${res.status} ${err}`)
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error('rag-query returned non-JSON body')
  }

  return normalizeRagMatches(data)
}

/** Accept common Edge Function response shapes. */
function normalizeRagMatches(data: unknown): KnowledgeMatch[] {
  if (!data || typeof data !== 'object') return []
  const o = data as Record<string, unknown>
  const raw =
    (Array.isArray(o.matches) && o.matches) ||
    (Array.isArray(o.results) && o.results) ||
    (Array.isArray(o.data) && o.data) ||
    (o.data &&
      typeof o.data === 'object' &&
      Array.isArray((o.data as Record<string, unknown>).matches) &&
      (o.data as Record<string, unknown>).matches) ||
    []

  const list = raw as unknown[]
  return list.filter((m): m is KnowledgeMatch => {
    if (!m || typeof m !== 'object') return false
    const row = m as Record<string, unknown>
    return (
      typeof row.sanity_id === 'string' ||
      typeof row.document_type === 'string' ||
      typeof row.title === 'string' ||
      typeof row.content_text === 'string'
    )
  }) as KnowledgeMatch[]
}

function linkFromMetadata(metadata: Record<string, unknown> | undefined): string | undefined {
  if (!metadata) return undefined
  const sourceUrl = metadata.sourceUrl
  if (typeof sourceUrl === 'string' && sourceUrl.trim()) return sourceUrl.trim()
  const url = metadata.url
  if (typeof url === 'string' && url.trim()) return url.trim()
  return undefined
}

function sourceTitleFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | undefined {
  const t = metadata?.sourceTitle
  return typeof t === 'string' && t.trim() ? t.trim() : undefined
}

/** Format RAG matches as context for the Claude system prompt. */
export function matchesToContextJson(matches: KnowledgeMatch[], maxChars = 24000): string {
  const compact = matches.map((m) => {
    const sim = typeof m.similarity === 'number' && !Number.isNaN(m.similarity) ? m.similarity : 0
    const sourceUrl = linkFromMetadata(m.metadata)
    const sourceTitle = sourceTitleFromMetadata(m.metadata)
    return {
      type: m.document_type ?? 'unknown',
      title: m.title ?? '',
      content: m.content_text ?? '',
      ...(sourceTitle ? {sourceTitle} : {}),
      ...(sourceUrl ? {sourceUrl} : {}),
      confidence: (m.metadata?.confidence as string) ?? undefined,
      maturity: (m.metadata?.maturity as string) ?? undefined,
      status: (m.metadata?.status as string) ?? undefined,
      similarity: Math.round(sim * 1000) / 1000,
    }
  })
  let text = JSON.stringify(compact, null, 0)
  if (text.length > maxChars) {
    text = text.slice(0, maxChars) + '\n…(truncated)'
  }
  return text
}

// ── Sanity GROQ fallback ─────────────────────────────────────────────

const KNOWLEDGE_SNIPPET_QUERY = `*[_type in $types]|order(_updatedAt desc)[0...40]{
  _type,
  _id,
  title,
  name,
  statement,
  term,
  expansion,
  category,
  decision,
  status,
  alternativesConsidered,
  summary,
  quote,
  "myTake": pt::text(myTake),
  "definition": pt::text(definition),
  "context": pt::text(context),
  "outcome": pt::text(outcome),
  implications,
  "elaboration": pt::text(elaboration),
  whyItMatters,
  keyTakeaways,
  confidence,
  maturity,
  "slug": slug.current,
  "sourceAuthor": sourceAuthor->name,
  "owner": owner->name,
  sourceTitle,
  sourceUrl,
  url,
  "author": author->name,
  "resourceType": resourceType
}`

export async function fetchSanityFallbackContext(): Promise<KnowledgeSnippet[]> {
  const sanity = getSanityReadClient()
  return sanity.fetch(KNOWLEDGE_SNIPPET_QUERY, {
    types: [
      'framework',
      'process',
      'insight',
      'principle',
      'externalResource',
      'glossary',
      'decision',
    ],
  })
}

export function snippetsToContextJson(rows: KnowledgeSnippet[], maxChars = 14000): string {
  const compact = rows.map((r) => {
    const label =
      (r.title as string) ||
      (r.name as string) ||
      (r.statement as string) ||
      (r.term as string) ||
      (r.decision as string) ||
      (r._id as string)
    return {
      type: r._type,
      label,
      slug: r.slug,
      summary: r.summary,
      statement: r.statement,
      quote: r.quote,
      myTake: r.myTake,
      implications: r.implications,
      elaboration: r.elaboration,
      whyItMatters: r.whyItMatters,
      keyTakeaways: r.keyTakeaways,
      decision: r.decision,
      context: r.context,
      alternativesConsidered: r.alternativesConsidered,
      outcome: r.outcome,
      owner: r.owner,
      status: r.status,
      confidence: r.confidence,
      maturity: r.maturity,
      sourceAuthor: r.sourceAuthor,
      sourceTitle: r.sourceTitle,
      sourceUrl: (r.sourceUrl as string) ?? (r.url as string) ?? undefined,
      author: r.author,
      resourceType: r.resourceType,
    }
  })
  let text = JSON.stringify(compact, null, 0)
  if (text.length > maxChars) {
    text = text.slice(0, maxChars) + '\n…(truncated)'
  }
  return text
}

// ── Unified retrieval ────────────────────────────────────────────────

/** Returns true if Supabase RAG is available. */
export function isRAGAvailable(): boolean {
  return getSupabaseConfig() !== null
}
