import PptxGenJS from 'pptxgenjs'
import type {StructuredSlides} from '@/lib/exportSlides'
import type {OrgBranding} from '@/lib/orgConfig'

const FOREGROUND = '1A1A2E'
const MUTED = '6B6B80'
const SUNSHINE_WASH = 'FFFCEB'

function hexToPptxColor(hex: string, fallback: string): string {
  const cleaned = hex.trim().replace(/^#/, '').toUpperCase()
  return /^[0-9A-F]{6}$/.test(cleaned) ? cleaned : fallback
}

export type RenderPptxOptions = {
  displayName: string
  branding: OrgBranding
}

export async function renderPptx(
  data: StructuredSlides,
  options: RenderPptxOptions,
): Promise<Buffer> {
  const brand = hexToPptxColor(options.branding.brand, '2B4ACB')
  const cta = hexToPptxColor(options.branding.cta, 'B8470F')
  const agentLabel = options.displayName.trim() || 'Knowledge agent'

  const pptx = new PptxGenJS()
  pptx.author = agentLabel
  pptx.title = data.deckTitle

  pptx.defineLayout({name: 'WIDE', width: 13.33, height: 7.5})
  pptx.layout = 'WIDE'

  const titleSlide = pptx.addSlide()
  titleSlide.background = {color: SUNSHINE_WASH}
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.15,
    h: 7.5,
    fill: {color: cta},
  })
  titleSlide.addText(data.deckTitle, {
    x: 1.0,
    y: 2.0,
    w: 10.5,
    h: 2.0,
    fontSize: 36,
    fontFace: 'Arial',
    bold: true,
    color: FOREGROUND,
  })
  titleSlide.addText(agentLabel, {
    x: 1.0,
    y: 4.2,
    w: 10.5,
    h: 0.6,
    fontSize: 14,
    fontFace: 'Arial',
    color: MUTED,
  })

  for (const slide of data.slides) {
    const s = pptx.addSlide()
    s.background = {color: 'FFFFFF'}
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.15,
      h: 7.5,
      fill: {color: brand},
    })
    s.addText(slide.title, {
      x: 1.0,
      y: 0.5,
      w: 11.0,
      h: 1.0,
      fontSize: 28,
      fontFace: 'Arial',
      bold: true,
      color: FOREGROUND,
    })
    s.addShape(pptx.ShapeType.line, {
      x: 1.0,
      y: 1.5,
      w: 11.0,
      h: 0,
      line: {color: 'E0E0E0', width: 1},
    })

    const bulletRows = slide.points.map((pt) => ({
      text: pt,
      options: {
        fontSize: 16,
        fontFace: 'Arial' as const,
        color: FOREGROUND,
        bullet: {code: '2022'},
        paraSpaceAfter: 8,
      },
    }))

    s.addText(bulletRows, {
      x: 1.0,
      y: 1.8,
      w: 11.0,
      h: 3.8,
      valign: 'top',
    })

    s.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 5.9,
      w: 11.0,
      h: 1.0,
      fill: {color: SUNSHINE_WASH},
      rectRadius: 0.15,
    })
    s.addText(`Takeaway: ${slide.takeaway}`, {
      x: 1.2,
      y: 5.95,
      w: 10.6,
      h: 0.9,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: cta,
      valign: 'middle',
    })
  }

  const output = await pptx.write({outputType: 'nodebuffer'})
  return output as unknown as Buffer
}
