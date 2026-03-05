# Component & Hook Patterns Reference

Detailed React patterns for Next.js App Router projects with React 18/19 and TypeScript.

---

## Server Components vs Client Components

### Decision tree

```
Does this component use:
  - useState / useReducer?
  - useEffect / useLayoutEffect?
  - Browser APIs (window, document)?
  - Event handlers (onClick, onChange)?
  - Third-party client libraries?
  → 'use client'

Otherwise: Server Component (default)
```

### Pushing the client boundary down

Prefer this structure — the heavy RSC data fetching stays on the server:

```tsx
// app/(main)/work/page.tsx  — Server Component (no directive)
import { WorkList } from '@/components/sections/work';
import { PROJECT_CATEGORIES } from '@/config';

export default function WorkPage() {
  return <WorkList categories={PROJECT_CATEGORIES} />;
}

// components/sections/work/work-list.tsx  — pure render, no state → RSC
import { memo } from 'react';
import type { ProjectCategory } from '@/config';

export const WorkList = memo(function WorkList({ categories }) {
  return (
    <div>
      {categories.map((c) => <div key={c.name}>{c.name}</div>)}
    </div>
  );
});
```

### Thin client shell pattern

Use for canvas / animation / heavy DOM interaction inside an RSC page:

```tsx
// components/ui/network-orb/shell.tsx — 'use client' thin bridge
'use client';
import { useCallback, useRef, useState } from 'react';
import { NetworkOrbLoader } from './loader';
import { NodePhrase }        from './phrase';

export function HeroShell() {
  const [phrase, setPhrase]   = useState<string | null>(null);
  const phraseElRef           = useRef<HTMLDivElement>(null);
  const handleClick           = useCallback(({ phrase }) => setPhrase(phrase), []);
  const handlePosition        = useCallback((x, y) => {
    if (phraseElRef.current) {
      phraseElRef.current.style.left = `${x}px`;
      phraseElRef.current.style.top  = `${y}px`;
    }
  }, []);
  return (
    <>
      <NetworkOrbLoader onNodeClick={handleClick} onPositionUpdate={handlePosition} />
      <NodePhrase ref={phraseElRef} phrase={phrase} />
    </>
  );
}

// components/ui/network-orb/loader.tsx — dynamic import fence
'use client';
import dynamic from 'next/dynamic';

const NetworkOrb = dynamic(
  () => import('./canvas').then((m) => ({ default: m.NetworkOrb })),
  { ssr: false },
);

export function NetworkOrbLoader({ onNodeClick, onPositionUpdate }) {
  return <NetworkOrb onNodeClick={onNodeClick} onPositionUpdate={onPositionUpdate} />;
}
```

**Rule**: `next/dynamic` with `ssr: false` must live inside a `'use client'` component.

---

## Component File Structure (internal order)

Always write components in this order:

```typescript
// 1. Directive (if client component)
'use client';

// 2. External packages
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// 3. Internal — alias paths
import { NAVIGATION, ROUTES } from '@/config';
import { useScramble }         from '@/hooks/use-scramble';
import { NODE_PHRASE_LINGER_MS } from '@/lib/constants';

// 4. Internal — relative (co-located)
import styles from './header.module.scss';

// 5. Types / interfaces
interface HeaderProps {
  className?: string;
}

// 6. File-scoped constants
const NAV_ID = 'site-nav';

// 7. Component
export function Header({ className }: HeaderProps) {
  // hooks first
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const close  = useCallback(() => setIsOpen(false), []);

  // effects after hooks
  useEffect(() => { ... }, [isOpen]);

  // return JSX last
  return (...);
}
```

---

## Hooks Reference

### useCallback + useRef for stable callbacks

```typescript
// Avoid stale closures: store latest version in a ref
const scrambleRef = useRef<(duration?: number) => void>(scramble);
useEffect(() => {
  scrambleRef.current = scramble;
}); // no deps = runs after every render (intentional)
```

### AbortController for multi-listener useEffect

```typescript
useEffect(() => {
  if (!isOpen) {
    document.body.style.overflow = '';
    return;
  }

  document.body.style.overflow = 'hidden';
  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener('keydown',   handleKey,   { signal });
  document.addEventListener('mousedown', handleClick, { signal });

  return () => {
    controller.abort();               // removes all listeners in one call
    document.body.style.overflow = '';
  };
}, [isOpen, handleKey, handleClick]);
```

