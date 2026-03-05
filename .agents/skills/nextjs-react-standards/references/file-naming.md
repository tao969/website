# File Naming Reference

Exhaustive naming rules for every file type in a Next.js App Router project.

## Fundamental Rule

**Every source file uses `kebab-case`**. This applies uniformly to:

- TypeScript / TSX components
- SCSS modules
- Custom hooks
- Utility files
- Config files
- Type files

The single exception is Next.js route-group folders in `app/` which use `(group-name)` — parentheses are intentional.

---

## File Type Matrix

| File type | Naming convention | Example |
|---|---|---|
| React component | `kebab-case.tsx` | `hero-section.tsx` |
| SCSS module | `kebab-case.module.scss` | `hero.module.scss` |
| Custom hook | `use-name.ts` | `use-scramble.ts` |
| Utility | `kebab-case.ts` | `utils.ts`, `validators.ts` |
| Config data | `kebab-case.ts` | `site.ts`, `nav.ts` |
| Type file | `index.ts` or `types.ts` | `src/types/index.ts` |
| Barrel index | `index.ts` | `components/ui/header/index.ts` |
| Next.js special | enforced by framework | `layout.tsx`, `page.tsx`, `loading.tsx` |

---

## Before / After: Common Mistakes

### Component files

| Before (wrong) | After (correct) | Reason |
|---|---|---|
| `Header.tsx` | `header.tsx` | PascalCase not allowed |
| `MobileNav.tsx` | `mobile-nav.tsx` | PascalCase + no separator |
| `HeroSection.tsx` | `hero.tsx` or `hero-section.tsx` | PascalCase; simplify if folder already names it |
| `NetworkOrb.tsx` | `canvas.tsx` | Name by role, not by the component name |
| `NetworkOrbLoader.tsx` | `loader.tsx` | Name by role within folder |
| `HeroShell.tsx` | `shell.tsx` | Name by role within folder |
| `NodePhrase.tsx` | `phrase.tsx` | Name by role within folder |
| `RevealSection.tsx` | `reveal.tsx` | Role > class name |
| `ScrambleText.tsx` | `scramble.tsx` | Role > class name |
| `PageTitle.tsx` | `page-title.tsx` | PascalCase |
| `ContentSection.tsx` | `content-section.tsx` | PascalCase |
| `WorkList.tsx` | `work-list.tsx` | PascalCase |
| `PlatformList.tsx` | `platform-list.tsx` | PascalCase |
| `BuiltWith.tsx` | `built-with.tsx` | PascalCase |
| `SkipLink.tsx` | `skip-link.tsx` | PascalCase |

### SCSS module files

| Before (wrong) | After (correct) | Reason |
|---|---|---|
| `hero-section.module.scss` inside `hero-section/` | `hero.module.scss` | Folder already captures "section" context |
| `network-orb.module.scss` inside `network-orb/` | `canvas.module.scss` | Describes role of the canvas element |
| `node-phrase.module.scss` inside `network-orb/` | `phrase.module.scss` | Role within folder |
| `reveal-section.module.scss` inside `reveal/` | `reveal.module.scss` | Redundant "section" suffix |

**Rule**: when the SCSS module file lives inside a folder that already captures the domain name, drop the domain prefix from the SCSS filename.

### Middleware / proxy

| Version | Convention | Notes |
|---|---|---|
| Next.js ≤ 15 | `src/middleware.ts` | Standard location |
| Next.js 16+ | `src/proxy.ts` | `middleware.ts` is deprecated — triggers build warning |

Always export a named `proxy` function (not `middleware`) from `proxy.ts`:

```typescript
// src/proxy.ts (Next.js 16+)
export function proxy(request: NextRequest): NextResponse { ... }
export const config = { matcher: [...] };
```

---

## Folder Structure: Complete Reference

