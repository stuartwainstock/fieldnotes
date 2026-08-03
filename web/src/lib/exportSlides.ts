/** Max chars sent to Claude for slide structuring (matches chat context scale). */
export const EXPORT_CONTENT_MAX_CHARS = 24_000

export type SlideData = {
  title: string
  points: string[]
  takeaway: string
}

export type StructuredSlides = {
  deckTitle: string
  slides: SlideData[]
}

export function truncateExportContent(content: string): string {
  if (content.length <= EXPORT_CONTENT_MAX_CHARS) return content
  return `${content.slice(0, EXPORT_CONTENT_MAX_CHARS)}\n\n[Content truncated for slide export.]`
}

export function parseStructuredSlides(
  raw: unknown,
  fallbackDeckTitle = 'Knowledge',
): StructuredSlides {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid slide structure from model')
  }

  const obj = raw as Record<string, unknown>
  const deckTitle =
    typeof obj.deckTitle === 'string' && obj.deckTitle.trim()
      ? obj.deckTitle.trim()
      : fallbackDeckTitle

  const slidesRaw = Array.isArray(obj.slides) ? obj.slides : []
  const slides: SlideData[] = []

  for (const item of slidesRaw.slice(0, 3)) {
    if (!item || typeof item !== 'object') continue
    const slide = item as Record<string, unknown>
    const title = typeof slide.title === 'string' ? slide.title.trim() : ''
    const takeaway = typeof slide.takeaway === 'string' ? slide.takeaway.trim() : ''
    const points = Array.isArray(slide.points)
      ? slide.points
          .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
          .map((p) => p.trim())
          .slice(0, 5)
      : []

    if (!title || points.length === 0) continue

    slides.push({
      title,
      points,
      takeaway: takeaway || 'Discuss with your team.',
    })
  }

  if (slides.length === 0) {
    throw new Error('No valid slides in model response')
  }

  return {deckTitle, slides}
}

export function exportFilename(deckTitle: string): string {
  const slug = deckTitle
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 60)
  return `${slug || 'knowledge'}.pptx`
}
