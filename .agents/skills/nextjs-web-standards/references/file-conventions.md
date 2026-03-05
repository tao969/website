# File & Naming Conventions

Complete naming table, directory layout templates, and import path rules for a Next.js (App Router) + React 19 + TypeScript + SCSS Modules project.

---

## 1. Naming Convention Table

| Item | Convention | Example |
|---|---|---|
| Component file | `kebab-case.tsx` | `hero.tsx`, `mobile-nav.tsx` |
| Hook file | `use-[name].ts` | `use-scramble.ts`, `use-theme.ts` |
| SCSS module | `[component].module.scss` | `hero.module.scss`, `header.module.scss` |
| Utility file | `kebab-case.ts` | `utils.ts`, `validators.ts`, `constants.ts` |
| Config file | `kebab-case.ts` | `site.ts`, `nav.ts`, `work.ts` |
| Page file | `page.tsx` | `page.tsx` (required by Next.js) |
| Layout file | `layout.tsx` | `layout.tsx` (required by Next.js) |
| Barrel file | `index.ts` | `index.ts` |
| Route group folder | `(name)/` | `(main)/` |
| Private folder | `_name/` | `_helpers/` |
| Section folder | `kebab-case/` | `hero/`, `network-orb/` |
| Feature folder | `kebab-case/` | `header/`, `footer/` |
| App directory | `kebab-case/` | `work/`, `articles/` |

### Export names inside files (TypeScript / TSX)

| Item | Convention | Example |
|---|---|---|
| React component | `PascalCase` | `export function HeroSection()` |
| Custom hook | `camelCase` with `use` prefix | `export function useScramble()` |
| Event handler prop | `on` + `PascalCase` | `onNodeClick`, `onPositionUpdate` |
| Event handler local fn | `handle` + `PascalCase` | `const handleClick = ...` |
| Constant / config data | `SCREAMING_SNAKE_CASE` | `SITE_CONFIG`, `NAVIGATION`, `HOME_CONTENT` |
| TypeScript type | `PascalCase` | `type Theme = 'light' | 'dark'` |
| TypeScript interface | `PascalCase` | `interface NavItem { ... }` |
| TypeScript type alias (union strings) | `PascalCase` | `type ProjectStatus = 'live' \| 'wip'` |

---

## 2. Directory Layout Template

```
src/
├── app/                        ← Next.js App Router (routing only)
│   ├── layout.tsx              ← Root layout (html, body, fonts, metadata)
│   ├── page.tsx                ← Would be / route — only if needed outside group
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── (main)/                 ← Route group: applies shared Header + Footer
│       ├── layout.tsx
│       ├── page.tsx            ← / (home)
│       ├── work/
│       │   ├── page.tsx        ← /work
│       │   └── [slug]/
│       │       └── page.tsx    ← /work/[slug]
│       ├── articles/
│       │   ├── page.tsx        ← /articles
│       │   └── [slug]/
│       │       └── page.tsx    ← /articles/[slug]
│       └── social/
│           └── page.tsx        ← /social
│
├── components/
│   ├── ui/                     ← Primitive, reusable UI atoms
│   │   ├── header/
│   │   │   ├── header.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── header.module.scss
│   │   │   └── index.ts        ← export { default } from './header'
│   │   ├── footer/
│   │   │   ├── footer.tsx
│   │   │   ├── footer.module.scss
│   │   │   └── index.ts
│   │   ├── [widget]/
│   │   │   ├── [widget].tsx    ← main entry
│   │   │   ├── [part].tsx      ← sub-components (shell, loader, phrase…)
│   │   │   ├── [widget].module.scss
│   │   │   └── index.ts
│   │   └── skip-link/
│   │       ├── skip-link.tsx
│   │       ├── skip-link.module.scss
│   │       └── index.ts
│   │
│   └── sections/               ← Page-level section blocks
│       ├── home/
│       │   ├── hero.tsx
│       │   ├── built-with.tsx
│       │   ├── hero.module.scss
│       │   ├── built-with.module.scss
│       │   └── index.ts
│       ├── work/
│       │   ├── work-list.tsx
│       │   ├── work-list.module.scss
│       │   └── index.ts
│       └── social/
│           ├── platform-list.tsx
│           ├── platform-list.module.scss
│           └── index.ts
│
├── config/                     ← Static data, types, constants (no React)
│   ├── site.ts
│   ├── nav.ts
│   ├── content.ts
│   ├── work.ts
│   ├── social.ts
│   └── index.ts                ← barrel for all config modules
│
├── hooks/                      ← Custom React hooks
│   ├── use-scramble.ts
│   ├── use-theme.ts
│   └── index.ts
│
├── lib/                        ← Pure utilities (no React, no Next.js)
│   ├── constants.ts            ← App-wide magic values
│   ├── utils.ts                ← cn(), getScrollVelocity(), etc.
│   ├── validators.ts           ← isNonEmptyString(), isValidUrl(), etc.
│   ├── fonts.ts                ← next/font/local definitions
│   └── index.ts
│
├── styles/                     ← Global styles only
│   ├── globals.scss
│   ├── reset.scss
│   ├── typography.scss
│   ├── utilities.scss
│   └── abstracts/
│       ├── _variables.scss
│       ├── _mixins.scss
│       ├── _functions.scss
│       ├── _fonts.scss
│       └── _layout-grid.scss
│
├── types/                      ← Shared TypeScript utility types
│   └── index.ts
│
└── proxy.ts                    ← Next.js 16+ edge proxy (NOT middleware.ts)
```

