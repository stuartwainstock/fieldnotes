import {defineType, defineField, defineArrayMember} from 'sanity'
import {HomeIcon} from '@sanity/icons'
import {DEFAULT_ORG_CONFIG, KNOWLEDGE_TYPE_REGISTRY} from '../../config/org'

export const siteContentDocument = defineType({
  name: 'siteContent',
  title: 'Site content',
  type: 'document',
  icon: HomeIcon,
  description:
    'Org config + editable site copy. The org group isolates white-label settings (agent framing, branding, enabled types, taxonomy labels) from engine code.',
  fields: [
    // ── Org config (white-label) ──
    defineField({
      name: 'org',
      title: 'Org config',
      type: 'object',
      description:
        'What makes this deployment different from another org. Prefer editing here over changing engine code. Blank fields fall back to code defaults in config/org.ts.',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'displayName',
          title: 'Display name',
          type: 'string',
          description: 'Short org / product name used in prompts and UI framing.',
          initialValue: DEFAULT_ORG_CONFIG.displayName,
        }),
        defineField({
          name: 'agentRoleLine',
          title: 'Agent role line',
          type: 'text',
          rows: 3,
          description:
            'Opening of the chat system prompt — who the agent is and who it serves. Keep it natural, not a template with blanks.',
          initialValue: DEFAULT_ORG_CONFIG.agentRoleLine,
        }),
        defineField({
          name: 'northStarLine',
          title: 'North-star line',
          type: 'text',
          rows: 2,
          description:
            'The conviction the agent embodies. Example: "If the design lead would say it in a critique, you should be able to say it too."',
          initialValue: DEFAULT_ORG_CONFIG.northStarLine,
        }),
        defineField({
          name: 'exportRoleLine',
          title: 'Export role line',
          type: 'string',
          description: 'Opening line for the slide-export structuring prompt.',
          initialValue: DEFAULT_ORG_CONFIG.exportRoleLine,
        }),
        defineField({
          name: 'enabledKnowledgeTypes',
          title: 'Enabled knowledge types',
          type: 'array',
          of: [{type: 'string'}],
          description:
            'Which knowledge document types this org uses. Leave empty to use all engine types. Values must match the engine registry (framework, process, insight, principle, externalResource — plus future types).',
          options: {
            list: KNOWLEDGE_TYPE_REGISTRY.map((value) => ({title: value, value})),
          },
          initialValue: [...DEFAULT_ORG_CONFIG.enabledKnowledgeTypes],
        }),
        defineField({
          name: 'branding',
          title: 'Brand colors',
          type: 'object',
          description: 'Hex colors injected as CSS variables on the site. Leave blank to keep globals.css defaults.',
          options: {collapsible: true, collapsed: true},
          fields: [
            defineField({
              name: 'brand',
              title: 'Brand',
              type: 'string',
              description: 'Primary brand (`--brand`).',
              initialValue: DEFAULT_ORG_CONFIG.branding.brand,
              validation: (Rule) =>
                Rule.regex(/^#[0-9A-Fa-f]{6}$/, {name: 'hex'}).warning('Use a 6-digit hex like #2B4ACB'),
            }),
            defineField({
              name: 'brandMuted',
              title: 'Brand muted',
              type: 'string',
              initialValue: DEFAULT_ORG_CONFIG.branding.brandMuted,
              validation: (Rule) =>
                Rule.regex(/^#[0-9A-Fa-f]{6}$/, {name: 'hex'}).warning('Use a 6-digit hex'),
            }),
            defineField({
              name: 'brandLight',
              title: 'Brand light',
              type: 'string',
              initialValue: DEFAULT_ORG_CONFIG.branding.brandLight,
              validation: (Rule) =>
                Rule.regex(/^#[0-9A-Fa-f]{6}$/, {name: 'hex'}).warning('Use a 6-digit hex'),
            }),
            defineField({
              name: 'cta',
              title: 'CTA',
              type: 'string',
              initialValue: DEFAULT_ORG_CONFIG.branding.cta,
              validation: (Rule) =>
                Rule.regex(/^#[0-9A-Fa-f]{6}$/, {name: 'hex'}).warning('Use a 6-digit hex'),
            }),
            defineField({
              name: 'ctaHover',
              title: 'CTA hover',
              type: 'string',
              initialValue: DEFAULT_ORG_CONFIG.branding.ctaHover,
              validation: (Rule) =>
                Rule.regex(/^#[0-9A-Fa-f]{6}$/, {name: 'hex'}).warning('Use a 6-digit hex'),
            }),
          ],
        }),
        defineField({
          name: 'taxonomy',
          title: 'Taxonomy labels',
          type: 'object',
          description:
            'How domains/phases and tag categories are labeled for this org. Schema Studio titles also read defaults from config/org.ts.',
          options: {collapsible: true, collapsed: true},
          fields: [
            defineField({
              name: 'domainTypeTitle',
              title: 'Domain type title',
              type: 'string',
              description: 'Studio document type name (e.g. "Phase" or "Domain").',
              initialValue: DEFAULT_ORG_CONFIG.taxonomy.domainTypeTitle,
            }),
            defineField({
              name: 'domainTypeDescription',
              title: 'Domain type description',
              type: 'text',
              rows: 2,
              initialValue: DEFAULT_ORG_CONFIG.taxonomy.domainTypeDescription,
            }),
            defineField({
              name: 'domainFieldTitle',
              title: 'Domain field title',
              type: 'string',
              description: 'Label on the shared reference field on knowledge docs.',
              initialValue: DEFAULT_ORG_CONFIG.taxonomy.domainFieldTitle,
            }),
            defineField({
              name: 'domainFieldDescription',
              title: 'Domain field description',
              type: 'string',
              initialValue: DEFAULT_ORG_CONFIG.taxonomy.domainFieldDescription,
            }),
          ],
        }),
      ],
    }),

    // ── Global navigation ──
    defineField({
      name: 'navBrandLabel',
      title: 'Nav brand label',
      type: 'string',
      description: 'Wordmark text in the top-left of the nav bar (displayed in lowercase).',
      initialValue: 'fieldnotes.design',
    }),
    defineField({
      name: 'navCtaLabel',
      title: 'Nav CTA label',
      type: 'string',
      description: 'Text on the top-right nav button.',
      initialValue: 'Chat',
    }),
    defineField({
      name: 'navCtaHref',
      title: 'Nav CTA link',
      type: 'string',
      description: 'Where the nav button points. Use a path like "/chat" for internal pages.',
      initialValue: '/chat',
    }),

    // ── Landing page ──
    defineField({
      name: 'landingEyebrow',
      title: 'Landing eyebrow',
      type: 'string',
      description: 'Small uppercase label above the headline (e.g. "fieldnotes").',
      initialValue: 'fieldnotes',
    }),
    defineField({
      name: 'landingHeadline',
      title: 'Landing headline',
      type: 'text',
      rows: 3,
      description:
        'Main hero headline. Use line breaks; the second line is shown in brand color on the web app (typically the value line — e.g. “design wisdom,”). Other lines use the default foreground color.',
      initialValue: "Your team's\ndesign wisdom,\nalways within reach",
    }),
    defineField({
      name: 'landingDescription',
      title: 'Landing description',
      type: 'text',
      rows: 3,
      description: 'Supporting paragraph below the headline.',
      initialValue:
        "Frameworks, processes, principles, and insights — curated by your design leaders, ready whenever you need them. Ask a question, get an opinionated answer grounded in what your team actually believes.",
    }),
    defineField({
      name: 'landingCta',
      title: 'Landing CTA label',
      type: 'string',
      description: 'Text for the main call-to-action button.',
      initialValue: 'Open knowledge chat',
    }),
    defineField({
      name: 'featureCards',
      title: 'Feature cards',
      type: 'array',
      description: 'The three feature highlight cards below the hero.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'icon', title: 'Emoji icon', type: 'string'}),
            defineField({name: 'label', title: 'Label', type: 'string'}),
            defineField({name: 'description', title: 'Description', type: 'string'}),
          ],
          preview: {
            select: {title: 'label', subtitle: 'description'},
          },
        }),
      ],
      initialValue: [
        {icon: '💡', label: 'Frameworks & models', description: 'Mental models your team uses daily'},
        {icon: '🧭', label: 'Processes & steps', description: 'How we actually do things here'},
        {icon: '✨', label: 'Principles & insights', description: 'Hard-won opinions, not platitudes'},
      ],
    }),

    // ── About / Mission ──
    defineField({
      name: 'aboutEyebrow',
      title: 'About eyebrow',
      type: 'string',
      description: 'Short uppercase label above the mission headline.',
      initialValue: 'About',
    }),
    defineField({
      name: 'aboutHeadline',
      title: 'About headline',
      type: 'string',
      description: 'The primary mission statement.',
      initialValue: "Your design team's memory, made conversational.",
    }),
    defineField({
      name: 'aboutBody',
      title: 'About body',
      type: 'text',
      rows: 4,
      description: 'Supporting paragraph beneath the mission headline. Line breaks are preserved.',
      initialValue:
        'Every framework, principle, and hard-won lesson your team has earned — captured, structured, and ready to answer. fieldnotes turns institutional design knowledge into something you can simply ask.',
    }),
    defineField({
      name: 'aboutSubline',
      title: 'About subline',
      type: 'string',
      description: 'Optional secondary statement beneath the body.',
      initialValue: "Not a wiki. Not a chatbot. Your team's judgment, on demand.",
    }),

    // ── Tech stack ──
    defineField({
      name: 'stackSectionTitle',
      title: 'Tech stack section title',
      type: 'string',
      description: 'Heading for the tech stack section.',
      initialValue: 'What powers fieldnotes',
    }),
    defineField({
      name: 'stackCards',
      title: 'Tech stack cards',
      type: 'array',
      description: 'The tools behind fieldnotes, presented as cards.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'Tool name in all caps (e.g. SANITY).',
            }),
            defineField({
              name: 'descriptor',
              title: 'Descriptor',
              type: 'string',
              description: 'What it does (e.g. "Structured authoring environment").',
            }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
              description: 'Why it is here (e.g. "Where knowledge is written, structured, and published").',
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'descriptor'},
          },
        }),
      ],
      initialValue: [
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
    }),

    // ── Design convictions ──
    defineField({
      name: 'convictionsSectionTitle',
      title: 'Design convictions section title',
      type: 'string',
      description: 'Heading for the design convictions section.',
      initialValue: 'Design convictions',
    }),
    defineField({
      name: 'convictionsIntro',
      title: 'Design convictions intro',
      type: 'text',
      rows: 2,
      description: 'One or two sentence intro for the convictions section.',
      initialValue:
        'Every entry in fieldnotes is calibrated before it earns trust. These are the questions we ask of our own knowledge.',
    }),
    defineField({
      name: 'convictions',
      title: 'Design convictions',
      type: 'array',
      description: 'The calibration fields that keep the knowledge base honest.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'The field name (e.g. "confidence").',
            }),
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              description: 'The calibration question (e.g. "Evergreen or experimental?").',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
              description: 'One sentence elaboration.',
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'question'},
          },
        }),
      ],
      initialValue: [
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
    }),

    // ── Chat page ──
    defineField({
      name: 'chatEyebrow',
      title: 'Chat eyebrow',
      type: 'string',
      description: 'Small uppercase label above the chat heading.',
      initialValue: 'Knowledge chat',
    }),
    defineField({
      name: 'chatHeadline',
      title: 'Chat headline',
      type: 'string',
      description: 'Main heading on the chat page.',
      initialValue: "Ask your team's brain",
    }),
    defineField({
      name: 'chatDescription',
      title: 'Chat description',
      type: 'text',
      rows: 2,
      description: 'Supporting text below the chat heading.',
      initialValue:
        "Every answer is grounded in your published frameworks, processes, and insights. Think of it as a conversation with your team's collected wisdom.",
    }),
    defineField({
      name: 'chatEmptyMessage',
      title: 'Chat empty state message',
      type: 'text',
      rows: 2,
      description: 'Text shown before the first message is sent.',
      initialValue:
        'Ask about frameworks, processes, principles, or insights.\nAnswers come from your published knowledge base.',
    }),
    defineField({
      name: 'chatStarters',
      title: 'Starter prompts',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Clickable prompt suggestions shown in the empty chat state.',
      initialValue: [
        'What frameworks help with problem framing?',
        'Walk me through our discovery process',
        'What principles guide critique?',
      ],
    }),

    // ── SEO & social sharing ──
    defineField({
      name: 'seo',
      title: 'SEO & social sharing',
      type: 'object',
      description:
        'Search-engine titles/descriptions and social preview settings. Leave a field blank to fall back to a sensible default.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'siteName',
          title: 'Site name',
          type: 'string',
          description: 'Brand name used in social cards and structured data.',
          initialValue: 'fieldnotes',
        }),
        defineField({
          name: 'tagline',
          title: 'Tagline',
          type: 'string',
          description: 'Short phrase shown on the auto-generated social share image.',
          initialValue: "your design team's knowledge, on demand",
        }),
        defineField({
          name: 'landingMetaTitle',
          title: 'Home — page title',
          type: 'string',
          description: 'Browser tab + search result title for the home page. ~50–60 characters.',
          validation: (Rule) => Rule.max(70).warning('Aim for under 60 characters.'),
        }),
        defineField({
          name: 'landingMetaDescription',
          title: 'Home — meta description',
          type: 'text',
          rows: 2,
          description: 'Search result snippet for the home page. ~150–160 characters.',
          validation: (Rule) => Rule.max(180).warning('Aim for under 160 characters.'),
        }),
        defineField({
          name: 'aboutMetaTitle',
          title: 'About — page title',
          type: 'string',
          validation: (Rule) => Rule.max(70).warning('Aim for under 60 characters.'),
        }),
        defineField({
          name: 'aboutMetaDescription',
          title: 'About — meta description',
          type: 'text',
          rows: 2,
          validation: (Rule) => Rule.max(180).warning('Aim for under 160 characters.'),
        }),
        defineField({
          name: 'chatMetaTitle',
          title: 'Chat — page title',
          type: 'string',
          validation: (Rule) => Rule.max(70).warning('Aim for under 60 characters.'),
        }),
        defineField({
          name: 'chatMetaDescription',
          title: 'Chat — meta description',
          type: 'text',
          rows: 2,
          validation: (Rule) => Rule.max(180).warning('Aim for under 160 characters.'),
        }),
        defineField({
          name: 'ogImage',
          title: 'Social share image',
          type: 'image',
          description:
            'Optional. ~1200×630px. When set, this overrides the auto-generated branded image.',
        }),
        defineField({
          name: 'twitterHandle',
          title: 'X / Twitter handle',
          type: 'string',
          description: 'Including the @, e.g. "@fieldnotes". Used on Twitter/X cards.',
        }),
        defineField({
          name: 'sameAs',
          title: 'Social & profile links',
          type: 'array',
          of: [defineArrayMember({type: 'url'})],
          description:
            'Links to your official profiles (X, LinkedIn, GitHub…). Used for Organization structured data.',
        }),
      ],
    }),

    // ── FAQ (answer-engine optimization) ──
    defineField({
      name: 'faqSectionTitle',
      title: 'FAQ section title',
      type: 'string',
      description: 'Heading for the FAQ section on the About page.',
      initialValue: 'Frequently asked questions',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      description:
        'Question-and-answer pairs shown on the About page and emitted as FAQ structured data for search and AI answer engines.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              description: 'Phrase as a real question a user would ask.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              description: 'A direct, self-contained answer. Lead with the answer, then elaborate.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'question', subtitle: 'answer'},
          },
        }),
      ],
    }),
  ],

  // Singleton: only one document of this type should exist
  preview: {
    prepare: () => ({title: 'Site content'}),
  },
})
