// Unique geometry studies for the loop isotype, palette 9 ("bone and one accent").
// Run from the repo root: node logos/eye/gen.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const C = { sand: "#EBD196", esp: "#3B3A36", tof: "#C29F5E", red: "#FF5A4A", org: "#FF8A1F", ink: "#111216", bone: "#F1EDE4" };
const BG = "var(--bg)"; // cut-outs take the background colour
// rounded play triangle pointing right, centred on (cx, cy), height h
const play = (cx, cy, h, fill) => {
  const w = h * 0.9, x0 = cx - w / 2.4, r = h * 0.09;
  return `<path fill="${fill}" stroke="${fill}" stroke-width="${r * 2}" stroke-linejoin="round" d="M${x0 + r} ${cy - h / 2 + r * 1.6}L${x0 + w - r * 1.6} ${cy}L${x0 + r} ${cy + h / 2 - r * 1.6}Z"/>`;
};
const rr = (x, y, w, h, r, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;

const pol = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
const arc = (cx, cy, r, a0, a1) => { const [x0, y0] = pol(cx, cy, r, a0), [x1, y1] = pol(cx, cy, r, a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
const stroke = (d, col, w) => `<path fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" d="${d}"/>`;
const dot = (cx, cy, r, col) => `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${col}"/>`;
const head = (cx, cy, r, deg, col, size) => { // arrowhead at the end of an arc going clockwise
  const [x, y] = pol(cx, cy, r, deg), t = ((deg + 90) * Math.PI) / 180, n = (deg * Math.PI) / 180;
  const tip = [x + Math.cos(t) * size, y + Math.sin(t) * size], b1 = [x + Math.cos(n) * size * 0.75, y + Math.sin(n) * size * 0.75], b2 = [x - Math.cos(n) * size * 0.75, y - Math.sin(n) * size * 0.75];
  return `<path fill="${col}" stroke="${col}" stroke-width="14" stroke-linejoin="round" d="M${tip.map((v) => v.toFixed(1)).join(" ")}L${b1.map((v) => v.toFixed(1)).join(" ")}L${b2.map((v) => v.toFixed(1)).join(" ")}Z"/>`;
};
const pixelPlay = (cx, cy, p, g, cols) => { let out = ""; const x0 = cx - (3 * p + 2 * g) / 2 + p * 0.15;
  cols.forEach(([n, fill], i) => { for (let j = 0; j < n; j++) out += rr(x0 + i * (p + g), cy - (n * p + (n - 1) * g) / 2 + j * (p + g), p, p, p * 0.18, fill); }); return out; };
const B = "#F1EDE4", G = "#B9B4A8", A = "#FF5A4A"; // palette 9: bone, grey, one red accent
const R = 150, W = 56;
// arc with chiselled ends: the ends are cut at the wordmark's italic angle instead of rounded
const chisel = (cx, cy, r, a0, a1, col, w) => {
  const o = pol(cx, cy, r + w / 2, a0), i = pol(cx, cy, r - w / 2, a0), o1 = pol(cx, cy, r + w / 2, a1), i1 = pol(cx, cy, r - w / 2, a1);
  const sk = w * 0.18; // shift of the inner corners along the arc, to slant the cut
  const [ix, iy] = pol(cx, cy, r - w / 2, a0 + (sk / (r - w / 2)) * 57.3), [ix1, iy1] = pol(cx, cy, r - w / 2, a1 + (sk / (r - w / 2)) * 57.3);
  const big = a1 - a0 > 180 ? 1 : 0;
  return `<path fill="${col}" d="M${o[0].toFixed(1)} ${o[1].toFixed(1)}A${r + w / 2} ${r + w / 2} 0 ${big} 1 ${o1[0].toFixed(1)} ${o1[1].toFixed(1)}L${ix1.toFixed(1)} ${iy1.toFixed(1)}A${r - w / 2} ${r - w / 2} 0 ${big} 0 ${ix.toFixed(1)} ${iy.toFixed(1)}Z"/>`;
};
// a ring drawn with square pixels (8-bit circle)
const pixelRing = (cx, cy, r, p, a0, a1, col) => { let out = ""; const n = Math.round((2 * Math.PI * r) / (p * 1.25));
  for (let k = 0; k < n; k++) { const deg = (360 * k) / n; const dd = ((deg - a0) % 360 + 360) % 360; if (dd > ((a1 - a0 + 360) % 360)) continue;
    const [x, y] = pol(cx, cy, r, deg); out += rr(Math.round((x - p / 2) / 8) * 8, Math.round((y - p / 2) / 8) * 8, p, p, 5, col); } return out; };
// helpers for this round
const oct = (r, rot = 22.5) => Array.from({ length: 8 }, (_, k) => pol(256, 256, r, rot + 45 * k));
const poly = (pts, idx, col, w) => `<path fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" d="M${idx.map((i) => pts[i].map((v) => v.toFixed(1)).join(" ")).join("L")}"/>`;
const sq = (cx, cy, size, col, rot = 0) => `<rect x="${(cx - size / 2).toFixed(1)}" y="${(cy - size / 2).toFixed(1)}" width="${size}" height="${size}" rx="${(size * 0.2).toFixed(1)}" fill="${col}"${rot ? ` transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})"` : ""}/>`;
// a tapered arc (comet tail): many short segments with growing width
const taper = (r, a0, a1, w0, w1, col) => { let out = ""; const n = 18; for (let i = 0; i < n; i++) { const s0 = a0 + ((a1 - a0) * i) / n, s1 = a0 + ((a1 - a0) * (i + 1)) / n, w = w0 + ((w1 - w0) * i) / (n - 1); out += `<path fill="none" stroke="${col}" stroke-width="${w.toFixed(1)}" stroke-linecap="round" d="${arc(256, 256, r, s0, s1 + 0.5)}"/>`; } return out; };
const O = oct(160);
const polyM = (pts, idx, col, w) => `<path fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="square" stroke-linejoin="miter" d="M${idx.map((i) => pts[i].map((v) => v.toFixed(1)).join(" ")).join("L")}"/>`;
const octShape = (cx, cy, r, col) => `<path fill="${col}" d="M${oct(r).map(([x, y]) => `${(x - 256 + cx).toFixed(1)} ${(y - 256 + cy).toFixed(1)}`).join("L")}Z"/>`;
const diamond = (size, rx, col) => `<rect x="${256 - size / 2}" y="${256 - size / 2}" width="${size}" height="${size}" rx="${rx}" fill="${col}" transform="rotate(45 256 256)"/>`;
const octR = (r, rot, col) => `<path fill="${col}" stroke="${col}" stroke-width="6" stroke-linejoin="round" d="M${oct(r, rot).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z"/>`;
const g3arcs = (wT = 66, wt = 30, rot = 0, cap = "round") => `<path fill="none" stroke="${B}" stroke-width="${wT}" stroke-linecap="round" d="${arc(256, 256, R, 154.6 + rot, 295.4 + rot)}"/>` + `<path fill="none" stroke="${G}" stroke-width="${wt}" stroke-linecap="${cap}" d="${arc(256, 256, R, -32.3 + rot, 122.3 + rot)}"/>`;
const octRing = (w = 54, join = "round") => { const P = oct(160); const p = (idx, col) => `<path fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="${join === "round" ? "round" : "square"}" stroke-linejoin="${join}" d="M${idx.map((i) => P[i].map((v) => v.toFixed(1)).join(" ")).join("L")}"/>`; return p([3, 4, 5, 6], B) + p([7, 0, 1, 2], G); };
const MARKS = {
  b3a: ["B3A · Octogonal, centro circular", "Anillo octogonal en hueso y gris con un círculo rojo al centro.", octRing() + dot(256, 256, 55, A)],
  a4x: ["A4X · Dos grosores, centro circular", "Anillo redondo de dos grosores con un círculo rojo al centro.", g3arcs() + dot(256, 256, 53, A)],
};
const wm = JSON.parse(execFileSync("node", ["logos/tools/wordmark.mjs", "bai", "NeoStation", "100", "0.02"]).toString());
// Colour sets per ground. Dark: bone, grey, red. Light: ink, dark grey, deeper red (all measured on white).
// One-colour: every part in the same ink (black on white, white on black).
const SETS = {
  dark: { [B]: B, [G]: G, [A]: A },
  light: { [B]: "#111216", [G]: "#77736A", [A]: "#E8402F" },
  black: { [B]: "#000000", [G]: "#000000", [A]: "#000000" },
  white: { [B]: "#FFFFFF", [G]: "#FFFFFF", [A]: "#FFFFFF" },
};
const art = (k, bg, set = "dark") => {
  let out = MARKS[k][2].replaceAll(BG, bg);
  const map = SETS[set];
  for (const c of [B, G, A]) out = out.replaceAll(`"${c}"`, `"@@${c}"`);
  for (const c of [B, G, A]) out = out.replaceAll(`"@@${c}"`, `"${map[c]}"`);
  return out;
};
const bbox = (k) => {
  fs.writeFileSync("/tmp/ns-eye.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${art(k, "#111216")}</svg>`);
  execFileSync("rsvg-convert", ["-w", "1024", "-h", "1024", "/tmp/ns-eye.svg", "-o", "/tmp/ns-eye.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-eye.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 2);
  return { x, y, w, h };
};
const lockup = (k, bg, word, set = "dark") => {
  const b = bbox(k), markH = wm.cap * 1.75, s = markH / b.h, markW = b.w * s, gap = wm.cap * 0.55;
  const W = markW + gap + wm.width, scale = 640 / W, ox = (1024 - W * scale) / 2, oy = (512 - markH * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 512"><rect width="1024" height="512" fill="${bg}"/>` +
    `<g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${scale.toFixed(4)})"><g id="icon" transform="scale(${s.toFixed(4)}) translate(${-b.x} ${-b.y})">${art(k, bg, set)}</g>` +
    `<g id="wordmark" transform="translate(${(markW + gap - wm.minX).toFixed(2)} ${((markH + wm.cap) / 2).toFixed(2)})"><path fill="${word}" d="${wm.d}"/></g></g></svg>\n`;
};
for (const k of Object.keys(MARKS)) {
  const icon = (set) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="icon">${art(k, set === "light" || set === "black" ? "#FFFFFF" : C.ink, set)}</g></svg>\n`;
  fs.writeFileSync(`logos/eye/${k}-icon.svg`, icon("dark"));
  fs.writeFileSync(`logos/eye/${k}-icon-light.svg`, icon("light"));
  fs.writeFileSync(`logos/eye/${k}.svg`, lockup(k, C.ink, C.bone, "dark"));
  fs.writeFileSync(`logos/eye/${k}-light.svg`, lockup(k, "#FFFFFF", "#111216", "light"));
  fs.writeFileSync(`logos/eye/${k}-black.svg`, lockup(k, "#FFFFFF", "#000000", "black"));
  fs.writeFileSync(`logos/eye/${k}-white.svg`, lockup(k, "#000000", "#FFFFFF", "white"));
}
fs.writeFileSync("logos/eye/names.json", JSON.stringify(Object.fromEntries(Object.entries(MARKS).map(([k, v]) => [k, [v[0], v[1]]]))));
console.log(Object.keys(MARKS).length, "marks");
