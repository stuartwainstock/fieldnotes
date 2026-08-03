'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {AssistantMarkdown} from '@/components/AssistantMarkdown'
import {ExportSlidesButton} from '@/components/ExportSlidesButton'

type Msg = {role: 'user' | 'assistant'; content: string}

type ChatPanelProps = {
  requiresAccessToken: boolean
  emptyMessage?: string
  starters?: string[]
}

const DEFAULT_STARTERS = [
  'What frameworks help with problem framing?',
  'Walk me through our discovery process',
  'What principles guide critique?',
]

const DEFAULT_EMPTY =
  'Ask about frameworks, processes, principles, or insights.\nAnswers come from your published knowledge base.'

export function ChatPanel({requiresAccessToken, emptyMessage, starters}: ChatPanelProps) {
  const [token, setToken] = useState('')
  const [storedToken, setStoredToken] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportingIdx, setExportingIdx] = useState<number | null>(null)
  const questionRef = useRef<HTMLDivElement>(null)

  const effectiveToken = useMemo(() => {
    if (typeof window === 'undefined') return ''
    if (storedToken) return storedToken
    try {
      return sessionStorage.getItem('chatAccessToken') ?? ''
    } catch {
      return ''
    }
  }, [storedToken])

  const saveToken = useCallback(() => {
    const v = token.trim()
    if (!v) return
    try {
      sessionStorage.setItem('chatAccessToken', v)
    } catch {
      /* ignore */
    }
    setStoredToken(v)
    setToken('')
  }, [token])

  /* Index of the most recent user message, used as the scroll anchor */
  const lastUserIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i
    }
    return -1
  }, [messages])

  /*
   * When the user sends a question, pin it near the top of the viewport and let
   * the answer render below it — readers start at the beginning and scroll at
   * their own pace. We deliberately do NOT scroll when the assistant reply
   * arrives, so the view stays put instead of jumping to the end.
   */
  useEffect(() => {
    if (messages[messages.length - 1]?.role !== 'user') return
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    questionRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [messages])

  const send = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim()
      if (!text || loading) return
      setError(null)
      const next: Msg[] = [...messages, {role: 'user', content: text}]
      setMessages(next)
      setInput('')
      setLoading(true)
      try {
        const headers: Record<string, string> = {'Content-Type': 'application/json'}
        if (requiresAccessToken && effectiveToken) {
          headers['x-chat-access-token'] = effectiveToken
        }
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({messages: [...next]}),
        })
        const rawBody = await res.text()
        let data: {reply?: string; error?: string}
        try {
          data = JSON.parse(rawBody) as {reply?: string; error?: string}
        } catch {
          data = {error: rawBody.slice(0, 500) || res.statusText}
        }
        if (!res.ok) {
          throw new Error(data.error ?? res.statusText)
        }
        if (!data.reply) throw new Error('No reply')
        setMessages((m) => [...m, {role: 'assistant', content: data.reply!}])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Request failed')
      } finally {
        setLoading(false)
      }
    },
    [effectiveToken, input, loading, messages, requiresAccessToken],
  )

  /* ── Export assistant message as PPTX ── */
  const exportSlides = useCallback(
    async (msgIndex: number) => {
      const msg = messages[msgIndex]
      if (!msg || msg.role !== 'assistant') return

      // Find the preceding user message as the question
      let question = 'Knowledge'
      for (let j = msgIndex - 1; j >= 0; j--) {
        if (messages[j].role === 'user' && messages[j].content.trim()) {
          question = messages[j].content.trim()
          break
        }
      }

      setExportingIdx(msgIndex)
      try {
        const headers: Record<string, string> = {'Content-Type': 'application/json'}
        if (requiresAccessToken && effectiveToken) {
          headers['x-chat-access-token'] = effectiveToken
        }
        const res = await fetch('/api/export', {
          method: 'POST',
          headers,
          body: JSON.stringify({content: msg.content, question}),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({error: res.statusText}))
          throw new Error((errData as {error?: string}).error ?? 'Export failed')
        }
        // Trigger browser download from the binary response
        const blob = await res.blob()
        const disposition = res.headers.get('Content-Disposition') ?? ''
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/)
        const filename = filenameMatch?.[1] ?? 'slides.pptx'

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Export failed')
      } finally {
        setExportingIdx(null)
      }
    },
    [effectiveToken, messages, requiresAccessToken],
  )

  /* ── Token gate ── */
  if (requiresAccessToken && !effectiveToken) {
    return (
      <div className="border-border-playful bg-surface mx-auto max-w-lg space-y-5 rounded-3xl border-2 p-7 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="bg-sunshine/30 flex size-10 items-center justify-center rounded-full text-lg">
            🔑
          </span>
          <h2 className="text-brand text-lg font-extrabold">Team access</h2>
        </div>
        <p className="text-muted text-sm font-semibold leading-relaxed">
          Enter the shared token your admin configured (
          <code className="bg-sunshine-wash text-brand font-mono rounded-md px-1.5 py-0.5 text-xs font-bold">
            CHAT_ACCESS_TOKEN
          </code>{' '}
          on the server).
        </p>
        <label htmlFor="chat-access-token" className="sr-only">
          Team access token
        </label>
        <input
          id="chat-access-token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveToken()
          }}
          autoComplete="off"
          className="border-border-playful bg-surface-elevated w-full rounded-2xl border-2 px-4 py-3 text-sm font-semibold outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-brand/40"
          placeholder="Paste access token"
        />
        <button
          type="button"
          onClick={saveToken}
          className="bg-cta hover:bg-cta-hover hover-lift rounded-full px-6 py-2.5 text-sm font-extrabold text-white uppercase tracking-wide shadow-sm transition-colors"
        >
          Continue
        </button>
      </div>
    )
  }

  /* ── Chat interface ── */
  return (
    <div className="relative mx-auto flex max-w-2xl flex-col gap-4">
      {/* Error banner */}
      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3">
          <span className="mt-0.5 text-base" aria-hidden>
            ⚠️
          </span>
          <p className="text-sm font-semibold text-red-900">{error}</p>
        </div>
      ) : null}

      {/* Messages area */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation"
        className="border-border-playful bg-surface min-h-[360px] space-y-4 rounded-3xl border-2 p-5 shadow-lg md:p-6"
      >
        {/* Empty state with starters */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="flex gap-1.5" aria-hidden>
              <span className="bg-sunshine animate-bounce-gentle size-3 rounded-full" />
              <span
                className="bg-cta-accent animate-bounce-gentle size-3 rounded-full"
                style={{animationDelay: '0.15s'}}
              />
              <span
                className="bg-brand animate-bounce-gentle size-3 rounded-full"
                style={{animationDelay: '0.3s'}}
              />
            </div>
            <p className="text-muted text-center text-sm font-semibold leading-relaxed">
              {(emptyMessage ?? DEFAULT_EMPTY).split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {(starters ?? DEFAULT_STARTERS).map((s, idx) => (
                <button
                  key={`${idx}-${s}`}
                  type="button"
                  onClick={() => void send(s)}
                  className="border-border-playful text-brand hover:bg-sunshine-wash hover-lift rounded-full border-2 px-4 py-2 text-xs font-bold transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Message bubbles */}
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            ref={i === lastUserIndex ? questionRef : undefined}
            className="scroll-mt-24"
          >
            <div
              className={
                m.role === 'user'
                  ? 'bg-brand text-white ml-8 rounded-2xl rounded-br-md px-4 py-3 text-sm font-medium shadow-sm md:ml-16'
                  : 'border-border-playful bg-surface-elevated text-foreground mr-8 rounded-2xl rounded-bl-md border-2 px-4 py-3 text-sm font-medium shadow-sm md:mr-16'
              }
            >
              {/* Role badge */}
              <span
                className={`mb-1.5 inline-flex items-center gap-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] ${
                  m.role === 'user' ? 'text-white/90' : 'text-brand'
                }`}
              >
                <span
                  className={`inline-block size-1.5 rounded-full ${
                    m.role === 'user' ? 'bg-white/70' : 'bg-brand/60'
                  }`}
                  aria-hidden
                />
                {m.role === 'user' ? 'You' : 'Knowledge base'}
              </span>
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              ) : (
                <AssistantMarkdown content={m.content} />
              )}
            </div>

            {/* Export CTA — below assistant messages, not while loading */}
            {m.role === 'assistant' && !loading && (
              <div className="mr-8 mt-1.5 flex md:mr-16">
                <ExportSlidesButton
                  disabled={exportingIdx !== null}
                  loading={exportingIdx === i}
                  onClick={() => void exportSlides(i)}
                />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading ? (
          <div className="mr-8 flex items-center gap-3 md:mr-16">
            <p className="sr-only" role="status" aria-live="polite">
              Knowledge base is thinking
            </p>
            <div
              className="border-border-playful bg-surface-elevated flex items-center gap-2 rounded-2xl rounded-bl-md border-2 px-4 py-3 shadow-sm"
              aria-hidden
            >
              <span className="flex gap-1">
                <span
                  className="bg-cta-accent inline-block size-1.5 animate-pulse rounded-full"
                  style={{animationDelay: '0s'}}
                />
                <span
                  className="bg-cta-accent inline-block size-1.5 animate-pulse rounded-full"
                  style={{animationDelay: '0.2s'}}
                />
                <span
                  className="bg-cta-accent inline-block size-1.5 animate-pulse rounded-full"
                  style={{animationDelay: '0.4s'}}
                />
              </span>
              <span className="text-muted text-sm font-bold">Thinking…</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Input area */}
      <div className="border-border-playful bg-surface flex items-end gap-2 rounded-2xl border-2 px-3 py-2 shadow-md transition-shadow focus-within:shadow-lg">
        <label htmlFor="chat-message-input" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-message-input"
          rows={1}
          className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-semibold leading-relaxed outline-none placeholder:text-muted/60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          placeholder="Ask the knowledge base…"
          value={input}
          disabled={loading}
          onChange={(e) => {
            setInput(e.target.value)
            // Auto-resize: reset then grow to content (max 6 rows)
            const el = e.target
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 144)}px`
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send()
            }
          }}
        />
        <button
          type="button"
          disabled={loading || !input.trim()}
          onClick={() => void send()}
          className="bg-cta hover:bg-cta-hover mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          {/* Send arrow icon */}
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
