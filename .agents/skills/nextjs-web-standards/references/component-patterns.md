# Component Patterns

Deep reference for RSC vs `'use client'`, component structure, dynamic imports, memo, forwardRef, and React 19 patterns.

---

## 1. RSC vs Client Component Decision Tree

```
Does the component use:
├── useState / useReducer?          → 'use client'
├── useEffect / useLayoutEffect?    → 'use client'
├── Event listeners (onClick etc)?  → 'use client'
├── Browser APIs (window, document)?→ 'use client'
├── Custom hooks that use any above?→ 'use client'
└── None of the above?              → RSC (no directive)
```

### Default: RSC

Leave out the directive. RSC renders on the server, never sends component JS to the browser:

```tsx
// hero.tsx — RSC by default, no directive
import { HOME_CONTENT } from '@/config';
import styles from './hero.module.scss';

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1>{HOME_CONTENT.hero.name}</h1>
    </section>
  );
}
```

### Add 'use client' only at the leaf

If only one nested element needs client interactivity, extract it:

```tsx
// ✓ RSC parent — no directive
export function WorkPage() {
  return (
    <div>
      <WorkList />   {/* RSC: pure data rendering */}
      <FilterBar />  {/* 'use client': has useState */}
    </div>
  );
}
```

### 'use client' files

The directive must be the **first line** of the file:

```tsx
'use client';

import { useState } from 'react';
// ...
```

---

## 2. Client Boundary Isolation Pattern

Use a thin client shell to keep larger parents as RSC:

```tsx
// shell.tsx — 'use client' (minimal, thin)
'use client';

import { useCallback, useState } from 'react';
import { Loader } from './loader';
import { Phrase } from './phrase';

export function Shell() {
  const [phrase, setPhrase] = useState<string | null>(null);

  const handleClick = useCallback(({ phrase }: { phrase: string }) => {
    setPhrase(phrase);
  }, []);

  return (
    <>
      <Loader onNodeClick={handleClick} />
      <Phrase phrase={phrase} />
    </>
  );
}

// hero.tsx — RSC (parent stays server-side)
import { Shell } from './shell';

export function HeroSection() {
  return (
    <section>
      <Shell />          {/* only Shell is client */}
    </section>
  );
}
```

---

## 3. Dynamic Imports (next/dynamic)

Use `next/dynamic` with `ssr: false` for:
- Canvas / WebGL components
- Heavy animation libraries
- Components that access `window` on mount

The `dynamic()` call **must live inside a `'use client'` file**:

```tsx
'use client';

import dynamic from 'next/dynamic';

// ✓ Correct pattern: thin loader file
const Canvas = dynamic(
  () => import('./canvas').then((m) => ({ default: m.Canvas })),
  { ssr: false },
);

interface LoaderProps {
  onNodeClick?: (payload: { phrase: string }) => void;
}

export function CanvasLoader({ onNodeClick }: LoaderProps) {
  return <Canvas onNodeClick={onNodeClick} />;
}
```

Never put `dynamic()` directly inside an RSC or a component that might be used in SSR context.

---

## 4. React.memo

Apply `memo` only to components that:
1. Accept stable, primitive-like props
2. Are rendered frequently by a parent that re-renders often
3. Have expensive rendering logic

```tsx
import { memo } from 'react';
import type { ProjectCategory } from '@/config';

interface WorkListProps {
  categories: readonly ProjectCategory[];
}

// ✓ Good use: receives static array, parent may re-render
export const WorkList = memo(function WorkList({ categories }: WorkListProps) {
  return (
    <div>
      {categories.map((c) => (
        <div key={c.name}>{c.name}</div>
      ))}
    </div>
  );
});
```

**Do not memo:**
- Components that always receive new object/array props (memo is wasted)
- Simple components with fast render cost
- Components that rarely re-render anyway

---

## 5. useCallback and useRef for Stable References

Use `useCallback` when passing functions as props to memoized children or as dependencies to `useEffect`:

```tsx
// ✓ Stable reference: prevents child re-render on every parent render
const close  = useCallback(() => setIsOpen(false), []);
const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
```

Use `useRef` for values that:
- Need to survive re-renders without causing a re-render
- Hold DOM nodes
- Cache the latest version of a callback (always-fresh ref pattern)

