# Performance Reference

Vercel-sourced and industry-standard performance rules for Next.js App Router + React projects.

Rules are ordered by impact (highest first).

---

## 1. Eliminating Waterfalls (CRITICAL)

### Use `Promise.all` for independent async operations

```typescript
// wrong — sequential (waterfall)
const user   = await fetchUser(id);
const posts  = await fetchPosts(id);
const stats  = await fetchStats(id);

// correct — parallel
const [user, posts, stats] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchStats(id),
]);
```

### Start promises early, `await` late in server actions

```typescript
// wrong
export async function action(id: string) {
  const data = await fetchData(id);   // awaited immediately
  const user = await fetchUser(id);   // blocked on previous
  return { data, user };
}

// correct
export async function action(id: string) {
  const dataPromise = fetchData(id);  // start both immediately
  const userPromise = fetchUser(id);
  const [data, user] = await Promise.all([dataPromise, userPromise]);
  return { data, user };
}
```

---

## 2. Bundle Size (CRITICAL)

### Use `next/dynamic` for heavy client components

```typescript
// components/ui/network-orb/loader.tsx
'use client';
import dynamic from 'next/dynamic';

const NetworkOrb = dynamic(
  () => import('./canvas').then((m) => ({ default: m.NetworkOrb })),
  { ssr: false },   // canvas/WebGL never runs on server
);
```

As a rule of thumb: any component pulling in a dependency > 30 kB should be dynamically imported.

### Avoid barrel re-exports for bundle-critical paths

```typescript
// wrong — forces bundler to include the entire ui/ tree
import { Header, Footer, RevealSection } from '@/components/ui';

// correct — tree-shaking works, only header is bundled for this chunk
import { Header } from '@/components/ui/header';
```

Delete top-level barrel files (`components/index.ts`, `components/ui/index.ts`) that re-export sub-trees.

### Defer third-party analytics / logging after hydration

```typescript
useEffect(() => {
  // runs only after hydration — not included in initial bundle evaluation
  import('../lib/analytics').then((m) => m.init());
}, []);
```

---

## 3. Server-Side Performance (HIGH)

### Use `React.cache()` for per-request deduplication (RSC)

```typescript
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
```

Multiple RSCs calling `getUser(id)` within the same request will share one fetch.

### Minimize data serialized into RSC props

```typescript
// wrong — serializes the entire user object to the client bundle
<ClientComponent user={largeUserObject} />

// correct — pass only what the client actually renders
<ClientComponent name={user.name} avatarUrl={user.avatarUrl} />
```

### Hoist static I/O to module level

```typescript
// wrong — reads the same static file on every request
export default async function Page() {
  const config = await readFile('config.json');
  ...
}

// correct — evaluated once at module load
const config = await readFile('config.json'); // top-level await in RSC

export default async function Page() { ... }
```

---

## 4. Re-render Avoidance (MEDIUM)

### Functional `setState` for stable callbacks

```typescript
// wrong — references stale `isOpen` in deps
const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);

// correct — functional update, no stale closure
const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
```

### Use refs for transient, high-frequency values

```typescript
// wrong — triggers re-render every scroll event
const [velocity, setVelocity] = useState(0);
window.addEventListener('scroll', () => setVelocity(computeVelocity()));

// correct — mutate ref, no re-render
const velocityRef = useRef(0);
window.addEventListener('scroll', () => { velocityRef.current = computeVelocity(); });
```

### Derive state during render, not inside effects

```typescript
// wrong — extra useEffect + state for derived value
const [isOpen, setIsOpen]   = useState(false);
const [label, setLabel]     = useState('Open menu');
useEffect(() => { setLabel(isOpen ? 'Close menu' : 'Open menu'); }, [isOpen]);

// correct — derived during render, zero extra state
const label = isOpen ? 'Close menu' : 'Open menu';
```

### Hoist static JSX outside component

```typescript
// wrong — new object created every render
function Header() {
  const logoPath = (
    <path fill="currentColor" d="M12.53 17.783v-9.08..." />
  );
  return <svg>{logoPath}</svg>;
}

// correct — allocated once at module level
const LOGO_PATH = (
  <path fill="currentColor" d="M12.53 17.783v-9.08..." />
);

function Header() {
  return <svg>{LOGO_PATH}</svg>;
}
```

### Hoist non-primitive default props

