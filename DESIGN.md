---
name: NeoStation Web
description: A retro handheld on the move. A sand console with a warm red and orange trail, cabinet black, hardware bone, and one Start-yellow action on the site.
colors:
  ink: "#111216"        # Cabinet: page ground
  ink-2: "#1a1b21"      # plates, header, footer, inset panels
  ink-3: "#24252d"      # hover fill, chips, image placeholders
  line: "#2e3039"       # hairlines, table rules, plate borders
  bone: "#f1ede4"       # Bone: titles, primary text, wordmark (16:1 on ink)
  bone-2: "#b9b4a8"     # body copy (9:1)
  bone-3: "#8d897f"     # captions, labels, meta (5.4:1)
  start: "#ffd23f"      # Start yellow: the site's accent; the one main action per view, focus ring
  red: "#ff5a4a"        # logo speed trail (near); errors
  blue: "#4a74ff"       # info only
  sand: "#ebd196"       # the console (logo only)
  orange: "#ff8a1f"     # logo speed trail (far) (logo only)
  espresso: "#3b3a36"   # the console's screen (logo only)
  toffee: "#c29f5e"     # the console's controls (logo only)
  green: "#33c27a"      # success only
  on-colour: "#111216"  # text on any brand colour is always ink (every pair is 4.6:1 or more)
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

**"A retro handheld on the move."** NeoStation puts a whole retro library on every screen a person owns. The brand
mark is a pocket console leaning forward at the wordmark's italic angle, leaving a red and blue speed trail behind it.
The site follows the same balance: retro in its colour and slant, calm and modern in its layout. Screenshots of the app
are the only imagery; type and ruled facts do the rest.

Brand colours are independent from the app's themes. The app ships many themes and each person picks one; the
brand never borrows a theme colour and the site shows the app as it is, in its screenshots.

## Logo

- Isotype **Handheld in motion**: a sand (#EBD196) portrait console with an espresso screen (#3B3A36), a d-pad and
  one button in toffee (#C29F5E), leaning about 10° (the italic angle of the wordmark), with a red (#FF5A4A) and an
  orange (#FF8A1F) stripe trailing behind it. Source: `logos/handheld/final/` (palette "Arena 2"); the explorations
  are in `logos/handheld/` (concepts, iterations, tones, combos, palettes).
- Logotype: "NeoStation" in Bai Jamjuree Bold Italic, mixed case, tracking +0.02em, outlined.
- Lockup: isotype 1.4 × cap height, centred on the caps, gap 0.55 × cap height.
- Source of truth: `logos/` (`export/` is the current logo; `export-soft-era/` keeps the previous badge).
  `node logos/tools/export-handheld.mjs && node logos/tools/brand-assets.mjs` writes
  `src/assets/brand/logo-horizontal.svg` (wordmark in `currentColor`), `src/assets/brand/isotype.svg`, the public kit
  in `public/brand/`, `public/favicon.svg`, `public/favicon.png` and `public/icons/apple-touch-icon.png`.
- On light backgrounds the wordmark is ink and the console keeps its colours. One-colour versions exist for print, with
  the screen and controls as cut-outs.
- Isotype and app icon come in colour, white and black. The app icon is a square tile with no rounding (stores and
  launchers apply their own mask) and the isotype at 50 % of its width (tested under square, rounded, circle and teardrop masks); the favicon uses the same 50 %.
- Never recolour the console, reorder or drop its trail, or use the console alone as the logo (only the favicon may).

## Colors

- **Ink** carries every page. Plates are ink-2 with a 1px line; nothing floats on shadows, blur or glow.
- **Start yellow** marks the single main action of a view (Download), the focus ring and small markers. One yellow
  button per screen at most.
- **Logo colours** (sand, espresso, toffee, red and orange) stay in the logo. In the UI, red marks errors and blue marks
  info; Start yellow remains the site's accent for the main action.
- Text on any brand colour is ink. Text on ink is bone, bone-2 or bone-3.
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
- One full-width yellow band per page at most.

## Components

- **Button**: 48px pill, 600 weight. Start = yellow fill, ink text, with an "A" glyph on the left (press A).
  Secondary = bone 1px outline, bone text. Quiet = text only. Hover lightens / fills ink-3; focus = 2px Start ring
  with 3px offset; disabled = 50% opacity.
- **Button glyph** (`.pad`): round for A/B/X/Y, pill for LB/RB, mono 600.
- **Label**: mono 12px uppercase, bone-3, followed by a rule (`.section-label`).
- **Facts list (`dl`)**: mono `dt` in bone-3, `dd` in bone, hairline between rows.
- **Header**: solid ink-2 (no blur), logo, links, Source, Download (bone fill, so the page's yellow stays unique).
- **Footer**: ink-2, logo, link columns, licence line in mono.

## Imagery and icons

Real screenshots of the app only, no stock art and no illustrations of people. Platform and service marks come from
Simple Icons in bone-2. UI icons are Heroicons outline.