```
website/
├── public/
│   ├── fonts/
│   │   ├── font-name-a/
│   │   └── font-name-b/
│   ├── icons/
│   │   └── category/
│   │       ├── svg/
│   │       └── png/
│   └── manifest.json
│
├── src/
│   ├── proxy.ts                    ← Next.js 16+ edge proxy
│   │
│   ├── app/                        ← Next.js App Router root
│   │   ├── layout.tsx              ← root layout (html + body)
│   │   ├── page.tsx                ← 404 fallback at root (if any)
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   └── (main)/                 ← route group (no URL segment)
│   │       ├── layout.tsx
│   │       ├── page.tsx            ← /
│   │       ├── work/
│   │       │   ├── page.tsx        ← /work
│   │       │   └── [slug]/
│   │       │       └── page.tsx    ← /work/[slug]
│   │       ├── articles/
│   │       │   ├── page.tsx
│   │       │   └── [slug]/
│   │       │       └── page.tsx
│   │       └── social/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── sections/               ← page-level section components
│   │   │   ├── home/
│   │   │   │   ├── built-with.tsx
│   │   │   │   ├── built-with.module.scss
│   │   │   │   ├── hero.tsx
│   │   │   │   ├── hero.module.scss
│   │   │   │   └── index.ts
│   │   │   ├── work/
│   │   │   │   ├── work-list.tsx
│   │   │   │   ├── work-list.module.scss
│   │   │   │   └── index.ts
│   │   │   └── social/
│   │   │       ├── platform-list.tsx
│   │   │       ├── platform-list.module.scss
│   │   │       └── index.ts
│   │   │
│   │   └── ui/                     ← reusable primitive components
│   │       ├── content-section/
│   │       │   ├── content-section.tsx
│   │       │   ├── content-section.module.scss
│   │       │   └── index.ts
│   │       ├── footer/
│   │       │   ├── footer.tsx
│   │       │   ├── footer.module.scss
│   │       │   └── index.ts
│   │       ├── header/
│   │       │   ├── header.tsx
│   │       │   ├── header.module.scss
│   │       │   ├── mobile-nav.tsx
│   │       │   └── index.ts
│   │       ├── network-orb/
│   │       │   ├── canvas.tsx      ← heavy canvas component
│   │       │   ├── canvas.module.scss
│   │       │   ├── loader.tsx      ← next/dynamic wrapper
│   │       │   ├── phrase.tsx      ← floating phrase overlay
│   │       │   ├── phrase.module.scss
│   │       │   ├── shell.tsx       ← client state bridge
│   │       │   └── index.ts
│   │       ├── reveal/
│   │       │   ├── reveal.tsx
│   │       │   ├── reveal.module.scss
│   │       │   └── index.ts
│   │       ├── scramble/
│   │       │   ├── scramble.tsx
│   │       │   ├── scramble.module.scss
│   │       │   ├── page-title.tsx
│   │       │   └── index.ts
│   │       └── skip-link/
│   │           ├── skip-link.tsx
│   │           ├── skip-link.module.scss
│   │           └── index.ts
│   │
│   ├── config/                     ← static app-wide configuration
│   │   ├── content.ts
│   │   ├── nav.ts
│   │   ├── site.ts
│   │   ├── social.ts
│   │   ├── work.ts
│   │   └── index.ts                ← barrel for config only
│   │
│   ├── hooks/                      ← custom React hooks
│   │   ├── use-scramble.ts
│   │   ├── use-theme.ts
│   │   └── index.ts
│   │
│   ├── lib/                        ← cross-cutting utilities (no React)
│   │   ├── constants.ts
│   │   ├── fonts.ts
│   │   ├── utils.ts
│   │   ├── validators.ts
│   │   └── index.ts
│   │
│   ├── styles/                     ← global SCSS
│   │   ├── globals.scss
│   │   ├── reset.scss
│   │   ├── typography.scss
│   │   ├── utilities.scss
│   │   └── abstracts/
│   │       ├── _variables.scss
│   │       ├── _mixins.scss
│   │       ├── _functions.scss
│   │       ├── _fonts.scss
│   │       ├── _font-style.scss
│   │       ├── _layout-grid.scss
│   │       └── _scroll.scss
│   │
│   └── types/
│       └── index.ts                ← shared utility types
│
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## SCSS Class Names Inside Modules

Class names inside `.module.scss` files use **camelCase** to match the style the Next.js CSS Modules compiler produces:

```scss
// correct
.sectionInner { ... }
.rowIndex     { ... }
.mobileNavLink { ... }

// wrong — will not match TypeScript styles.section-inner access
.section-inner { ... }
.row_index     { ... }
```

---

## Dead Code Detection: Folder Audit Rules

Scan for these patterns — if found, delete:

1. **`components/index.ts`** that re-exports all sub-paths → delete. Consumers always import from sub-paths like `@/components/ui/header`.

2. **`components/ui/index.ts`** that re-exports all ui components → delete. Breaks tree-shaking, bloats the dev bundle.

3. **`components/sections/index.ts`** same pattern → delete.

4. **`components/layout/`** folder whose only exports are re-exports of `components/ui/header`, `components/ui/footer`, `components/ui/skip-link` → delete. No part of the app imports from `@/components/layout`.

5. Any folder with an `index.ts` that has no actual consumer → search the codebase with `grep -r "from '@/components/layout"` before deleting.

---

## Import Path Rules

| Pattern | Wrong | Correct |
|---|---|---|
| Cross-feature | `../../components/ui/header` | `@/components/ui/header` |
| Config | `../../config/site` | `@/config` (via barrel) |
| Co-located styles | `@/components/ui/header/header.module.scss` | `./header.module.scss` |
| Co-located sibling | `@/components/ui/header/mobile-nav` | `./mobile-nav` |
| Relative climbing | `../../../lib/constants` | `@/lib/constants` |
