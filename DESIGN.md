---
name: NeoStation Web
description: An eye on your whole library. A two-weight ring in bone and grey around a red pupil that looks and blinks, cabinet black, and one red action per page.
colors:
  ink: "#111216"        # Cabinet: page ground
  ink-2: "#1a1b21"      # plates, header, footer, inset panels
  ink-3: "#24252d"      # hover fill, chips, image placeholders
  line: "#2e3039"       # hairlines, table rules, plate borders
  bone: "#f1ede4"       # Bone: titles, primary text, wordmark (16:1 on ink)
  bone-2: "#b9b4a8"     # body copy (9:1)
  bone-3: "#8d897f"     # captions, labels, meta (5.4:1)
  start: "#ff5a4a"      # Signal red: the pupil, the one main action per view, focus ring (6.1:1 on ink)
  start-hover: "#ff7b6e"
  red: "#ff5a4a"        # same red; also errors
  blue: "#4a74ff"       # info only
  grey-light: "#77736a" # the thin half of the ring on light grounds (logo only)
  red-light: "#e8402f"  # the pupil on light grounds (logo only)
  green: "#33c27a"      # success only
  on-colour: "#111216"  # text on bone and red is always ink
typography:
  family: "Bai Jamjuree (400, 500, 600, 700, 700 italic), self-hosted via @fontsource"
  display: "Bai Jamjuree 700 italic, the logotype's voice: hero h1 and big statements only"
  heading: "Bai Jamjuree 700 upright"
  body: "Bai Jamjuree 400 / 500"
  mono: "JetBrains Mono Variable: labels, versions, specs, button glyphs"
  scale:
    display: "text-display · clamp(2.25rem, 4.4vw, 3.5rem) / 1.02, 700 italic, -0.02em"
    h2: "text-h2 · clamp(1.625rem, 2.6vw, 2.125rem) / 1.12, 700, -0.015em"
    h3: "text-h3 · 1.1875rem / 1.3, 700"
    lead: "text-lead · 1.0625rem / 1.6, 400"
    body: "1rem / 1.65, 400"
    small: "0.875rem / 1.5"
    label: "mono 0.75rem / 1.4, 500, uppercase, +0.08em"
spacing:
  base: "4px scale (Tailwind default)"
  gutter: "20px mobile, 32px from 768px"
  container: "76rem"
  section-y: "64px mobile, 96px from 1024px"
  measure: "36rem body, 40rem leads"
rounded:
  control: "999px (buttons and chips are pills)"
  plate: "16px"
  screen: "18px (screenshots, framed like a display)"
shadow: none. Depth comes from ink-2 plates and hairlines.
---

# Design System: NeoStation Web

## Direction

**"An eye on your whole library."** NeoStation looks after a whole retro library and shows it on every screen a person
owns. The brand mark is an eye: a ring in two weights around a red pupil, like a power light on old hardware. It looks
around and blinks. The site follows the same balance: retro in its colour and the wordmark's slant, calm and modern in
its layout. Screenshots of the app
are the only imagery; type and ruled facts do the rest.

Brand colours are independent from the app's themes. The app ships many themes and each person picks one; the
brand never borrows a theme colour and the site shows the app as it is, in its screenshots.

## Logo

