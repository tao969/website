````skill
---
name: nextjs-react-standards
description: This skill should be used when the user asks to "create a Next.js project", "refactor folder structure", "add a React component", "create a custom hook", "name a file", "organize components", "fix file naming", "rename components to lowercase", "follow Next.js conventions", "avoid PascalCase filenames", "remove barrel files", "use kebab-case", "set up middleware", "optimize bundle", "apply coding standards", "follow TypeScript best practices", or when building, reviewing, or refactoring any Next.js App Router / React codebase. Synthesizes official Next.js file conventions, React hook patterns, Vercel performance guidelines, and universal TypeScript/JavaScript coding standards into a single actionable reference.
version: 1.0.0
---

# Next.js + React Standards

Comprehensive standards for Next.js App Router projects using React 18/19, TypeScript, and SCSS Modules. Covers file naming, folder structure, component patterns, hook conventions, and performance rules.

## Core Principles

1. **Lowercase everything** — all source files use `kebab-case`, never `PascalCase` or `camelCase` filenames.
2. **Colocation** — keep related files (component + styles + types) in the same folder.
3. **No mega barrels** — avoid `index.ts` that re-exports entire directories; use per-folder index only.
4. **'use client' as deep as possible** — default to Server Components; push the client boundary to leaf nodes.
5. **No magic values** — all timing, thresholds, and keys live in `src/lib/constants.ts`.

---

## File & Folder Naming

### Rule: All files use kebab-case

```
src/
  components/
    ui/
      hero-section/
        hero-section.tsx       ← component file
        hero-section.module.scss
        index.ts               ← exports HeroSection
      scramble/
        scramble.tsx
        scramble.module.scss
        page-title.tsx
        index.ts
  hooks/
    use-scramble.ts
    use-theme.ts
  lib/
    constants.ts
    utils.ts
    fonts.ts
    validators.ts
```

### What is forbidden

| Pattern | Wrong | Correct |
|---|---|---|
| PascalCase filename | `Header.tsx` | `header.tsx` |
| camelCase filename | `mobileNav.tsx` | `mobile-nav.tsx` |
| Verbose SCSS names | `hero-section.module.scss` | `hero.module.scss` (when folder is already `hero-section/`) |
| Generic component SCSS | `NetworkOrb.module.scss` | `canvas.module.scss` (describes role) |
| Mega barrel | `components/index.ts` re-exporting all | delete it |
| Unused layout folder | `components/layout/` duplicating ui/ | delete it |

### Next.js special files (always lowercase, enforced by Next.js)

```
app/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
  (route-group)/
    layout.tsx
    page.tsx
src/
  proxy.ts        ← Next.js 16+ edge proxy (was middleware.ts in ≤15)
  middleware.ts   ← deprecated in Next.js 16, use proxy.ts instead
```

> **Next.js 16+** uses `proxy.ts` as the new convention. `middleware.ts` is deprecated and triggers a build warning.

---

## Component Conventions

### Named exports, not default (except page files)

```typescript
// components/ui/header/header.tsx
export function Header() { ... }           // named export

// app/(main)/page.tsx — Next.js requires default
export default function HomePage() { ... } // default only for Next.js files
```

### Server vs Client boundary

```typescript
// Default: Server Component — no directive needed
export function Footer() {
  return <footer>...</footer>
}

// Client Component — add directive only when needed
'use client';
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  ...
}
```

Apply `'use client'` only to the leaf component that actually needs interactivity. Never add it to a parent RSC to pass through state.

### Component file structure (internal order)

```typescript
'use client'; // 1. directive (if client)

// 2. External imports
import { useCallback, useRef } from 'react';
import Link from 'next/link';

// 3. Internal imports (alias paths first, relative last)
import { NAVIGATION } from '@/config';
import styles from './header.module.scss';

// 4. Types / interfaces
interface HeaderProps {
  className?: string;
}

// 5. Constants scoped to this file
const NAV_ID = 'site-nav';

// 6. Component
export function Header({ className }: HeaderProps) {
  ...
}
```

### Memo — use sparingly

Apply `memo` only to components that:
- Receive only scalar/stable props (e.g., `readonly` data arrays)
- Are known to re-render frequently from parent state changes

```typescript
export const WorkList = memo(function WorkList({ categories }: WorkListProps) {
  ...
});
```

Do not wrap every component with `memo` — the overhead outweighs the benefit for most components.

---

## Hook Conventions

### Naming: always `use` prefix, camelCase function, kebab-case file

