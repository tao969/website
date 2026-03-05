/**
 * Content — Home page section copy
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HeroContent {
  readonly name: string;
  readonly tagline: string;
  readonly context: string;
}

export interface SectionContent {
  readonly title: string;
  readonly content: readonly string[];
}

export interface SectionLinkContent extends SectionContent {
  readonly linkText: string;
  readonly linkHref: string;
}

export interface HomeContent {
  readonly hero:     HeroContent;
  readonly about:    SectionContent;
  readonly work:     SectionLinkContent;
  readonly articles: SectionLinkContent;
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const HOME_CONTENT: HomeContent = {
  hero: {
    name: 'tao',
    tagline: 'full-stack engineer',
    context: 'Building focused products with modern web and AI tooling.',
  },

  about: {
    title: 'about',
    content: [
      "Things get built here. Whatever's interesting enough to finish.",
      'Ciamis, West Java. Self-taught, running on free tools and four years of focused hours.',
    ],
  },

  work: {
    title: 'work',
    content: ['A few things that made it to production. More in progress.'],
    linkText: 'see all',
    linkHref: '/work',
  },

  articles: {
    title: 'writing',
    content: ['Notes from the process. Sometimes useful to others.'],
    linkText: 'read',
    linkHref: '/articles',
  },
} as const;
