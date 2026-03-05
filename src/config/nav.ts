/**
 * Nav — Navigation routes & items
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NavItem {
  readonly name: string;
  readonly href: string;
}

export interface Routes {
  readonly HOME: string;
  readonly WORK: string;
  readonly ARTICLES: string;
  readonly SOCIAL: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const ROUTES: Routes = {
  HOME:     '/',
  WORK:     '/work',
  ARTICLES: '/articles',
  SOCIAL:   '/social',
} as const;

export const NAVIGATION: readonly NavItem[] = [
  { name: 'Work',     href: ROUTES.WORK     },
  { name: 'Articles', href: ROUTES.ARTICLES },
  { name: 'Social',   href: ROUTES.SOCIAL   },
] as const;
