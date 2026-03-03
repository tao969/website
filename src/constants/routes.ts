// Application Routes
export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  ARTICLES: '/articles',
  SOCIAL: '/social',
} as const;

// Navigation Menu
export const NAVIGATION = [
  { name: 'Home', href: ROUTES.HOME },
  { name: 'Projects', href: ROUTES.PROJECTS },
] as const;