```typescript
// wrong — new array created on every render, breaks memo
function List({ items = [] }: { items?: string[] }) { ... }

// correct — stable reference
const EMPTY: string[] = [];
function List({ items = EMPTY }: { items?: string[] }) { ... }
```

---

## 5. Rendering Performance (MEDIUM)

### Animate wrapper `div`, not the SVG element directly

```typescript
// wrong — animating SVG attributes in JS is slow
<svg style={{ transform: \`rotate(\${angle}deg)\` }}>...</svg>

// correct — animate a wrapping div, GPU-composited
<div style={{ transform: \`rotate(\${angle}deg)\` }}>
  <svg>...</svg>
</div>
```

### Suppress expected hydration mismatch

```typescript
// correct — only for known-safe mismatches (e.g., timestamps, locale)
<time suppressHydrationWarning>{new Date().toLocaleDateString()}</time>
```

Do not use `suppressHydrationWarning` to hide real bugs.

### `useTransition` for non-urgent updates

```typescript
const [isPending, startTransition] = useTransition();

function handleFilter(value: string) {
  startTransition(() => {
    setFilter(value); // deprioritized — input stays responsive
  });
}
```

---

## 6. JavaScript Performance (LOW-MEDIUM)

### Build `Map` / `Set` for repeated lookups

```typescript
// wrong — O(n) lookup on every render
const label = STATUS_LABELS.find((l) => l.key === status)?.value;

// correct — O(1) lookup after one-time build
const STATUS_LABEL_MAP = new Map(STATUS_LABELS.map((l) => [l.key, l.value]));
const label = STATUS_LABEL_MAP.get(status);
```

### Cache `localStorage` / `sessionStorage` reads

```typescript
// wrong — reads storage on every call
function getTheme() {
  return localStorage.getItem('theme');
}

// correct — read once, cache in module scope
let cachedTheme: string | null = null;
function getTheme() {
  if (cachedTheme === null) cachedTheme = localStorage.getItem('theme');
  return cachedTheme;
}
```

### Passive event listeners for scroll

```typescript
window.addEventListener('scroll', handler, { passive: true });
// lets the browser skip calling preventDefault check — smoother scrolling
```

### Hoist RegExp outside loops

```typescript
// wrong — new RegExp compiled on every iteration
items.forEach((item) => {
  if (/\s/.test(item)) { ... }
});

// correct — compiled once
const WHITESPACE = /\s/;
items.forEach((item) => {
  if (WHITESPACE.test(item)) { ... }
});
```

---

## 7. Next.js Image Optimization

Always use `next/image` for images that ship with the app:

```tsx
import Image from 'next/image';

// sizes prop required for responsive images outside fixed layouts
<Image
  src="/profile.png"
  alt="Profile"
  width={400}
  height={400}
  priority               // LCP image: add priority
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

Rules:
- Always provide `alt` (empty string `""` for decorative images)
- Add `priority` to the LCP image on each page
- Provide `sizes` for images that change width at breakpoints
- Use `fill` + a positioned container for aspect-ratio-controlled images

---

## 8. Font Loading

```typescript
// lib/fonts.ts — module-level, evaluated once
import localFont from 'next/font/local';

export const ppFraktionMono = localFont({
  src: [
    { path: '../../public/fonts/pp-fraktion/PPFraktionMono-Regular.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-pp',
  display:  'swap',   // prevents invisible text during load
  preload:  true,
});
```

Apply in root layout:

```tsx
// app/layout.tsx
import { ppFraktionMono, khInterference } from '@/lib/fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${ppFraktionMono.variable} ${khInterference.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 9. Security Headers (next.config.ts)

Always set these via `next.config.ts`:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Permissions-Policy` | restrict camera, mic, geo, payment |

Use a static `SECURITY_HEADERS` array at module level for readability and reuse.

---

## Performance Audit Checklist

- [ ] `Promise.all` for all independent async calls in server actions
- [ ] `next/dynamic` with `ssr: false` for canvas / WebGL / heavy client libs
- [ ] No top-level barrel re-exports (`components/index.ts` deleted)
- [ ] Static JSX hoisted outside component functions where possible
- [ ] Non-primitive default props hoisted to module scope
- [ ] `{ passive: true }` on all scroll / touch event listeners
- [ ] `React.cache()` on database and fetch calls in RSCs
- [ ] LCP `<Image>` has `priority` attribute
- [ ] Fonts loaded via `next/font/local` with `display: 'swap'`
- [ ] No `useEffect` used for derivable state
- [ ] Functional `setState` everywhere previous state is needed