```tsx
// Always-fresh ref: latest scramble function without stale closure
const scrambleRef = useRef<(durationOverride?: number) => void>(scramble);
useEffect(() => {
  scrambleRef.current = scramble;
});
```

---

## 6. forwardRef Pattern (React 19)

Expose a DOM ref from a component:

```tsx
'use client';

import { forwardRef } from 'react';

interface PhraseProps {
  phrase: string | null;
}

export const Phrase = forwardRef<HTMLDivElement, PhraseProps>(
  function Phrase({ phrase }, ref) {
    return (
      <div ref={ref} aria-live="polite" aria-atomic="true">
        {phrase}
      </div>
    );
  },
);
```

In React 19, `ref` can be passed as a plain prop — `forwardRef` is no longer required but remains valid.

---

## 7. Custom Hooks

### Naming rule

All custom hooks must start with `use` + `PascalCase`:

```ts
useScramble    ✓
useTheme       ✓
scramble       ✗  (not a hook, missing use prefix)
useScrollVelocityHook   ✗  (redundant Hook suffix)
```

### Structure

```ts
// hooks/use-scramble.ts

import { useCallback, useEffect, useRef } from 'react';

export interface ScrambleOptions {
  speed?:      number;
  revealSpeed?: number;
  onComplete?: () => void;
}

export function useScramble(
  text:       string,
  onScramble: (t: string) => void,
  options:    ScrambleOptions = {},
) {
  // always-fresh option refs
  const durationRef = useRef(options.speed ?? 800);
  useEffect(() => {
    durationRef.current = options.speed ?? 800;
  });

  const scramble = useCallback((durationOverride?: number) => {
    // animation logic ...
  }, [text, onScramble]);

  return { scramble };
}
```

### Placement

- If hook is **generic and reusable** → `src/hooks/use-name.ts` + export from `src/hooks/index.ts`
- If hook is **tightly coupled to one component** → colocate next to the component file

---

## 8. Event Handler Conventions

### Naming

```tsx
// Prop (what parent declares)  → on + PascalCase
interface OrbProps {
  onNodeClick?:      (payload: { phrase: string }) => void;
  onPositionUpdate?: (x: number, y: number) => void;
}

// Handler (what component defines) → handle + PascalCase
const handleNodeClick = useCallback(({ phrase }) => {
  setPhrase(phrase);
}, []);

// Pass to child
<Orb onNodeClick={handleNodeClick} />
```

### AbortController cleanup pattern (React 19 / modern)

Prefer `AbortController` over manual `removeEventListener`:

```tsx
useEffect(() => {
  if (!isOpen) return;

  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  }, { signal });

  document.addEventListener('mousedown', (e) => {
    if (!navRef.current?.contains(e.target as Node)) close();
  }, { signal });

  return () => {
    controller.abort();  // removes all listeners at once
  };
}, [isOpen, close]);
```

---

## 9. Component File Structure Order

Every `.tsx` file follows this order for consistency:

```tsx
'use client';              // 1. directive (only if needed)

// 2. React imports
import { useCallback, useState } from 'react';
// 3. Next.js imports
import Link from 'next/link';
// 4. Internal @/ imports
import { NAVIGATION } from '@/config';
import { useScramble } from '@/hooks';
// 5. Relative imports
import styles from './header.module.scss';

// 6. Module-level constants
const NAV_ID = 'site-nav';
const STAGGER_MS = 85;

// 7. TypeScript interfaces / types
interface HeaderProps {
  className?: string;
}

// 8. Component export (default or named)
export default function Header({ className }: HeaderProps) {
  // ...
}
```

---

## 10. TypeScript Strictness Rules

Always enable in `tsconfig.json`:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

Prefer `interface` over `type` for object shapes. Prefer `type` for unions/intersections:

```ts
interface NavItem {          // shape → interface
  name: string;
  href: string;
}

type Theme = 'light' | 'dark' | 'system';   // union → type
type ProjectStatus = 'live' | 'wip' | 'coming-soon' | 'archived';
```

Use `readonly` on all config/data arrays and properties:

```ts
export const NAVIGATION: readonly NavItem[] = [
  { name: 'Work', href: '/work' },
] as const;
```
