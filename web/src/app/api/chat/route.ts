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
import {buildChatSystemPrompt} from '@/lib/chatSystemPrompt'
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

  const system = buildChatSystemPrompt(
    {agentRoleLine: org.agentRoleLine, northStarLine: org.northStarLine},
    retrievalMethod,
    contextJson,
  )

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
