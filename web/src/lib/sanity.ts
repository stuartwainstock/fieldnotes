import {createClient, type SanityClient} from '@sanity/client'

let client: SanityClient | null = null

export function getSanityReadClient(): SanityClient {
  if (client) return client
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  const token = process.env.SANITY_API_READ_TOKEN
  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  }
  client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.SANITY_API_VERSION ?? '2024-01-01',
    useCdn: !token,
    token: token || undefined,
  })
  return client
}

/* ── Site content singleton ── */

export type FeatureCard = {
  icon: string
  label: string
  description: string
}

export type TechStackCard = {
  name: string
  descriptor: string
  role: string
}

export type Conviction = {
  label: string
  question: string
  description: string
}

export type SeoImage = {
  url: string
  width: number | null
  height: number | null
}

export type SiteSeo = {
  siteName: string
  tagline: string
  landingMetaTitle: string
  landingMetaDescription: string
  aboutMetaTitle: string
  aboutMetaDescription: string
  chatMetaTitle: string
  chatMetaDescription: string
  ogImage: SeoImage | null
  twitterHandle: string
  sameAs: string[]
}

export type FaqItem = {
  question: string
  answer: string
}

/** Sanity-editable slice of org config (partial overrides of config/org.ts). */
export type SiteOrgConfig = {
  displayName: string
  agentRoleLine: string
  northStarLine: string
  exportRoleLine: string
  enabledKnowledgeTypes: string[]
  branding: {
    brand: string
    brandMuted: string
    brandLight: string
    cta: string
    ctaHover: string
  }
  taxonomy: {
    domainTypeTitle: string
    domainTypeDescription: string
    domainFieldTitle: string
    domainFieldDescription: string
  }
}

export type SiteContent = {
  org: SiteOrgConfig | null
  navBrandLabel: string
  navCtaLabel: string
  navCtaHref: string
  landingEyebrow: string
  landingHeadline: string
  landingDescription: string
  landingCta: string
  featureCards: FeatureCard[]
  aboutEyebrow: string
  aboutHeadline: string
  aboutBody: string
  aboutSubline: string
  stackSectionTitle: string
  stackCards: TechStackCard[]
  convictionsSectionTitle: string
  convictionsIntro: string
  convictions: Conviction[]
  chatEyebrow: string
  chatHeadline: string
  chatDescription: string
  chatEmptyMessage: string
  chatStarters: string[]
  seo: SiteSeo
  faqSectionTitle: string
  faq: FaqItem[]
}