- Isotype **The eye**: a ring of radius 150 in a 512 box, split into a thick bone arc (#F1EDE4, 66 wide) and a thin
  grey arc (#B9B4A8, 30 wide), with a red pupil (#FF5A4A, radius 53). Both gaps are centred on the up-right diagonal,
  measured from the visible round caps, so the ring is symmetric along that line. Source: `logos/eye/gen.mjs`
  (mark A4X); the explorations are in `logos/loop*`, `logos/knot`, `logos/shapes` and earlier folders.
- On light grounds the ring is ink and #77736A and the pupil is #E8402F. One-colour versions use a single ink.
- Logotype: "NeoStation" in Bai Jamjuree Bold Italic, mixed case, tracking +0.02em, outlined.
- Lockup: isotype 1.75 × cap height, centred on the caps, gap 0.55 × cap height.
- Motion **Look and blink** (`logos/tools/eye-motion.mjs`): the pupil glances up-right, then down-left, returns, and
  the eye blinks along the same diagonal (the pupil flattens to 17 %, the ring squashes 8 %). 4 s loop in the kit; the
  site header uses the same motion with a longer rest (9 s) and stops it under `prefers-reduced-motion`. GIF/MP4
  renders come from `logos/anim/gen.mjs`.
- Source of truth: `logos/export/` (`export-handheld-era/` and `export-soft-era/` keep earlier logos).
  `node logos/eye/gen.mjs && node logos/tools/export-eye.mjs && ONLY=look node logos/anim/gen.mjs && node logos/tools/brand-assets.mjs`
  writes `src/assets/brand/logo-horizontal.svg` (wordmark in `currentColor`, ring and pupil classed `ns-ring` /
  `ns-pupil`), `src/assets/brand/isotype.svg`, `src/styles/brand-motion.css`, the public kit in `public/brand/`,
  `public/favicon.svg`, `public/favicon.png` and `public/icons/apple-touch-icon.png`.
- Isotype and app icon come in colour (dark), colour (light), white and black. The app icon is a square tile with no
  rounding (stores and launchers apply their own mask), the eye centred on its own centre with the ring at 56 % of
  the tile, safe under circle masks.
- Never recolour or rotate the eye, swap the ring's two weights, or animate it any other way.

## Colors

- **Ink** carries every page. Plates are ink-2 with a 1px line; nothing floats on shadows, blur or glow.
- **Signal red** (token `start`, the colour of the pupil) marks the single main action of a view (Download), the focus
  ring and small markers. One red button per screen at most. Errors share the red; blue marks info.
- **Bone and grey** are the ring's colours and the site's text colours (bone, bone-2).
- Text on bone and red is ink. Text on ink is bone, bone-2 or bone-3.
- No gradients, no gradient text, no purple.

## Typography

Headings are compact: use the `text-display`, `text-h2`, `text-h3` and `text-lead` tokens from global.css, never
arbitrary sizes, so the scale can be tuned in one place.


One family, Bai Jamjuree, so the site speaks with the logo's voice. The hero and big statements use 700 italic, the
same cut as the wordmark; every other heading is 700 upright so the italic stays special. JetBrains Mono only for
facts (versions, OS requirements, counts) and labels.

## Layout

- Left-aligned. Sections open with a mono label and a rule, then an h2 that sits in the left 8 columns.
- Screenshots are framed as displays: 18px radius, 1px line, no tilt, no glow.
- Lists of things (integrations, platforms, requirements) are ruled rows or tables, not grids of identical cards.
- One full-width red band per page at most.

## Components

- **Button**: 48px pill, 600 weight. Start = red fill, ink text, with an "A" glyph on the left (press A).
  Secondary = bone 1px outline, bone text. Quiet = text only. Hover lightens / fills ink-3; focus = 2px Start ring
  with 3px offset; disabled = 50% opacity.
- **Button glyph** (`.pad`): round for A/B/X/Y, pill for LB/RB, mono 600.
- **Label**: mono 12px uppercase, bone-3, followed by a rule (`.section-label`).
- **Facts list (`dl`)**: mono `dt` in bone-3, `dd` in bone, hairline between rows.
- **Header**: solid ink-2 (no blur), logo, links, Source, Download (bone fill, so the page's red stays unique); the logo's eye runs the look-and-blink motion.
- **Footer**: ink-2, logo, link columns, licence line in mono.

## Imagery and icons

Real screenshots of the app only, no stock art and no illustrations of people. Platform and service marks come from
Simple Icons in bone-2. UI icons are Heroicons outline.