### IntersectionObserver with callback ref (no useEffect deps list needed)

```typescript
const observerRef = useRef<IntersectionObserver | null>(null);

const setNodeRef = useCallback((node: HTMLElement | null) => {
  observerRef.current?.disconnect();
  observerRef.current = null;

  if (!node) return;

  observerRef.current = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add(styles.visible);
      } else {
        node.classList.remove(styles.visible);
      }
    },
    { threshold: 0.05, rootMargin: '0px 0px -32px 0px' },
  );

  observerRef.current.observe(node);
}, []); // empty deps — callback ref fires on DOM attach/detach
```

### rAF animation loop (zero re-renders)

```typescript
// All state in refs — canvas animation without triggering React renders
const animationFrameRef = useRef<number | null>(null);
const startTimeRef      = useRef<number | null>(null);

const animate = useCallback((timestamp: number) => {
  if (startTimeRef.current === null) startTimeRef.current = timestamp;
  const elapsed = timestamp - startTimeRef.current;
  // ... draw to canvas ...
  animationFrameRef.current = requestAnimationFrame(animate);
}, []);

useEffect(() => {
  animationFrameRef.current = requestAnimationFrame(animate);
  return () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };
}, [animate]);
```

---

## forwardRef (React 19 compatible)

```typescript
import { forwardRef } from 'react';

export const NodePhrase = forwardRef<HTMLDivElement, NodePhraseProps>(
  function NodePhrase({ phrase }, ref) {
    return (
      <div ref={ref} aria-live="polite" aria-atomic="true">
        {phrase}
      </div>
    );
  }
);
```

Note: In React 19, `forwardRef` is no longer required — `ref` is passable as a regular prop. When the project targets React 19 exclusively, migrate to the simplified form:

```typescript
// React 19: ref as a prop
export function NodePhrase({ phrase, ref }: NodePhraseProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref}>{phrase}</div>;
}
```

---

## Memo: when to use

Apply `memo` only when both conditions are true:
1. **Pure**: same props always produce same output
2. **Expensive**: component actually re-renders frequently AND re-rendering is expensive

```typescript
// correct use — receives only static config data as props
export const WorkList = memo(function WorkList({ categories }: WorkListProps) {
  return <div>{categories.map(...)}</div>;
});

// wrong use — simple component with primitive props
// memo overhead outweighs any benefit
const Label = memo(function Label({ text }: { text: string }) {
  return <span>{text}</span>;
});
```

---

## Context pattern

Prefer splitting context into a data context and a dispatch context to avoid unnecessary re-renders:

```typescript
// contexts/theme-context.ts
const ThemeContext    = createContext<Theme | null>(null);
const SetThemeContext = createContext<((t: Theme) => void) | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  return (
    <ThemeContext.Provider value={theme}>
      <SetThemeContext.Provider value={setTheme}>
        {children}
      </SetThemeContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme()    { return useContext(ThemeContext)!;    }
export function useSetTheme() { return useContext(SetThemeContext)!; }
```

---

## Custom hook checklist

Before shipping a custom hook:

- [ ] Named with `use` prefix
- [ ] Returns a stable object (`useCallback` / `useMemo` wrapping)
- [ ] No side effects in return value
- [ ] Every timer, observer, rAF cleaned up in `useEffect` return
- [ ] Works correctly in React Strict Mode (double-invocation)
- [ ] Handles the `null` / initial state case safely

---

## TypeScript patterns used in this codebase

### Branded `as const` for all config

```typescript
export const SITE_CONFIG = {
  name: 'tao',
  url:  'https://tao.wtf',
} as const;
```

### `readonly` arrays in interfaces

```typescript
interface WorkListProps {
  categories: readonly ProjectCategory[];
}
```

### `Record` for status label maps

```typescript
const STATUS_LABELS: Record<ProjectStatus, string> = {
  live:          'Live',
  wip:           'In progress',
  'coming-soon': 'Coming soon',
  archived:      'Archived',
};
```

### Template literal types for event names

```typescript
type ThemeDataAttr = `data-${string}`;
```

### Narrowing over `any`

```typescript
// wrong
function parseTheme(value: any): Theme { ... }

// correct
function parseTheme(value: unknown): Theme {
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return 'system';
}
```
