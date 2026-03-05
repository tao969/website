/**
 * Site — Identity & author configuration
 *
 * Single source of truth for site identity and author data.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SiteConfig {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly ogImage: string;
}

export interface Author {
  readonly name: string;
  readonly email: string;
  readonly location: string;
  readonly role: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const SITE_CONFIG: SiteConfig = {
  name: 'tao',
  title: 'tao',
  description: 'Full Stack Engineer & AI-Augmented Developer based in Indonesia.',
  url: 'https://tao.wtf',
  ogImage: '/profile.png',
} as const;

export const AUTHOR: Author = {
  name: 'tao',
  email: 'taopikhidayat@gmail.com',
  location: 'Ciamis, West Java, Indonesia',
  role: 'Full Stack Engineer',
} as const;
