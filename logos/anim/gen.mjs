// A4X isotype animations (blink, wink, look). Each frame is drawn as SVG, rasterised with rsvg-convert,
// then assembled with ffmpeg into GIF, MP4 and WebM.
// Run: node logos/anim/gen.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { LOOK } from "../tools/eye-motion.mjs";

const FPS = 50, SIZE = 480;
const R = 150, C = 256, PUPIL = 53;
// The eye closes along the ring's gap axis (up-right to down-left), so the blink runs diagonally.
const DIAG = 45;
// Ring arcs in degrees. "diag" centres both gaps on the 45° diagonal, measured from the visible cap edges
// (the thick bone caps reach 12.6° past their end angle, the thin grey caps 5.7°), with a 14° visible gap.
const RINGS = { a4x: { bone: [150, 315], grey: [-15, 115] }, diag: { bone: [154.6, 295.4], grey: [-32.3, 122.3] } };
const RING = RINGS[process.env.RING || "diag"];
const SUFFIX = process.env.RING === "a4x" ? "-a4x" : "";
const SETS = {
  dark: { bg: "#111216", B: "#F1EDE4", G: "#B9B4A8", A: "#FF5A4A" },
  light: { bg: "#FFFFFF", B: "#111216", G: "#77736A", A: "#E8402F" },
};

const pol = (r, deg, cx = C, cy = C) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
const arc = (r, a0, a1) => { const [x0, y0] = pol(r, a0), [x1, y1] = pol(r, a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };

// Easings
const E = {
  lin: (t) => t,
  in: (t) => t * t * t,
  out: (t) => 1 - (1 - t) ** 3,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  back: (t) => { const c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
};

// State: lid 0 open → 1 closed; happy 0 → 1 closes into a ⌒ arc (wink); dx/dy pupil look; rot ring turn; sq ring squash.
const BASE = { lid: 0, happy: 0, dx: 0, dy: 0, rot: 0, sq: 0 };
// Timeline: [time in s, partial state, easing to reach it]
const VARIANTS = {
  blink: { name: "Parpadeo", dur: 3.0, keys: [
    [0, {}], [1.6, {}],
    [1.69, { lid: 1, sq: 1 }, "in"], [1.73, { lid: 1, sq: 1 }], [1.88, { lid: 0, sq: 0 }, "back"],
    [3.0, {}],
  ] },
  double: { name: "Doble parpadeo", dur: 3.2, keys: [
    [0, {}], [1.5, {}],
    [1.58, { lid: 1, sq: 1 }, "in"], [1.61, { lid: 1, sq: 1 }], [1.73, { lid: 0, sq: 0 }, "out"],
    [1.83, {}],
    [1.91, { lid: 1, sq: 1 }, "in"], [1.94, { lid: 1, sq: 1 }], [2.09, { lid: 0, sq: 0 }, "back"],
    [3.2, {}],
  ] },
  wink: { name: "Guiño", dur: 3.2, keys: [
    [0, {}], [1.2, {}],
    [1.36, { lid: 1, happy: 1, rot: -14, sq: 0.6 }, "in"],
    [1.95, { lid: 1, happy: 1, rot: -14, sq: 0.6 }],
    [2.2, { lid: 0, happy: 0, rot: 0, sq: 0 }, "back"],
    [3.2, {}],
  ] },
  // the chosen motion, shared with the brand kit and the site
  look: { name: "Mira y parpadea", dur: LOOK.dur, keys: LOOK.keys.map(([t, st, e]) => [t, { ...st, ...("lid" in st ? { sq: st.lid } : {}) }, e]) },
};

const stateAt = (keys, t) => {
  let prev = { ...BASE, ...keys[0][1] };
  for (let i = 1; i < keys.length; i++) {
    const [t1, s1, ease = "lin"] = keys[i], t0 = keys[i - 1][0];
    const next = { ...BASE, ...s1 };
    if (t <= t1) {
      const k = E[ease](t1 === t0 ? 1 : (t - t0) / (t1 - t0));
      return Object.fromEntries(Object.keys(BASE).map((p) => [p, prev[p] + (next[p] - prev[p]) * k]));
    }
    prev = next;
  }
  return prev;
};

const frame = (s, col) => {
  // ring: rotate, and squash a little vertically while the lid closes
  const sy = 1 - 0.08 * s.sq, sx = 1 + 0.03 * s.sq;
  const ring = `<g transform="translate(${C} ${C}) rotate(${s.rot.toFixed(2)}) rotate(${-DIAG}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) rotate(${DIAG}) translate(${-C} ${-C})">` +
    `<path fill="none" stroke="${col.B}" stroke-width="66" stroke-linecap="round" d="${arc(R, ...RING.bone)}"/>` +
    `<path fill="none" stroke="${col.G}" stroke-width="30" stroke-linecap="round" d="${arc(R, ...RING.grey)}"/></g>`;
  // pupil: an ellipse that flattens into a rounded bar; on a wink it turns into a ⌒ arc
  const cx = C + s.dx, cy = C + s.dy;
  let pupil;
  const flat = Math.max(0, 1 - s.lid);
  if (s.happy > 0.5 && s.lid > 0.7) {
    const k = Math.min(1, (s.lid - 0.7) / 0.3);
    const w = 22, rx = PUPIL + 6, lift = 30 * k;
    pupil = `<path fill="none" stroke="${col.A}" stroke-width="${w}" stroke-linecap="round" d="M${cx - rx} ${cy + lift * 0.45}Q${cx} ${cy - lift * 1.55} ${cx + rx} ${cy + lift * 0.45}"/>`;
  } else {
    const ry = Math.max(9, PUPIL * flat), rx = PUPIL * (1 + 0.14 * s.lid);
    pupil = `<ellipse transform="rotate(${-DIAG} ${cx.toFixed(2)} ${cy.toFixed(2)})" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="${col.A}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${SIZE}" height="${SIZE}"><rect width="512" height="512" fill="${col.bg}"/>${ring}${pupil}</svg>`;
};

const out = "logos/anim";
const tmp = process.env.TMPDIR_FRAMES || "/tmp/ns-anim";
for (const [k, v] of Object.entries(VARIANTS).filter(([k]) => !process.env.ONLY || k === process.env.ONLY)) {
  for (const [setName, col] of Object.entries(SETS)) {
    const dir = `${tmp}/${k}-${setName}`;
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const n = Math.round(v.dur * FPS);
    for (let i = 0; i < n; i++) {
      const f = `${dir}/f${String(i).padStart(4, "0")}`;
      fs.writeFileSync(`${f}.svg`, frame(stateAt(v.keys, i / FPS), col));
      execFileSync("rsvg-convert", [`${f}.svg`, "-o", `${f}.png`]);
    }
    const base = `${out}/a4x-${k}-${setName}${SUFFIX}`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/f%04d.png`,
      "-vf", "split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none", "-loop", "0", `${base}.gif`]);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/f%04d.png`,
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-movflags", "+faststart", `${base}.mp4`]);
  }
  console.log(k, "done");
}
fs.writeFileSync(`${out}/names.json`, JSON.stringify(Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [k, v.name])), null, 1));
