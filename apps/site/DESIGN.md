---
name: create-d9-app
description: The GitHub Pages site for @draekien/create-d9-app, set as the transcript of one real run.
colors:
  background: "light-dark(oklch(0.9911 0.0055 211.04), oklch(0.21 0.004 318))"
  foreground: "light-dark(oklch(0.2178 0 0), oklch(0.8877 0.0288 218.97))"
  primary: "oklch(0.6823 0.176 46.72)"
  primary-text: "light-dark(oklch(0.55 0.15 46.72), oklch(0.6823 0.176 46.72))"
  on-primary: "oklch(0.21 0.004 318)"
  secondary: "light-dark(oklch(0.38 0.09 318.07), oklch(0.74 0.0909 318.07))"
  muted: "light-dark(oklch(0.97 0.001 106.424), oklch(0.268 0.007 34.298))"
  muted-foreground: "light-dark(oklch(0.52 0.013 58.071), oklch(0.709 0.01 56.259))"
  border: "light-dark(oklch(0.923 0.003 48.717), oklch(1 0 0 / 10%))"
  canvas-dot: "oklch(0.5579 0.0909 318.07 / 0.10)"
typography:
  display:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "4rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "clamp(1.5rem, 1.05rem + 1.7vw, 2.375rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "clamp(1.875rem, 1.4rem + 1.9vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  name-block:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  lead:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  transcript:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem)"
    fontWeight: 400
    lineHeight: 1.65
    fontFeature: "\"tnum\""
  label:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  code:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.75
  button-label:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Cascadia Mono, Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  none: "0px"
spacing:
  gutter: "1.75rem"
  column-gap: "0.9rem"
  page-x: "1.25rem"
  page-x-wide: "2.5rem"
  inset-left: "15.3vw"
  output-gap: "2rem"
  divider-gap: "3rem"
  section: "6rem"
  section-wide: "8rem"
components:
  button-copy:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.625rem"
  theme-toggle:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.625rem"
  theme-toggle-hover:
    textColor: "{colors.foreground}"
  nav-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.foreground}"
  nav-link-active:
    textColor: "{colors.primary-text}"
  transcript-glyph:
    textColor: "{colors.primary-text}"
    typography: "{typography.transcript}"
    width: "{spacing.gutter}"
  transcript-command:
    textColor: "{colors.foreground}"
    typography: "{typography.transcript}"
  transcript-answer:
    textColor: "{colors.secondary}"
    typography: "{typography.transcript}"
  transcript-flag:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.transcript}"
  link:
    textColor: "{colors.secondary}"
  link-hover:
    textColor: "{colors.foreground}"
  inline-code:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "0.1em 0.35em"
  code-block:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
---

# Design System: create-d9-app

## Overview

**Creative North Star: "The Session Transcript"**

The site reads as the transcript of one real run of the CLI. Every section is the next command typed and its real output: a `$` command line, clack prompts with their answers and flags, the generated tree, then plain output tables. Proof is the session itself. The material around the transcript is the owner's portfolio: a near-white or near-black ground, a fixed field of faint mauve dots that rise toward the pointer, a two-tone JetBrains Mono headline (pale or ink, then mauve), Figtree prose, a bold uppercase Figtree name block, and the orange `\\>` mark.

Density is a terminal's: mono text at small sizes, generous vertical air between sections (6rem, 8rem from 640px), a single left inset on wide screens (15.3vw), and no cards, panels or boxes around anything. Colour is flat. Depth comes only from the dot canvas sitting under the content layer. Both grounds are first-class; every colour token is one `light-dark()` pair that follows the OS scheme or the text-labelled theme toggle.