```
hooks/
  use-scramble.ts    → export function useScramble(...)
  use-theme.ts       → export function useTheme()
```

### Ref pattern for always-fresh callbacks

```typescript
// Avoid stale closure bugs in useEffect by using a ref
const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback; });
```

### AbortController for multi-listener cleanup (React 19 / modern)

```typescript
useEffect(() => {
  if (!isOpen) return;
  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener('keydown', handleKey, { signal });
  document.addEventListener('mousedown', handleClick, { signal });

  return () => controller.abort(); // removes all listeners at once
}, [isOpen]);
```

### Custom hook checklist

- Returns a stable object (use `useMemo` or individual `useCallback`s)
- Has no side effects in its return value
- Cleans up timers / observers / rAF in the effect cleanup
- Named with `use` prefix — linters enforce this

---

## TypeScript Standards

### Strict mode — always on

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Prefer `interface` for component props, `type` for unions

```typescript
// Props — interface
interface ScrambleTextProps {
  children: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

// Union type
type Theme = 'light' | 'dark' | 'system';
type ProjectStatus = 'live' | 'wip' | 'coming-soon' | 'archived';
```

### `as const` for static data

```typescript
export const ROUTES = {
  HOME:     '/',
  WORK:     '/work',
  ARTICLES: '/articles',
} as const;

export const NAVIGATION = [
  { name: 'Work',     href: ROUTES.WORK },
  { name: 'Articles', href: ROUTES.ARTICLES },
] as const;
```

---

## Import Alias Rules

Always use the `@/` alias for cross-cutting imports. Never use `../../../../`:

```typescript
// correct
import { AUTHOR } from '@/config';
import { useScramble } from '@/hooks/use-scramble';
import { cn } from '@/lib/utils';
import styles from './header.module.scss'; // relative only for co-located files
```

Configure alias in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Barrel Index Rules

### Use per-folder index for public API, never mega barrel

```typescript
// components/ui/header/index.ts  — correct, small scope
export { Header } from './header';

// components/index.ts  — WRONG, re-exports entire tree
// DELETE this file; consumers import from sub-paths
```

### Dead folder detection

A folder is dead if:
1. No file in `app/` or any component imports from it
2. It merely re-exports paths already accessible via sub-path imports
3. It was created for "organization" but no consumer ever uses it

Delete dead folders. Common culprits: `components/layout/`, top-level `components/index.ts`, top-level `components/ui/index.ts`.

---

## SCSS Module Rules

- Filename matches the primary component role, not the component's own name when already captured by the folder name
- Keep global styles in `src/styles/` (`globals.scss`, `reset.scss`, `typography.scss`)
- Use SCSS variables / mixins from `src/styles/abstracts/` — never hardcode colors or breakpoints
- Class names: camelCase inside `.module.scss` files

```scss
// correct
.sectionInner { ... }
.rowIndex     { ... }

// wrong
.section-inner { ... }
.row_index     { ... }
```

---

## Performance Quick Rules

- Use `next/dynamic` with `{ ssr: false }` for canvas/WebGL/heavy client components
- Keep `'use client'` boundary as a thin shell wrapping the dynamic import
- Hoist static JSX (no props, no state) outside the component function
- Use `useCallback` + `useRef` for callbacks passed to `useEffect` deps
- Use passive event listeners for all scroll handlers: `{ passive: true }`

---

## Quick Validation Checklist

Before committing any component:

- [ ] Filename is kebab-case
- [ ] SCSS module file name matches component role (not its own name if folder captures it)
- [ ] `'use client'` only on the leaf that needs it
- [ ] No PascalCase in import paths (e.g., `from './Header'`)
- [ ] No unused barrel files
- [ ] All magic values extracted to `constants.ts`
- [ ] `as const` on all static config arrays/objects
- [ ] AbortController used when registering multiple DOM listeners
- [ ] Cleanup in every `useEffect` that sets timers/rAF/observers

---

## Additional Resources

### Reference Files

For detailed patterns and decision trees, load:

- **`references/file-naming.md`** — exhaustive naming rules with before/after tables for every file type
- **`references/component-patterns.md`** — RSC vs Client, forwardRef, memo, context, dynamic imports
- **`references/performance.md`** — Vercel-sourced bundle optimization, re-render avoidance, waterfall elimination

Apply these references when performing a full structural audit, migrating a large existing codebase, or when a specific pattern isn't covered in this SKILL.md.
````
