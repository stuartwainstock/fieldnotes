import Anthropic from '@anthropic-ai/sdk'
import type {MessageParam} from '@anthropic-ai/sdk/resources/messages'
import {NextResponse} from 'next/server'
import {
  fetchRAGContext,
  matchesToContextJson,
  fetchSanityFallbackContext,
  snippetsToContextJson,
  isRAGAvailable,
} from '@/lib/knowledge'
import {getOrgConfig} from '@/lib/orgConfig'
import {logQuery} from '@/lib/queryLog'

export const maxDuration = 60

type ChatMessage = {role: 'user' | 'assistant'; content: string}

function checkChatToken(request: Request): boolean {
  const expected = process.env.CHAT_ACCESS_TOKEN
  if (!expected) return true
  const got = request.headers.get('x-chat-access-token')
  return got === expected
}

/** Anthropic requires alternating user/assistant; merge consecutive same-role turns. */
function toAnthropicMessages(messages: ChatMessage[]): MessageParam[] {
  const trimmed = messages.filter((m) => m?.content?.trim())
  while (trimmed.length && trimmed[0].role === 'assistant') trimmed.shift()
  const out: MessageParam[] = []
  for (const m of trimmed) {
    const last = out[out.length - 1]
    if (last && last.role === m.role) {
      last.content = `${last.content}\n\n${m.content}`
    } else {
      out.push({role: m.role, content: m.content})
    }
  }
  return out
}

function extractTextFromMessage(msg: Anthropic.Messages.Message): string {
  const parts: string[] = []
  for (const block of msg.content) {
    if (block.type === 'text') parts.push(block.text)
  }
  return parts.join('\n').trim()
}

/** Extract the latest user question from the message history. */
function getLatestQuestion(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user' && messages[i].content.trim()) {
      return messages[i].content.trim()
    }
  }
  return ''
}

/** Bounded context for Claude: RAG when configured, else (or on empty/error) Sanity GROQ. */
async function retrieveChatContext(raw: ChatMessage[]): Promise<{
  contextJson: string
  retrievalMethod: string
}> {
  const question = getLatestQuestion(raw)

  async function loadSanityGroq(label: string) {
    const rows = await fetchSanityFallbackContext()
    return {
      contextJson: snippetsToContextJson(rows),
      retrievalMethod: label,
    }
  }

  if (isRAGAvailable() && question) {
    try {
      const matches = await fetchRAGContext(question)
      if (matches.length > 0) {
        return {
          contextJson: matchesToContextJson(matches),
          retrievalMethod: 'rag',
        }
      }
      return loadSanityGroq('sanity-groq-empty-rag')
    } catch {
      return loadSanityGroq('sanity-groq-fallback')
    }
  }

  return loadSanityGroq(
    isRAGAvailable() && !question ? 'sanity-groq-no-question' : 'sanity-groq',
  )
}

export async function POST(request: Request) {
  if (!checkChatToken(request)) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {error: 'Server missing ANTHROPIC_API_KEY. Add it to web/.env.local.'},
      {status: 503},
    )
  }

  let body: {messages?: ChatMessage[]}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400})
  }

  const raw = body.messages?.filter((m) => m?.role && m?.content) ?? []
  if (!raw.length) {
    return NextResponse.json({error: 'messages[] required'}, {status: 400})
  }

  const anthropicMessages = toAnthropicMessages(raw)
  if (!anthropicMessages.length || anthropicMessages[0].role !== 'user') {
    return NextResponse.json({error: 'Include at least one user message'}, {status: 400})
  }

  let contextJson: string
  let retrievalMethod: string
  try {
    const ctx = await retrieveChatContext(raw)
    contextJson = ctx.contextJson
    retrievalMethod = ctx.retrievalMethod
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Context retrieval failed'
    return NextResponse.json({error: msg}, {status: 502})
  }

  // Fire-and-forget query log — never blocks the response
  const question = getLatestQuestion(raw)
  if (question) {
    let matchedTypes: string[] = []
    try {
      const parsed = JSON.parse(contextJson) as {type?: string}[]
      if (Array.isArray(parsed)) {
        matchedTypes = [...new Set(parsed.map((d) => d.type).filter(Boolean) as string[])]
      }
    } catch {
      /* context may not be parseable — that's fine */
    }
    void logQuery({question, retrievalMethod, matchedTypes})
  }

  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'
  const org = await getOrgConfig()

  const system = `${org.agentRoleLine}
North star: ${org.northStarLine}
You must answer ONLY from the CONTEXT below (retrieved from their knowledge base).
If the answer is not supported by CONTEXT, say you do not have that in the knowledge base and suggest what kind of entry would help.

Guidelines for using context:
- Cite entry types and titles when possible (e.g. "The framework 'How Might We' suggests…").
- When an entry includes sourceUrl (or sourceTitle), include the full URL as a markdown link so readers can open the original resource (e.g. [Source title](https://…) or [Read more](https://…) if no title). Use only URLs present in context — never guess links.
- When an entry has a confidence level, reflect it: state evergreen knowledge with confidence, caveat experimental knowledge, and flag retired entries.
- When an entry has a maturity level, calibrate your depth: give more foundational context for onboarding-level content, be more concise and nuanced for senior-level content.
- Do not invent authors, sources, URLs, or knowledge not present in context.
- Be concise but opinionated — the knowledge base is designed to embody judgment, not just retrieve notes.

CONTEXT (retrieval: ${retrievalMethod}):
${contextJson}`

  const client = new Anthropic({apiKey})

  let response: Anthropic.Messages.Message
  try {
    response = await client.messages.create({
      model,
      max_tokens: 4096,
      system,
      messages: anthropicMessages,
      temperature: 0.3,
    })
  } catch (err: unknown) {
    console.error('[api/chat] Anthropic messages.create failed', err)
    let message = 'Claude request failed'
    let httpStatus = 502
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>
      if (typeof e.message === 'string') message = e.message
      const status = e.status
      if (typeof status === 'number' && status >= 400 && status < 600) httpStatus = status
    }
    // Anthropic returns HTTP 404 for unknown/retired model ids — don't reuse 404 here or clients think /api/chat is missing.
    if (httpStatus === 404 && /model|not_found/i.test(message)) {
      httpStatus = 400
      message = `${message} — Set ANTHROPIC_MODEL to a current model (e.g. claude-sonnet-4-6) or remove it to use the app default.`
    }
    return NextResponse.json({error: message}, {status: httpStatus})
  }

  const text = extractTextFromMessage(response)
  if (!text) {
    return NextResponse.json({error: 'Empty model response'}, {status: 502})
  }

  return NextResponse.json({reply: text})
}
