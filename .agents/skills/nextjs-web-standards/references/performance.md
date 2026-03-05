# Performance Patterns

Rules for bundle optimization, re-render prevention, passive event listeners, dynamic imports, and canvas/animation performance.

---

## 1. Bundle Optimization

### Avoid barrel re-imports for tree-shaking

Import from the nearest specific path, not from a mega-barrel:

```ts
// ✓ Specific: bundler tree-shakes unused exports
import { ContentSection } from '@/components/ui/content-section';
import { RevealSection }  from '@/components/ui/reveal';

// ✗ Mega-barrel: bundler may pull in entire subtree
import { ContentSection, RevealSection } from '@/components';
```

### Dynamic import for heavy client components

Any component that runs canvas/WebGL/heavy animation must be loaded dynamically with `ssr: false`:

```tsx
'use client';
import dynamic from 'next/dynamic';

// ✓ Split into separate JS chunk, never in SSR bundle
const Canvas = dynamic(
  () => import('./canvas').then((m) => ({ default: m.Canvas })),
  { ssr: false },
);
```

This pattern (Vercel `bundle-dynamic-imports`) keeps the initial bundle small. The canvas chunk loads only when the component mounts in the browser.

### Defer third-party scripts

Don't import analytics / logging at module level. Load after hydration:

```tsx
useEffect(() => {
  // runs only on client, after hydration
  import('./analytics').then((m) => m.init());
}, []);
```

---

## 2. Re-render Prevention

### useRef for transient values (Vercel `rerender-use-ref-transient-values`)

Values that change frequently but don't need to trigger re-renders belong in `useRef`, not `useState`:

```tsx
// ✓ ref: position updates every rAF frame, no re-render needed
const phraseElRef = useRef<HTMLDivElement>(null);

const handlePosition = useCallback((x: number, y: number) => {
  if (phraseElRef.current) {
    phraseElRef.current.style.left = `${x}px`;   // direct DOM mutation
    phraseElRef.current.style.top  = `${y}px`;   // direct DOM mutation
  }
}, []);

// ✗ state: would trigger re-render every animation frame
const [pos, setPos] = useState({ x: 0, y: 0 });
```

### Functional setState for stable callbacks

```ts
// ✓ No stale closure risk
const toggle = useCallback(() => setIsOpen(prev => !prev), []);

// ✗ Captures stale isOpen
const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);
```

### Primitive dependencies in effects

```ts
// ✓ Primitive values: stable identity
useEffect(() => {
  durationRef.current = options.speed ?? 800;
});  // no array: runs every render (intentional: keeps ref fresh)

// ✗ Object in dep array: new reference every render → infinite loop
const opts = { speed: 800 };
useEffect(() => { /* ... */ }, [opts]);   // opts is new object every render
```

### Hoist static JSX outside components (Vercel `rendering-hoist-jsx`)

```tsx
// ✓ Created once at module level
const LOGO_SVG = (
  <svg width="18" height="18" viewBox="0 0 21 23">
    <path fill="currentColor" d="..." />
  </svg>
);

export function Header() {
  return <header>{LOGO_SVG}</header>;
}

// ✗ New JSX node every render
export function Header() {
  return (
    <header>
      <svg width="18" height="18" viewBox="0 0 21 23">
        <path fill="currentColor" d="..." />
      </svg>
    </header>
  );
}
```

---

## 3. Event Listener Best Practices

### Passive listeners for scroll/touch (Vercel `client-passive-event-listeners`)

```ts
// ✓ passive: browser skips waiting for preventDefault → better scroll perf
window.addEventListener('scroll', handler, { passive: true });
document.addEventListener('touchstart', handler, { passive: true });

// ✗ Non-passive scroll listener blocks main thread
window.addEventListener('scroll', handler);
```

### Single global scroll tracker (Vercel `client-event-listeners`)

Register `window.scroll` listener once at module level, not per-component:

```ts
// lib/utils.ts — single module-level listener
let currentVelocity = 0;
let lastScrollY = 0;
let lastScrollTime = 0;
let decayTimer: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      const now = performance.now();
      const dy  = Math.abs(window.scrollY - lastScrollY);
      const dt  = now - lastScrollTime;
      if (dt > 0) currentVelocity = currentVelocity * 0.4 + (dy / dt) * 0.6;
      lastScrollY    = window.scrollY;
      lastScrollTime = now;
      if (decayTimer !== null) clearTimeout(decayTimer);
      decayTimer = setTimeout(() => { currentVelocity = 0; }, 200);
    },
    { passive: true },
  );
}

export function getScrollVelocity(): number { return currentVelocity; }
```

