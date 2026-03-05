/**
 * Config — Barrel exports
 *
 * Site data, constants, and TypeScript types.
 * Single import point for all static configuration:
 *   import { SITE_CONFIG, AUTHOR } from '@/config'
 *   import { HOME_CONTENT } from '@/config'
 *   import { PROJECT_CATEGORIES } from '@/config'
 */

// Site / profile
export type { Author, SiteConfig } from './site';
export { AUTHOR, SITE_CONFIG } from './site';

// Content
export type { HomeContent, HeroContent, SectionContent, SectionLinkContent } from './content';
export { HOME_CONTENT } from './content';

// Work
export type { ProjectCategory, ProjectType, ProjectStatus } from './work';
export { PROJECT_CATEGORIES } from './work';

// Social
export type { SocialPlatform, SocialPlatformIcon } from './social';
export { SOCIAL_PLATFORMS } from './social';

// Navigation
export type { NavItem, Routes } from './nav';
export { NAVIGATION, ROUTES } from './nav';