---

## 3. Barrel File Rules

### When to create a barrel

Create `index.ts` in a **feature folder** to expose its public API. This hides internal subfiles from consumers.

```ts
// components/ui/header/index.ts
export { default } from './header';          // default export
// or
export { Header } from './header';           // named export
```

### When NOT to create a barrel

Never create a barrel that re-exports entire subtrees:

```ts
// ✗ NEVER: mega-barrel
// components/index.ts
export * from './ui';
export * from './sections';
```

Mega-barrels cause bundler tree-shake failures, circular dependency risks, and import confusion. Delete them.

### Barrel depth limit

Maximum 1 level of barrel forwarding. A barrel should only re-export from files in its own directory — not from grandchild or sibling directories.

```ts
// ✓ 1 level: fine
// components/ui/header/index.ts  →  exports from ./header.tsx

// ✗ 2 levels: don't do this
// components/ui/index.ts  →  re-exports from ./header/index.ts
```

---

## 4. Import Path Order

In every `.tsx` / `.ts` file, maintain this import order:

```ts
// 1. React core
import { useCallback, useState } from 'react';

// 2. Next.js
import dynamic from 'next/dynamic';
import Link from 'next/link';

// 3. Absolute paths via @/ alias
import { NAVIGATION } from '@/config';
import { useScramble } from '@/hooks';

// 4. Relative paths
import MobileNav from './mobile-nav';
import styles from './header.module.scss';
```

---

## 5. Path Alias

The project uses `@/` to resolve from `src/`:

```ts
// tsconfig.json
"paths": {
  "@/*": ["./src/*"]
}

// Usage
import { SITE_CONFIG } from '@/config';           // src/config/index.ts
import { useScramble } from '@/hooks';             // src/hooks/index.ts
import { ContentSection } from '@/components/ui/content-section';
```

Always prefer `@/` over deeply nested `../../` relative paths when crossing folder boundaries.

---

## 6. Deleting Unused Files and Folders

Before deleting any folder, grep for actual usage:

```bash
# Check if any file imports from a folder
grep -r "from '@/components/layout" src/

# Check if a component file is imported anywhere
grep -r "SkipLink" src/

# Check if an index barrel is used
grep -r "from '@/components/ui'" src/
```

If zero results → safe to delete.

Common dead code patterns:
- Intermediate barrel that re-exports from another barrel
- `components/layout/` folder duplicating what's already in `components/ui/`
- `PageTitle.tsx` wrapper that simply wraps `ScrambleText` — check whether the wrapper adds value or can be inlined
