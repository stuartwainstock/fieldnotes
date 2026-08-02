import Anthropic from '@anthropic-ai/sdk'
import {NextResponse} from 'next/server'
import {
  exportFilename,
  parseStructuredSlides,
  truncateExportContent,
} from '@/lib/exportSlides'
import {getOrgConfig} from '@/lib/orgConfig'
import {renderPptx} from '@/lib/renderPptx'

export const maxDuration = 60

function checkChatToken(request: Request): boolean {
  const expected = process.env.CHAT_ACCESS_TOKEN
  if (!expected) return true
  const got = request.headers.get('x-chat-access-token')
  return got === expected
}

function buildStructuringPrompt(exportRoleLine: string): string {
  return `${exportRoleLine}

Given the user's question and the assistant's response, create a concise slide deck.

Rules:
- 1-3 slides only. Don't over-split.
- Use the question as context for the deck title.
- Extract key points in presentation-ready language — not verbatim markdown.
- Each slide needs a clear title, 2-5 bullet points, and a one-line takeaway ("so what").
- Be concise. Slides are for presenting, not reading.

Return ONLY valid JSON matching this schema (no markdown fences, no explanation):
{
  "deckTitle": "string — short deck title derived from the question",
  "slides": [
    {
      "title": "string",
      "points": ["string", "string"],
      "takeaway": "string"
    }
  ]
}`
}

function mapAnthropicError(err: unknown): {message: string; status: number} {
  let message = 'Claude request failed'
  let status = 502
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (typeof e.message === 'string') message = e.message
    const httpStatus = e.status
    if (typeof httpStatus === 'number' && httpStatus >= 400 && httpStatus < 600) {
      status = httpStatus
    }
  }
  if (status === 404 && /model|not_found/i.test(message)) {
    status = 400
    message = `${message} — Set ANTHROPIC_MODEL to a current model (e.g. claude-sonnet-4-6) or remove it to use the app default.`
  }
  return {message, status}
}

async function structureIntoSlides(
  question: string,
  content: string,
  apiKey: string,
  exportRoleLine: string,
) {
  const client = new Anthropic({apiKey})
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'

  let response: Anthropic.Messages.Message
  try {
    response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: buildStructuringPrompt(exportRoleLine),
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\n\nAssistant response:\n${truncateExportContent(content)}`,
        },
      ],
      temperature: 0.2,
    })
  } catch (err) {
    const {message, status} = mapAnthropicError(err)
    throw Object.assign(new Error(message), {httpStatus: status})
  }

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Model returned invalid JSON for slides')
  }

  return parseStructuredSlides(parsed)
}

export async function POST(request: Request) {
  if (!checkChatToken(request)) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {error: 'Server missing ANTHROPIC_API_KEY.'},
      {status: 503},
    )
  }

  let body: {content?: string; question?: string}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400})
  }

  const content = body.content?.trim()
  const question = body.question?.trim() ?? 'Design knowledge'
  if (!content) {
    return NextResponse.json({error: 'content is required'}, {status: 400})
  }

  try {
    const org = await getOrgConfig()
    const structured = await structureIntoSlides(
      question,
      content,
      apiKey,
      org.exportRoleLine,
    )
    const buffer = await renderPptx(structured)
    const filename = exportFilename(structured.deckTitle)

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[api/export] Export failed', err)
    const httpStatus =
      err && typeof err === 'object' && typeof (err as {httpStatus?: number}).httpStatus === 'number'
        ? (err as {httpStatus: number}).httpStatus
        : 502
    const message = err instanceof Error ? err.message : 'Export failed'
    return NextResponse.json({error: message}, {status: httpStatus})
  }
}
