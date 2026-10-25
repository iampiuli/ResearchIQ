# Design System

**Concept: a quiet reading room.** Calm, minimal and premium: warm paper surfaces, deep ink text, one muted accent, hairline dividers and generous space. A serif voice for reading, a clean sans for controls. Everything is defined in [`frontend/src/index.css`](../frontend/src/index.css).

## Principles

1. **Calm over loud.** One accent color, soft shadows, short transitions.
2. **Paper, not glass.** Flat warm surfaces with hairline borders. No blur, gradients or neon (the only gradient on the site is one faint pool of light behind the hero).
3. **Reading first.** Answers are set like a document: serif, large, long line-height, ~44rem measure.
4. **Highlighter = evidence.** The yellow marker color appears *only* where something is cited.
5. **Quiet motion.** Fades and small settles. Reduced-motion is respected for scrolling.

## Color tokens

| Token | Value | Use |
|---|---|---|
| `background` | `#F6F3EC` | Page |
| `paper` / `card` | `#FCFBF7` | Raised surfaces: inputs, active rows, menus, dialogs |
| `sidebar` | `#F0ECE2` | Sidebar, reader "desk" |
| `foreground` | `#25231F` | Primary text ("ink") |
| `ink-soft` | `#4A463F` | Answer body text |
| `muted-foreground` | `#7A756A` | Secondary text, icons |
| `secondary` / `muted` | `#EFEBE1` | User message bubble, code backgrounds |
| `border` | `#E6E1D5` | Hairlines |
| `border-strong` | `#D5CFBF` | Outlined controls |
| `primary` | `#33503F` | Moss green: buttons, links, active marks |
| `accent` | `#E7EDE4` | Soft green tint for hover states |
| `marker` / `marker-foreground` | `#F4E6AE` / `#6B5410` | Citation page badges, "Cited in answer" |
| `destructive` | `#B3392F` | Errors, delete |

The shadcn token names are kept so existing components keep working; the custom ones (`paper`, `ink-soft`, `marker`, `border-strong`) are registered in `@theme inline`.

> Contrast: body text on `background` and white-on-`primary` text meet WCAG AA. Re-check if you change tokens.

## Typography

| Role | Font | Notes |
|---|---|---|
| Headings, answers, workspace names, reader title | **Newsreader** (variable serif, with italics) | `h1–h3` use it by default; add `font-serif` elsewhere |
| UI, controls, labels, tables | **Geist** (variable sans) | Default `font-sans` |
| Code | System monospace | `font-mono` |

Fonts are self-hosted via `@fontsource-variable/*`, so no external requests.

- **Eyebrow** (`.eyebrow`): 11px, uppercase, 0.12em tracking, muted. Used for section labels ("Library", "Sources").
- Display headings: `font-medium`, tight tracking (`-0.02em`), with an *italic accent word* in `text-primary`.

## Shape, elevation, spacing

- Radius base `0.625rem`. Controls `rounded-lg`, composer and cards `rounded-2xl`, chips are pills.
- Hairlines (`border-border`) instead of heavy cards. Elevation only for floating things:
  - `--shadow-page`: PDF page
  - `--shadow-float`: menus, toasts, dialogs, hero mock
- Chat column max width `44rem`; landing container `max-w-6xl`.

## Utilities (in `index.css`)

| Class | Purpose |
|---|---|
| `.eyebrow` | Small-caps label |
| `.focus-ring` | Standard keyboard focus ring (primary at 30%, offset from background) |
| `.scroll-thin` | Slim, quiet scrollbar |
| `.surface`, `.surface-strong` | Hairline paper surface (+ float shadow) |

## Components

- **Button** (`ui/button.jsx`): variants `default` (moss), `outline` (paper + strong border), `secondary`, `ghost`, `destructive`, `link`; sizes `xs`–`lg`, `icon*`.
- **Paper row**: icon + two-line title + meta; active row = paper background, hairline, thin moss bar on the left. Actions (…) appear on hover/focus.
- **Citation chip**: bordered paper tag with file icon, truncated title and a marker-yellow `p.N` badge.
- **Chat message**: user = soft right-aligned bubble; assistant = labeled prose + "Sources" footer.
- **Composer**: rounded paper field, moss focus halo, send button greys out until there's text.
- **Reader**: sidebar-tone "desk", page with soft shadow, marker ring + "Cited in answer" tag on the cited page.
- **Toast / dialog / menu**: paper surface, `shadow-float`, 100–200ms scale/fade.

## Brand

- **Mark**: a moss rounded square containing a page with one highlighted line ("the passage that matters"), `components/shared/Logo.jsx` and `public/favicon.svg`.
- **Wordmark**: "Research" in serif with *IQ* in italic moss.
- The PNG favicons and files under `public/brand/` still show the **previous violet identity** and need regenerating from the new mark.

## Dos and don'ts

- ✅ Use tokens (`text-primary`, `bg-paper`). ❌ Don't use raw hex or Tailwind palette colors.
- ✅ Use `marker` only for cited evidence. ❌ Don't use it as a general highlight.
- ✅ Prefer hairlines and spacing for separation. ❌ Don't add drop shadows to resting elements.
- ✅ Set long-form reading text in serif. ❌ Don't set dense UI (tables, buttons) in serif.