const SITE_CONTENT_DEFAULTS: SiteContent = {
  org: null,
  navBrandLabel: 'fieldnotes.design',
  navCtaLabel: 'Chat',
  navCtaHref: '/chat',
  landingEyebrow: 'fieldnotes',
  landingHeadline: "Your team's\ndesign wisdom,\nalways within reach",
  landingDescription:
    "Frameworks, processes, principles, and insights — curated by your design leaders, ready whenever you need them. Ask a question, get an opinionated answer grounded in what your team actually believes.",
  landingCta: 'Open knowledge chat',
  featureCards: [
    {icon: '💡', label: 'Frameworks & models', description: 'Mental models your team uses daily'},
    {icon: '🧭', label: 'Processes & steps', description: 'How we actually do things here'},
    {icon: '✨', label: 'Principles & insights', description: 'Hard-won opinions, not platitudes'},
  ],
  aboutEyebrow: 'About',
  aboutHeadline: "Your design team's memory, made conversational.",
  aboutBody:
    'Every framework, principle, and hard-won lesson your team has earned — captured, structured, and ready to answer. fieldnotes turns institutional design knowledge into something you can simply ask.',
  aboutSubline: "Not a wiki. Not a chatbot. Your team's judgment, on demand.",
  stackSectionTitle: 'What powers fieldnotes',
  stackCards: [
    {
      name: 'SANITY',
      descriptor: 'Structured authoring environment',
      role: 'Where knowledge is written, structured, and published',
    },
    {
      name: 'SUPABASE',
      descriptor: 'Vector search with pgvector',
      role: 'Surfaces the most relevant knowledge for every question',
    },
    {
      name: 'CLAUDE',
      descriptor: "Anthropic's reasoning model",
      role: 'Turns retrieved knowledge into opinionated, grounded answers',
    },
    {
      name: 'NEXT.JS',
      descriptor: 'React framework on Vercel',
      role: 'Delivers the experience — fast, accessible, everywhere',
    },
  ],
  convictionsSectionTitle: 'Design convictions',
  convictionsIntro:
    'Every entry in fieldnotes is calibrated before it earns trust. These are the questions we ask of our own knowledge.',
  convictions: [
    {
      label: 'confidence',
      question: 'Evergreen or experimental?',
      description: 'How settled an idea is — state it with conviction, or flag it as still forming.',
    },
    {
      label: 'maturity',
      question: 'Onboarding or senior?',
      description: 'Who the answer is for — calibrate the depth to the reader’s experience.',
    },
    {
      label: 'myTake',
      question: 'Bookmark or belief?',
      description: 'A quote without interpretation is just a link; the take is what makes it knowledge.',
    },
    {
      label: 'tension',
      question: 'Where does this break?',
      description: 'A principle without edges is a platitude — the good ones occasionally conflict.',
    },
  ],
  chatEyebrow: 'Knowledge chat',
  chatHeadline: "Ask your team's brain",
  chatDescription:
    "Every answer is grounded in your published frameworks, processes, and insights. Think of it as a conversation with your team's collected wisdom.",
  chatEmptyMessage:
    'Ask about frameworks, processes, principles, or insights.\nAnswers come from your published knowledge base.',
  chatStarters: [
    'What frameworks help with problem framing?',
    'Walk me through our discovery process',
    'What principles guide critique?',
  ],
  seo: {
    siteName: 'fieldnotes',
    tagline: "your design team's knowledge, on demand",
    landingMetaTitle: 'fieldnotes — your design team’s knowledge, on demand',
    landingMetaDescription:
      "Your team's design wisdom — frameworks, processes, principles, and insights curated by your design leaders, answerable in plain language.",
    aboutMetaTitle: 'About — fieldnotes',
    aboutMetaDescription:
      'The mission behind fieldnotes, the architecture that powers it, and the design convictions that keep its knowledge honest.',
    chatMetaTitle: 'Chat — fieldnotes',
    chatMetaDescription:
      'Ask questions and get opinionated answers grounded in your published design knowledge base.',
    ogImage: null,
    twitterHandle: '',
    sameAs: [],
  },
  faqSectionTitle: 'Frequently asked questions',
  faq: [
    {
      question: 'What is fieldnotes?',
      answer:
        "fieldnotes is a second brain for a product design team — a searchable, conversational knowledge base of the frameworks, processes, principles, and insights your design leaders actually use. You ask a question and get an opinionated answer grounded in your team's own judgment, with citations.",
    },
    {
      question: 'How is it different from a wiki or a chatbot?',
      answer:
        "A wiki makes you hunt for the right page; a generic chatbot invents plausible-sounding answers. fieldnotes only answers from your team's published knowledge, cites the source, and is calibrated to the asker's experience level — so quality standards are built in rather than left to chance.",
    },
    {
      question: 'How does fieldnotes work?',
      answer:
        'Knowledge is authored in a structured CMS, embedded into a vector database, and retrieved by semantic search at question time. A reasoning model turns the most relevant entries into a grounded, opinionated answer — never freelancing beyond what your team has written.',
    },
    {
      question: 'Where do the answers come from?',
      answer:
        'Every answer is drawn from your published frameworks, processes, principles, and insights. If the knowledge base does not cover something, fieldnotes says so and suggests what kind of entry would help — rather than guessing.',
    },
  ],
}