The docs, changelog and 404 pages keep the same material in a reading shape: a mono rail on the left from 1024px, prose at 60ch, mono headings, and code on the muted ground. The 404 is itself a transcript (`cd <path>` and the shell's real error).

**Key Characteristics:**
- Transcript lines in a fixed 1.75rem glyph gutter: `$` commands, `◇` prompts, `│` output, all in the orange text tone.
- Two-tone mono headlines: the lead in foreground, the rest in mauve, roman.
- Orange is a mark and a fill; orange as text uses the darker text tone on the light ground.
- Flat colour, square corners, hairline borders, no shadows, no gradients.
- Motion acts out the transcript: lines print, the cursor and markers travel, copying ripples the dots, the theme clears top to bottom. Five moments, listed under Motion; reduced motion stills all of them.

### Provenance

- Colour tokens `background`, `foreground`, `primary`, `secondary`, `muted`, `muted-foreground`, `border` are taken from the owner's portfolio source (github.com/draekien/portfolio, `app/globals.css`).
- `primary-text` (light ground `oklch(0.55 0.15 46.72)`) and `on-primary` are this site's own additions: the portfolio orange fails 4.5:1 as text on the light ground, so orange text on light uses the darker tone, and text on an orange fill uses the dark ground value.
- JetBrains Mono and Figtree (both variable, self-hosted via Fontsource), the BrandMark and full mark geometry, and the 48px pointer-reactive dot canvas (including `canvas-dot`) are inherited from the portfolio. The finish review found the material matching the portfolio pixel-for-pixel on both grounds.
- No shipping rasters exist. The mark is authored SVG (`src/components/mark.tsx`); the favicon is authored SVG (`public/favicon.svg`) with the orange as the literal `#f26f21`, because a standalone SVG favicon cannot read the page's custom properties.

## Colors

Two flat grounds, one ink, one mauve, one orange; nothing else carries colour.

### Primary
- **Portfolio Orange** (`primary`): fill and mark colour. The `\\>` mark, the BrandMark markers (section dividers, active nav item, active docs page), and the copy button fill. Same value on both grounds.
- **Readable Orange** (`primary-text`): orange used as text or line. Transcript glyphs, the active nav and rail label, focus outlines, blockquote and alert rules, alert titles, error lines (`copy failed`, `cd: no such file or directory:`), keyword, tag and deleted tokens in code.
- **On Orange** (`on-primary`): text on an orange fill; the dark ground value on both grounds.

### Secondary
- **Mauve** (`secondary`): the second half of every headline, prompt answers, links, the `copied` confirmation, strings, numbers, attributes and headings in highlighted code, and the selection background.

### Neutral
- **Ground** (`background`): page ground, the sticky section nav's ground, the skip link.
- **Ink** (`foreground`): headline leads, commands, prompt questions, prose, table first columns.
- **Muted Ground** (`muted`): code blocks and inline code only.
- **Muted Ink** (`muted-foreground`): flags, output text, the tree, table headers and second columns, inactive nav, landing prose paragraphs, list markers, older changelog releases.
- **Hairline** (`border`): 1px rules: section divider line, theme toggle outline, table row rules, code block outline, docs rail separators.
- **Dot** (`canvas-dot`): the canvas dots only, 10% alpha mauve on both grounds; up to 60% inside a copy ripple.

### Named Rules
**The Readable Orange Rule.** Orange text is always `primary-text`, never `primary`. `primary` appears only as a fill or as the mark.

**The Two Grounds Rule.** Every colour is one `light-dark()` pair (or a single value valid on both grounds). Check every new colour use on both the light and dark ground before shipping.

**The Mauve Answer Rule.** Mauve marks what the run answered or links to: headline second halves, prompt answers, links, confirmations. It is never a fill.

## Typography

**Display Font:** JetBrains Mono Variable (with ui-monospace, Cascadia Mono, Menlo, Consolas, monospace)
**Body Font:** Figtree Variable (with system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Label/Mono Font:** JetBrains Mono Variable

**Character:** Mono speaks for the machine: headlines, commands, output, navigation and table headers. Figtree speaks for the person: prose, the lead, and the bold uppercase name block.

### Hierarchy
- **Display** (500, 4rem from 768px and 2.25rem below, line-height 1.1, -0.025em, balanced): the landing h1 only.
- **Headline** (500, `clamp(1.5rem, 1.05rem + 1.7vw, 2.375rem)`, 1.1): landing section headings.
- **Page Title** (500, `clamp(1.875rem, 1.4rem + 1.9vw, 2.75rem)`, 1.1): docs, changelog and 404 h1.
- **Title** (mono 500, 1.375rem, 1.3, -0.02em): prose h2; prose h3 at 1.0625rem, h4 at 1rem, same weight and tracking.
- **Name Block** (Figtree 700, uppercase, 1.25rem / 1.5rem from 768px / 1.875rem from 1024px, set on two lines `Create` / `D9 App`): the top bar home link only.
- **Lead** (Figtree 400, 1.125rem from 640px and 1.0625rem below, 1.625): the landing lead in foreground at 35rem; docs descriptions at 1.125rem in muted ink at 60ch.
- **Body** (Figtree 400, 1.0625rem, 1.7, max 60ch): prose; strong at 650.
- **Transcript** (mono 400, `clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem)`, 1.65, tabular numerals): every transcript line, tree and output table.
- **Label** (mono 400, 0.875rem): top bar nav, theme toggle, section nav, docs rail.
- **Code** (mono 400, 0.8125rem, 1.75): prose code blocks; inline code at 0.84em of the prose size, 0.9em in landing prose.
- **Button Label** (mono 400, 0.6875rem, uppercase, 0.12em tracking, line-height 1): the copy button only.

### Named Rules
**The Two-Tone Headline Rule.** Every headline is a lead in foreground followed by an `em` in mauve, set roman (no italic). One split per headline.

**The Mono Machine Rule.** Anything a terminal would print, or anything that navigates, is mono. Figtree is for sentences a person reads.

## Layout

The landing page is one left-aligned column. Content insets 1.25rem on phones, 2.5rem from 640px, and from 1024px the main column starts at 15.3vw from the left. The first section caps at 62.5rem; transcripts and their output cap at 58rem; the closing section at 52rem; prose paragraphs at 60ch; the lead at 35rem.

Sections stack with 6rem top padding (8rem from 640px). Each section after the first opens with a divider row (BrandMark, hairline rule, BrandMark, 1rem gaps) 3rem above its heading; prose sits 1.25rem below the heading and the output 2rem below that. A sticky section nav sits at the bottom of the viewport on the ground colour, spanning the full width.

The transcript grid is fixed: a 1.75rem glyph column and a flexible body whose parts wrap with a 0.9rem column gap. Preformatted output and the tree indent 1.75rem so they align with line bodies; tree descriptions indent 4ch under their paths on phones.

Docs pages use a two-column grid from 1024px (14rem rail, flexible article, 4rem column gap) with the rail sticky at 2rem from the top. Below 1024px the rail collapses into a `pages` disclosure between hairline rules above the article.

Responsive behaviour observed in the build:
- Below 640px the tree renders as a list (path, then description beneath) instead of a padded preformatted block; prompt answers and flags wrap onto their own lines; the copy button wraps under the command.
- Below 40rem the output tables drop their header row and stack each row as two lines.
- On phones the first viewport is the still headline, the command and the prompts. The blinking cursor waits at the live prompt below the fold, and the canvas has no pointer to answer on touch, so neither moving element is in the phone first viewport.

### Named Rules
**The Gutter Rule.** Every transcript line puts its glyph in the 1.75rem gutter; anything that continues a line (pre output, trees) indents by the same 1.75rem.

## Elevation & Depth

The system is flat. There are no shadows, no gradients, no blur and no tonal surface stacking. The only depth is structural: a fixed full-viewport canvas at z-index 0 draws a 48px grid of 1.5px dots in `canvas-dot`; within 140px of the pointer each dot's radius grows by up to 2px (quadratic falloff), the tracked point eased at 0.1 per frame and the loop stopping once settled. All content sits on a z-index 10 layer above it. A successful copy sends one ring from the copy button through the same dots over 1000ms (radius eased out to the farthest viewport corner; dots within 64px of the ring grow by up to 3px and rise from 10% to up to 60% alpha, both fading as the ring travels); it adds no dots and the loop stops when it ends. With reduced motion the canvas draws once, does not track the pointer and does not ripple.

### Named Rules
**The Flat Ground Rule.** Surfaces are flat colour. Separation comes from hairline borders, the muted ground for code, and whitespace; never from shadow or gradient.

## Motion

Motion shows the session advancing; it never decorates. Content is in the DOM and visible by default, and every moment below is stilled by `prefers-reduced-motion: reduce`.

| Moment | Where | Trigger | Behaviour |
|---|---|---|---|
| Tree prints | landing first section | page load | tree lines, then `cd my-app` and `pnpm dev`, appear 40ms apart in one hard step each (no fade, no slide), rows holding their space; the file count runs 0 to 143 over 280ms. CSS only. |
| Copy ripple | landing copy buttons | clipboard write succeeds | one ring through the existing dot canvas, 1000ms (see Elevation & Depth). |
| Marker travel | section nav, docs rail | active section or route changes | the BrandMark moves by transform, 240ms, `cubic-bezier(0.16, 1, 0.3, 1)`; page content swaps instantly. |
| Cursor travel | transcript commands | active section changes | one block cursor moves between `$` lines, 300ms, same curve; the blink restarts on arrival. |
| Theme `clear` | every page | theme toggle | view transition: the old page stays, the new theme is revealed top to bottom by `clip-path: inset()` in 12 hard steps over 400ms; instant where view transitions are unsupported. |

Marker and cursor travel use Motion `layoutId` under `LazyMotion` with `domMax` loaded as a separate chunk, inside `MotionConfig reducedMotion="user"`.

### Named Rules
**The Hard Step Rule.** Terminal-native motion moves in hard steps (printing, the cursor blink, the theme clear); only things that travel (markers, the cursor, the ripple) ease, and they ease out.

## Shapes

Every corner is square (0px). Borders are 1px hairlines in `border`; the only other strokes are the 2px focus outline (offset 3px, `primary-text`) and the 1px orange rule on blockquotes and alerts. The recurring silhouette is the mark: two parallel backslash strokes, alone as the BrandMark (inline, 0.85em tall) or followed by a `>` chevron as the full mark (2rem tall on phones, 3rem from 768px). Prose lists use square markers.

## Components

### Buttons
Two buttons exist, both small, square and mono.
- **Shape:** square corners (0px).
- **Copy:** Portfolio Orange fill, On Orange text, uppercase button label, 0.25rem by 0.625rem padding, sitting at the end of the create command's line; hover inverts to ink fill with ground text over 150ms. Clicking writes the command to the clipboard and adds a status line below: `copied` in mauve, or `copy failed` in orange text with the fallback instruction in muted ink.
- **Theme toggle:** no fill, 1px hairline outline, muted ink label text `theme: dark` / `theme: light`, 0.25rem by 0.625rem padding; hover shifts to ink over 150ms. Switching the theme runs the `clear` view transition (see Motion) and suppresses all other transitions for one frame.
- **Focus:** global 2px Readable Orange outline at 3px offset.

### Navigation
- **Top bar:** name block left, mono label nav right (`docs`, `changelog`, `github`, `npm`, theme toggle) with 1.5rem gaps; wraps under the name block on phones. Links are muted ink, ink on hover (150ms), Readable Orange when active.
- **Section nav (landing):** sticky at the viewport bottom on the ground colour, mono label links with 1.75rem gaps. The active section's label turns Readable Orange; one BrandMark in Portfolio Orange sits in the gap before it and travels between labels, so labels never shift.
- **Docs rail:** mono label list; every item reserves a 2ch marker slot; one BrandMark travels to the active page's slot, label in Readable Orange. An `on this page` group below a hairline lists the page's h2 headings in muted ink.

### Transcript (signature component)
- **Line:** two-column grid, glyph in Readable Orange in the 1.75rem gutter, body parts wrapping at 0.9rem gaps. Default glyph `│`.
- **Command:** glyph `$`, command text in ink, inline code that does not wrap. The command matching the section in view carries a block cursor: 0.6em by 1.15em, ink fill, blinking at 1.1s with a hard step; one cursor travels between commands as the section changes; still under reduced motion.
- **Prompt:** glyph `◇`, the question in ink, the answer in mauve, the flag in muted ink.
- **Output:** muted ink text; preformatted output and trees scroll horizontally rather than wrap.
- **Output table:** collapsed, left-aligned, baseline-aligned cells with 1.5rem right padding and no rules; header in muted ink at 400; first column in ink and unwrapped, second in muted ink.

### Prose (docs and changelog)
- **Links:** mauve, underlined (1px, 0.22em offset), ink on hover.
- **Headings:** mono with a muted `#` anchor that turns Readable Orange on heading hover.
- **Code:** inline code on the muted ground, 0.1em by 0.35em padding; blocks on the muted ground with a hairline outline, highlighted with the site theme (keywords and tags in Readable Orange; strings, numbers and attributes in mauve; comments in muted ink).
- **Tables:** 0.9375rem, tabular numerals, hairline row rules, mono 0.8125rem headers in muted ink. Tables and code blocks take the 58rem output width, not the 60ch prose measure (60ch in a code block's 0.8125rem font is narrower than the paragraphs around it). Code in a cell never wraps, so flags stay whole; wide tables scroll. Below 40rem two-column tables drop their header and stack each row (code, then text), as the landing output tables do.
- **Quotes and alerts:** 1px Readable Orange left rule, 1rem indent, muted ink text, mono alert title in Readable Orange.
- **Changelog:** the newest release in full colour, every older release in muted ink.

### Section divider
BrandMark, hairline rule, BrandMark across the 58rem column, decorative and hidden from assistive technology.

## Do's and Don'ts

### Do:
- **Do** put every new landing section in transcript form: a `$` command, its real output, and a cursor command when the section is in view.
- **Do** set orange text in `primary-text` and keep `primary` for fills and the mark (The Readable Orange Rule).
- **Do** split every headline into an ink lead and a mauve roman `em` (The Two-Tone Headline Rule).
- **Do** align continuation output to the 1.75rem gutter (The Gutter Rule).
- **Do** use the BrandMark as the only marker for active and section states.
- **Do** check every colour pair on both grounds; the theme toggle and OS scheme can show either.
- **Do** still every Motion moment under `prefers-reduced-motion: reduce`; content and state stay visible.

### Don't:
- **Don't** add shadows, gradients, blur or tinted panels; the world is flat colour (The Flat Ground Rule).
- **Don't** round corners; every bordered or filled element is square (0px).
- **Don't** use `primary` orange as text on the light ground; it fails 4.5:1 there.
- **Don't** italicise the headline `em`; the second tone is colour, not slant.
- **Don't** add an icon set or icon font; markers are the BrandMark and the transcript's own glyphs (`$`, `◇`, `│`, tree rules).
- **Don't** add motion outside the Motion inventory: no fade-and-rise reveals, no typing effects, no springs or bounces, no motion in docs prose.
