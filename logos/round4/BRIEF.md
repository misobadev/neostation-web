# Round 4 brief (shared by every concept)

NeoStation is a free, open-source EMULATION FRONTEND (Windows, Android, macOS, Linux): it gathers a person's ROMs
from 100+ systems (cartridges, discs, arcade, handhelds) into one library they browse with a controller, with
artwork, achievements and cloud saves. "All your retro games, everywhere." The client wants a NEW isotype that is
descriptive of what a frontend is, crafted and ownable, never clip-art.

Already rejected, do NOT do: any N or NS monogram; literal gamepads/controllers, joysticks, arcade buttons, arcade
cabinets, D-pad alone; generic abstract compositions (sun, Bauhaus modules, circle+square, sparkle); a single
cartridge; a space-station orbit/octagon; a CRT frame with a pixel; slanted stripe badges; portrait/landscape
handheld consoles (already explored). No copies of real products or game characters (Nintendo, Sony, Sega, Atari,
Pac-Man, Space Invaders, Mario...). No gradients, no purple, no emoji look.

Wordmark (keep exactly): "NeoStation", Bai Jamjuree Bold Italic, tracking +0.02em. Outline it with
`node logos/tools/wordmark.mjs bai NeoStation 100 0.02` -> JSON {d, minX, minY, maxX, maxY, width, height, cap};
the path has its baseline at y=0 and glyphs in negative y; place with translate. Bone #F1EDE4 on dark, ink #111216
on light.

Palette A (current, keep): sand #EBD196, espresso #3B3A36, toffee #C29F5E, red #FF5A4A, orange #FF8A1F, on ink
#111216 / bone #F1EDE4 grounds.
Palette B: propose your own 3-5 colour palette that suits YOUR symbol and the retro-gaming world (flat colours,
must work on both #111216 and #F1EDE4; no purple; explain it in one line).

SVG conventions: viewBox only (no width/height). Icon `viewBox="0 0 512 512"`, transparent, artwork centred ~80% of
the box. Lockup `viewBox="0 0 1024 512"` with a background rect, isotype ~1.4-1.8x the wordmark cap height, centred
on the caps, gap ~0.55x cap height, generous margins. Groups `<g id="icon">` and `<g id="wordmark">`. Flat fills, no
strokes thinner than 6/512, clean markup (1-2 decimals). Must read at 32 px; check 16 px too.

Files per concept N (write only these, inside logos/round4/):
- cN-A-icon.svg, cN-A.svg (lockup on #111216), cN-A-light.svg (lockup on #F1EDE4)
- cN-B-icon.svg, cN-B.svg, cN-B-light.svg
- cN-B.txt with one line: palette B hex codes and why.

Self-review (mandatory): render with rsvg-convert (lockups at 1024; icons at 64/32/16, upscaled with
`magick in.png -filter point -resize 256x256 out.png`) and LOOK at them with the Read tool. Iterate at least 3
times; keep only your best. Ask yourself: is it instantly about games/emulation? Simple, ownable, professional?
Any unwanted reading (another brand, a person, a common UI icon)?

Report back (short): one sentence on the idea, palette B in one line, doubts.