Components call `getScrollVelocity()` synchronously without registering their own listeners.

### AbortController for multi-listener cleanup

```tsx
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener('keydown',   onKeydown,   { signal });
  document.addEventListener('mousedown', onMousedown, { signal });
  document.addEventListener('touchend',  onTouchend,  { signal });

  return () => controller.abort(); // removes all 3 in one call
}, [onKeydown, onMousedown, onTouchend]);
```

---

## 4. IntersectionObserver Pattern

Use a callback ref instead of `useRef` + `useEffect` to avoid double-registration:

```tsx
'use client';

import { useCallback, useRef } from 'react';
import styles from './reveal.module.scss';

export function RevealSection({ children, delay = 0 }: RevealSectionProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback ref: fires with real DOM node on attach, null on detach
  const setNodeRef = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add(styles.visible);
        } else {
          node.classList.remove(styles.visible);  // bidirectional
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -32px 0px' },
    );

    observerRef.current.observe(node);
  }, []);

  return (
    <div ref={setNodeRef} className={styles.reveal} style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}
```

---

## 5. Canvas / rAF Animation Performance

Rules for zero-re-render canvas components (like `NetworkOrb`):

### All state in refs only

```tsx
'use client';
import { useEffect, useRef } from 'react';

export function Canvas({ onNodeClick }: CanvasProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sceneRef   = useRef<Scene | null>(null);
  const rafRef     = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    sceneRef.current = buildScene(canvas);

    const tick = (timestamp: number) => {
      drawFrame(sceneRef.current!, canvas, timestamp);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);  // empty array: single mount

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
```

### ResizeObserver with DPR cap

```ts
const DPR_CAP = 2;

const resizeObserver = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  const dpr = Math.min(window.devicePixelRatio, DPR_CAP);
  canvas.width  = width  * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
});

resizeObserver.observe(canvas);
// cleanup: resizeObserver.disconnect();
```

### dt cap to prevent large jumps

```ts
const MAX_DT = 50; // ms — clamp spike after tab-switch

const tick = (timestamp: number) => {
  const raw = timestamp - (prevTimestampRef.current ?? timestamp);
  const dt  = Math.min(raw, MAX_DT);
  prevTimestampRef.current = timestamp;

  // use dt for physics step
  updateScene(sceneRef.current!, dt);
  drawScene(sceneRef.current!, ctx);

  rafRef.current = requestAnimationFrame(tick);
};
```

---

## 6. Next.js Image Optimization

Use `next/image` for all images to get:
- Automatic WebP/AVIF conversion
- Responsive `srcset`
- Lazy loading by default
- CLS prevention via `width` / `height` reservation

```tsx
import Image from 'next/image';

// ✓ Known dimensions
<Image
  src="/icons/ai/svg/openai.svg"
  alt="OpenAI"
  width={24}
  height={24}
  loading="lazy"
/>

// ✓ fill layout (parent must have position:relative)
<div style={{ position: 'relative', width: '100%', height: '200px' }}>
  <Image src="/profile.png" alt="Profile" fill objectFit="cover" />
</div>

// ✗ Raw <img> tag loses all optimization
<img src="/profile.png" alt="Profile" />
```

For SVG icons loaded via canvas (not JSX), use the standard `fetch()` → `Image()` pattern and avoid importing as JSX.

---

## 7. Font Optimization (next/font/local)

```ts
// lib/fonts.ts
import localFont from 'next/font/local';

export const ppFraktionMono = localFont({
  src: [
    {
      path: '../../public/fonts/pp-fraktion/PPFraktionMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-pp',
  display: 'swap',      // ✓ avoids FOIT
  preload: true,        // ✓ <link rel="preload"> injected automatically
  fallback: ['Consolas', 'Monaco', 'monospace'],
});
```

Apply font variables only in root layout `<html>` tag — never on individual components:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${khInterference.variable} ${ppFraktionMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```