const SITE_CONTENT_QUERY = `*[_type == "siteContent" && _id == "siteContent"][0]{
  org{
    displayName,
    agentRoleLine,
    northStarLine,
    exportRoleLine,
    enabledKnowledgeTypes,
    branding{ brand, brandMuted, brandLight, cta, ctaHover },
    taxonomy{
      domainTypeTitle,
      domainTypeDescription,
      domainFieldTitle,
      domainFieldDescription
    }
  },
  navBrandLabel,
  navCtaLabel,
  navCtaHref,
  landingEyebrow,
  landingHeadline,
  landingDescription,
  landingCta,
  featureCards[]{ icon, label, description },
  aboutEyebrow,
  aboutHeadline,
  aboutBody,
  aboutSubline,
  stackSectionTitle,
  stackCards[]{ name, descriptor, role },
  convictionsSectionTitle,
  convictionsIntro,
  convictions[]{ label, question, description },
  chatEyebrow,
  chatHeadline,
  chatDescription,
  chatEmptyMessage,
  chatStarters,
  seo{
    siteName,
    tagline,
    landingMetaTitle,
    landingMetaDescription,
    aboutMetaTitle,
    aboutMetaDescription,
    chatMetaTitle,
    chatMetaDescription,
    twitterHandle,
    sameAs,
    "ogImage": ogImage{
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  },
  faqSectionTitle,
  faq[]{ question, answer },
}`

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const data = await getSanityReadClient().fetch<Partial<SiteContent> | null>(
      SITE_CONTENT_QUERY,
      {},
      {next: {revalidate: 60}},
    )
    if (!data) return SITE_CONTENT_DEFAULTS
    const merged: SiteContent = {...SITE_CONTENT_DEFAULTS, ...stripNulls(data)}

    if (Array.isArray(data.featureCards)) {
      merged.featureCards = data.featureCards
        .filter(
          (c): c is FeatureCard =>
            c != null &&
            typeof c.label === 'string' &&
            c.label.trim().length > 0,
        )
        .map((c) => ({
          icon: typeof c.icon === 'string' ? c.icon : '•',
          label: c.label.trim(),
          description: typeof c.description === 'string' ? c.description : '',
        }))
    }

    if (Array.isArray(data.stackCards)) {
      merged.stackCards = data.stackCards
        .filter(
          (c): c is TechStackCard =>
            c != null && typeof c.name === 'string' && c.name.trim().length > 0,
        )
        .map((c) => ({
          name: c.name.trim(),
          descriptor: typeof c.descriptor === 'string' ? c.descriptor : '',
          role: typeof c.role === 'string' ? c.role : '',
        }))
    }

    if (Array.isArray(data.convictions)) {
      merged.convictions = data.convictions
        .filter(
          (c): c is Conviction =>
            c != null &&
            ((typeof c.label === 'string' && c.label.trim().length > 0) ||
              (typeof c.question === 'string' && c.question.trim().length > 0)),
        )
        .map((c) => ({
          label: typeof c.label === 'string' ? c.label.trim() : '',
          question: typeof c.question === 'string' ? c.question.trim() : '',
          description: typeof c.description === 'string' ? c.description : '',
        }))
    }

    if (Array.isArray(data.chatStarters)) {
      merged.chatStarters = data.chatStarters.filter(
        (s) => typeof s === 'string' && s.trim().length > 0,
      )
    }

    // SEO is a nested object; merge field-by-field so a partial Studio entry
    // doesn't blow away the code defaults for fields left blank.
    if (data.seo && typeof data.seo === 'object') {
      const seo = data.seo as Partial<SiteSeo>
      merged.seo = {...SITE_CONTENT_DEFAULTS.seo, ...stripNulls(seo)}
      merged.seo.sameAs = Array.isArray(seo.sameAs)
        ? seo.sameAs.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        : []
      const img = seo.ogImage
      merged.seo.ogImage =
        img && typeof img.url === 'string' && img.url.length > 0
          ? {
              url: img.url,
              width: typeof img.width === 'number' ? img.width : null,
              height: typeof img.height === 'number' ? img.height : null,
            }
          : null
    }

    if (Array.isArray(data.faq)) {
      merged.faq = data.faq
        .filter(
          (f): f is FaqItem =>
            f != null &&
            typeof f.question === 'string' &&
            f.question.trim().length > 0 &&
            typeof f.answer === 'string' &&
            f.answer.trim().length > 0,
        )
        .map((f) => ({question: f.question.trim(), answer: f.answer.trim()}))
    }

    // Org config is optional — pass through as a partial for getOrgConfig() to merge.
    if (data.org && typeof data.org === 'object') {
      merged.org = data.org as SiteOrgConfig
    } else {
      merged.org = null
    }

    return merged
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getSiteContent]', e)
    }
    return SITE_CONTENT_DEFAULTS
  }
}

function stripNulls<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v != null) result[k] = v
  }
  return result as Partial<T>
}
