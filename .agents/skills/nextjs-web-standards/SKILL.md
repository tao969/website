````skill
---
name: nextjs-web-standards
description: This skill should be used when the user asks to "refactor project structure", "rename component files", "organize folders", "fix barrel imports", "follow naming conventions", "set up Next.js project layout", "add a new component", "create a custom hook", "name event handlers", "configure SCSS modules", "decide between RSC and client component", "optimize bundle size", "remove unused files", "improve folder structure", or when any naming inconsistency (PascalCase files, barrel file issues, unused folders, SCSS naming) is encountered in a Next.js + React + TypeScript + SCSS project.
version: 1.0.0
---

# Next.js Web Standards

A unified reference for file naming, component patterns, performance, and project structure in a Next.js (App Router) + React 19 + TypeScript + SCSS Modules project.

## When to Apply

Apply this skill on any task involving:
- Naming or renaming files, folders, components, or hooks
- Adding new components, pages, or sections
- Deciding where to colocate files
- Setting up or reviewing barrel (`index.ts`) exports
- Choosing between RSC and `'use client'`
- Optimizing performance (memoization, dynamic imports)
- Configuring SCSS modules

## Core Rules (Quick Reference)

### File & Folder Names

| Item | Convention | Example |
|---|---|---|
| Component file | `kebab-case.tsx` | `hero-section.tsx` |
| Hook file | `use-name.ts` | `use-scramble.ts` |
| SCSS module | `[component-name].module.scss` | `hero.module.scss` |
| Config file | `kebab-case.ts` | `site.ts`, `nav.ts` |
| Barrel | `index.ts` | `index.ts` |
| Page | `page.tsx` (Next.js convention) | `page.tsx` |
| Layout | `layout.tsx` | `layout.tsx` |
| App folder | `kebab-case/` | `(main)/`, `work/` |

**Never use PascalCase for filenames.** The export inside the file uses PascalCase; the file itself does not.

```
components/ui/header/
├── header.tsx       ← file: kebab-case
├── mobile-nav.tsx   ← file: kebab-case
├── header.module.scss
└── index.ts

// Inside header.tsx:
export default function Header() { ... }  ← export: PascalCase
```

### Export Naming

- **React components**: `PascalCase` — `export function HeroSection()`
- **Custom hooks**: `camelCase` with `use` prefix — `export function useScramble()`
- **Event handler props**: `on` + `PascalCase` — `onNodeClick`, `onPositionUpdate`
- **Event handler functions**: `handle` + `PascalCase` — `const handleClick = ...`
- **Constants / config**: `SCREAMING_SNAKE_CASE` — `SITE_CONFIG`, `NAVIGATION`
- **TypeScript types/interfaces**: `PascalCase` — `interface NavItem`, `type Theme`

### Barrel Files (`index.ts`)

Create one barrel per **feature folder** only. Never create top-level mega-barrels that re-export everything.

```
components/ui/header/index.ts    ← ok: scoped to feature
components/ui/index.ts           ← REMOVE: mega barrel → dead code risk
components/index.ts              ← REMOVE: mega barrel → dead code risk
```

Barrel files must export only what actually exists in that folder. Verify all imports before wrapping.

### Unused Folder Rule

Delete any folder whose contents are never imported by the application. Run a grep check before deciding a folder is needed:

```bash
grep -r "from '@/components/layout" src/  # zero results → delete folder
```

## Next.js Specific Conventions

### App Router File Conventions

Next.js App Router reserves these filenames — **do not use them for other purposes**:

| Reserved | Purpose |
|---|---|
| `page.tsx` | Route UI |
| `layout.tsx` | Shared persistent UI |
| `loading.tsx` | Suspense fallback |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 UI |
| `middleware.ts` / `proxy.ts` | Edge runtime (version-specific) |
| `route.ts` | API endpoint |

### `proxy.ts` vs `middleware.ts`

This project runs **Next.js 16.x**, which introduced `proxy.ts` as the new standard and deprecated `middleware.ts`. Always use `proxy.ts` in this project. Earlier projects (v15 and below) use `middleware.ts`.

```
src/proxy.ts       ← CORRECT for Next.js 16+
src/middleware.ts  ← deprecated in v16, warns at build time
```

### RSC vs Client Component Decision

Default to **React Server Component (RSC)** — no directive needed. Add `'use client'` only at the leaf that actually needs it.

```
RSC (no directive)     → data fetching, layouts, static sections
'use client'           → useState, useEffect, event listeners, browser APIs
```

Keep the client boundary as narrow as possible. If only one child needs interactivity, extract that child into a tiny client wrapper rather than marking the whole parent `'use client'`.

### Route Group Folders

Use `(group-name)/` for organisational grouping without affecting the URL:

```
app/
├── (main)/         ← layout group: applies Header + Footer
│   ├── layout.tsx
│   ├── page.tsx    → /
│   ├── work/       → /work
│   └── social/     → /social
```

## Component Structure

Every component file follows this order:

```tsx
'use client'; // only if needed

// 1. React imports
import { useCallback, useState } from 'react';
// 2. Next.js imports
import Link from 'next/link';
// 3. Internal absolute imports (@/...)
import { NAVIGATION } from '@/config';
// 4. Relative imports (./...)
import styles from './header.module.scss';

// 5. Types / interfaces
interface HeaderProps { ... }

// 6. Constants local to component
const NAV_ID = 'site-nav';

// 7. Component export
export default function Header({ ... }: HeaderProps) { ... }
// or named export:
export function Header({ ... }: HeaderProps) { ... }
```

## SCSS Modules

Name the SCSS module file to match its component file, shortened to the noun:

```
hero.tsx            → hero.module.scss         (not hero-section.module.scss)
reveal.tsx          → reveal.module.scss        (not reveal-section.module.scss)
platform-list.tsx   → platform-list.module.scss
```

Import always as `styles`:

```tsx
import styles from './hero.module.scss';
// ✅ styles.hero, styles.heroInner
// ✗  heroStyles.hero
```

## Reference Files

For exhaustive rules and code examples, consult:

- **`references/file-conventions.md`** — complete naming table, directory layout, import path rules, path aliases
- **`references/component-patterns.md`** — RSC vs client deep-dive, dynamic imports, forwardRef, memo, React 19 patterns
- **`references/performance.md`** — bundle optimization, re-render prevention, scroll listeners, IntersectionObserver patterns
- **`references/scss-conventions.md`** — BEM variant, variable naming, SCSS abstracts layout, global vs module scope
````
