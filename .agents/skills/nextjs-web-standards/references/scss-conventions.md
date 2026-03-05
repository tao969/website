# SCSS Conventions

Module naming, BEM variant for CSS Modules, variable naming, SCSS abstracts structure, and global vs module scope rules.

---

## 1. SCSS Module File Naming

Name the SCSS module file after the **shortest meaningful noun** that describes the component, matching the component file name:

| Component file | SCSS module | ✗ Avoid |
|---|---|---|
| `hero.tsx` | `hero.module.scss` | `hero-section.module.scss` |
| `reveal.tsx` | `reveal.module.scss` | `reveal-section.module.scss` |
| `work-list.tsx` | `work-list.module.scss` | `worklist.module.scss` |
| `platform-list.tsx` | `platform-list.module.scss` | `platform.module.scss` |
| `canvas.tsx` | `canvas.module.scss` | `network-orb.module.scss` |
| `phrase.tsx` | `phrase.module.scss` | `node-phrase.module.scss` |
| `skip-link.tsx` | `skip-link.module.scss` | — |

**Rule:** Component filename and SCSS filename are always in 1-to-1 correspondence. If you rename a component file, rename its SCSS module immediately.

---

## 2. Importing SCSS Modules

Always import as `styles`:

```tsx
import styles from './hero.module.scss';

// ✓ Apply module class
<section className={styles.hero}>
  <div className={styles.heroInner}>
```

Never rename the import:

```tsx
import heroStyles from './hero.module.scss';   // ✗ inconsistent
import s from './hero.module.scss';             // ✗ too short, unreadable
```

---

## 3. Class Naming Inside SCSS Modules

Use **camelCase** inside CSS Modules (not BEM dashes), because they compile to mangled identifiers and are accessed via `styles.camelCase`:

```scss
// hero.module.scss

.hero {
  position: relative;
  min-height: 100dvh;
}

.heroInner {          // ✓ camelCase compound
  display: flex;
  align-items: center;
}

.hero__inner {        // ✗ BEM — works but is verbose in JS (styles['hero__inner'])
}
```

**Exception:** Single-word classes are fine in either case:

```scss
.wrap { }    // ✓
.root { }    // ✓
.label { }   // ✓
```

---

## 4. Dynamic Class Composition

Use template literals or `cn()` (clsx wrapper from `@/lib/utils`):

```tsx
// Template literal: 2 classes
<div className={`${styles.row}${isDisabled ? ` ${styles.rowDisabled}` : ''}`} />

// cn() helper: cleaner for 3+ conditions
import { cn } from '@/lib/utils';

<div className={cn(styles.row, isDisabled && styles.rowDisabled, isActive && styles.rowActive)} />
```

Never use string concatenation without a space guard:

```tsx
// ✗ Bug: 'rowrowDisabled' when both apply
<div className={styles.row + styles.rowDisabled} />
```

---

## 5. Abstracts Directory

Place all reusable SCSS tools in `src/styles/abstracts/`. These files contain no output CSS — only variables, mixins, functions, and placeholders:

```
src/styles/abstracts/
├── _variables.scss    ← CSS custom properties + SCSS variables
├── _mixins.scss       ← Reusable include blocks
├── _functions.scss    ← Pure SCSS functions (px-to-rem, etc.)
├── _fonts.scss        ← @font-face declarations
├── _font-style.scss   ← Font utility classes
├── _layout-grid.scss  ← Container + grid mixins
└── _scroll.scss       ← Scroll behaviour utilities
```

Include abstract files via `@use`, not `@import` (deprecated):

```scss
// Inside a SCSS module
@use 'abstracts/variables' as *;
@use 'abstracts/mixins' as *;
```

The `includePaths` in `next.config.ts` makes `src/styles/` the resolve root:

```ts
// next.config.ts
sassOptions: {
  includePaths: [path.join(__dirname, 'src/styles')],
},
```

---

## 6. CSS Custom Properties vs SCSS Variables

Use **CSS custom properties** (`--var`) for values that:
- Change between themes (light/dark)
- Are consumed by JavaScript (`element.style.setProperty`)
- Apply to animation timing via inline styles

Use **SCSS variables** (`$var`) for values that:
- Are compile-time only (never change at runtime)
- Are used in calculations inside SCSS only

```scss
// _variables.scss

// CSS custom props — runtime theme, accessed by JS
:root {
  --color-bg:      #1c1c1c;
  --color-ink:     #f0ede4;
  --color-accent:  #8799ff;
  --font-kh:       'KH Interference', system-ui, sans-serif;
  --font-pp:       'PP FraktionMono', monospace;
  --transition-fast:   150ms;
  --transition-normal: 300ms;
}

// SCSS variables — compile-time only
$breakpoint-sm:    640px;
$breakpoint-md:    768px;
$breakpoint-lg:    1024px;
$container-max:    1280px;
$container-padding: clamp(1rem, 4vw, 3rem);
```

---

## 7. Global vs Module Scope

| Concern | Location |
|---|---|
| CSS reset | `src/styles/reset.scss` |
| Base typography (body, h1-h6) | `src/styles/typography.scss` |
| Utility classes (`.container`, `.sr-only`) | `src/styles/utilities.scss` |
| CSS custom properties (:root) | `src/styles/abstracts/_variables.scss` |
| Component-specific styles | `[component].module.scss` (colocated) |
| Keyframe animations | In the module that uses them, or `globals.scss` if shared |

Never put component-specific rules in `globals.scss`. Never put global reset rules in a module file.

---

## 8. Responsive Design Pattern

Use `clamp()` for fluid values before reaching for breakpoint media queries:

```scss
// ✓ Fluid typography — no media query needed
.name {
  font-size: clamp(3.5rem, 12vw, 9rem);
}

// ✓ Fluid spacing
.section {
  padding-block: clamp(4rem, 10vh, 8rem);
}
```

Use breakpoints only for structural changes (switching from 1 column to 2 columns):

```scss
@use 'abstracts/variables' as *;

.grid {
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: 1fr 1fr;
  }
}
```

---

## 9. Accessibility-Required Styles

Every interactive element must have visible focus styles:

```scss
.link {
  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
  }
}
```

Never use `outline: none` without a custom replacement.

Skip-link pattern — visually hidden until focused:

```scss
.skipLink {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;

  &:focus {
    position: fixed;
    top: 1rem;
    left: 1rem;
    width: auto;
    height: auto;
    padding: 0.5rem 1rem;
    background: var(--color-accent);
    color: var(--color-bg);
    z-index: 9999;
  }
}
```

---

## 10. Animation Conventions

Define keyframes inside the module that uses them:

```scss
// reveal.module.scss

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  opacity: 0;
  transition: opacity var(--transition-slow), transform var(--transition-slow);
  transition-delay: var(--reveal-delay, 0ms);
}

.visible {
  opacity: 1;
  transform: translateY(0);
}
```

CSS custom property `--reveal-delay` is set via inline style from React:

```tsx
style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
```

This avoids generating a unique class per delay value.
