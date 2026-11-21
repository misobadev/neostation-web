// Isotypes built by combining simple shapes so the combination means something. Palette "Arena 2".
// Run from the repo root: node logos/shapes/gen.mjs
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

const MARKS = {
  // 1 Pin + play: a map pin whose hole is a play triangle -> play anywhere.
  pin: ["Pin + play", "Un pin de ubicación con un play dentro: jugar en cualquier lugar.",
    `<path fill="${C.sand}" d="M256 64c-92 0-160 70-160 158 0 116 160 226 160 226s160-110 160-226c0-88-68-158-160-158z"/>` + play(262, 224, 128, C.red)],
  // 2 Pixels that form a play button: columns of 5, 3 and 1 square pixels -> retro pixels become "play".
  blocks: ["Play de píxeles", "Un botón de play construido con píxeles cuadrados en tres colores: lo retro convertido en jugar.",
    (() => { const p = 68, g = 8, x0 = 256 - (3 * p + 2 * g) / 2, cols = [[5, C.org], [3, C.red], [1, C.sand]]; let out = "";
      cols.forEach(([n, fill], i) => { for (let j = 0; j < n; j++) { const y = 256 - (n * p + (n - 1) * g) / 2 + j * (p + g); out += rr(x0 + i * (p + g), y, p, p, 12, fill); } });
      return out; })()],
  // 3 Coin + play: an arcade coin with a play slot -> insert coin, press play.
  coin: ["Ficha + play", "Una ficha de arcade con el play recortado: insertar ficha, presionar play.",
    `<circle cx="256" cy="256" r="176" fill="${C.sand}"/><circle cx="256" cy="256" r="136" fill="none" stroke="${C.tof}" stroke-width="16"/>` + play(266, 256, 150, C.red)],
  // 4 Two screens overlapping, the overlap is the game -> the same game on every screen.
  screens: ["Dos pantallas, un juego", "Una pantalla grande (tele) y una chica (portátil) se cruzan; donde se tocan está el juego: el mismo en todas tus pantallas.",
    rr(64, 120, 280, 200, 32, C.sand) + rr(236, 232, 212, 160, 28, C.org) + `<path fill="${C.red}" d="M236 260a28 28 0 0 1 28-28h80v60a28 28 0 0 1-28 28h-80z"/>`],
  // 5 Sync loop + pixel -> your saves follow you.
  sync: ["Ciclo + píxel", "Dos flechas en círculo con un píxel al centro: tus partidas sincronizadas, siempre contigo.",
    `<path fill="none" stroke="${C.sand}" stroke-width="44" stroke-linecap="round" d="M120 256a136 136 0 0 1 232-96"/><path fill="${C.sand}" d="M330 108l78 34-58 62z"/>` +
    `<path fill="none" stroke="${C.org}" stroke-width="44" stroke-linecap="round" d="M392 256a136 136 0 0 1-232 96"/><path fill="${C.org}" d="M182 404l-78-34 58-62z"/>` + rr(212, 212, 88, 88, 14, C.red)],
  // 6 Globe + pixel: a world made of a circle and two arcs, one quadrant is a pixel -> retro games everywhere.
  globe: ["Mundo de píxel", "Un globo terráqueo hecho con un círculo y dos arcos, con un cuadrante convertido en píxel: juegos retro en todo el mundo.",
    `<circle cx="256" cy="256" r="176" fill="${C.sand}"/><path fill="none" stroke="${C.esp}" stroke-width="20" d="M256 80v352M80 256h352M256 80c-72 60-72 292 0 352M256 80c72 60 72 292 0 352"/>` +
    `<path fill="${C.red}" d="M266 90a166 166 0 0 1 156 156h-156z"/>`],
  // 7 Play + motion: a play triangle leaving two stripes behind -> play on the go.
  go: ["Play en movimiento", "Un play que avanza dejando la estela roja y naranja: jugar en movimiento, en cualquier pantalla.",
    `<g transform="translate(256 256) skewX(-10) translate(-256 -256)">${rr(78, 168, 34, 176, 17, C.org)}${rr(132, 138, 34, 236, 17, C.red)}</g>` + play(300, 256, 270, C.sand)],
  // 8 Cartridge + heart: a cartridge whose label is a pixel heart -> games you love, kept safe.
  heartcart: ["Cartucho + corazón", "Un cartucho cuyo frente es un corazón de píxeles: los juegos que quieres, guardados en un lugar.",
    `<path fill="${C.sand}" d="M144 96h224a24 24 0 0 1 24 24v272a24 24 0 0 1-24 24h-40v-36h-24v36h-96v-36h-24v36h-40a24 24 0 0 1-24-24V120a24 24 0 0 1 24-24z"/>` +
    (() => { const m = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"], p = 26, x0 = 256 - 3.5 * p, y0 = 150; let d = ""; m.forEach((row, j) => { for (const r of row.matchAll(/1+/g)) d += `M${x0 + r.index * p} ${y0 + j * p}h${r[0].length * p}v${p + 0.5}h-${r[0].length * p}z`; }); return `<path fill="${C.red}" d="${d}"/>`; })()],
};

const wm = JSON.parse(execFileSync("node", ["logos/tools/wordmark.mjs", "bai", "NeoStation", "100", "0.02"]).toString());
const art = (k, bg) => MARKS[k][2].replaceAll(BG, bg);
const bbox = (k) => {
  fs.writeFileSync("/tmp/ns-shape.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${art(k, "#111216")}</svg>`);
  execFileSync("rsvg-convert", ["-w", "1024", "-h", "1024", "/tmp/ns-shape.svg", "-o", "/tmp/ns-shape.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-shape.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 2);
  return { x, y, w, h };
};
const lockup = (k, bg, word) => {
  const b = bbox(k), markH = wm.cap * 1.75, s = markH / b.h, markW = b.w * s, gap = wm.cap * 0.55;
  const W = markW + gap + wm.width, scale = 640 / W, ox = (1024 - W * scale) / 2, oy = (512 - markH * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 512"><rect width="1024" height="512" fill="${bg}"/>` +
    `<g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${scale.toFixed(4)})"><g id="icon" transform="scale(${s.toFixed(4)}) translate(${-b.x} ${-b.y})">${art(k, bg)}</g>` +
    `<g id="wordmark" transform="translate(${(markW + gap - wm.minX).toFixed(2)} ${((markH + wm.cap) / 2).toFixed(2)})"><path fill="${word}" d="${wm.d}"/></g></g></svg>\n`;
};
for (const k of Object.keys(MARKS)) {
  fs.writeFileSync(`logos/shapes/${k}-icon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="icon">${art(k, C.ink)}</g></svg>\n`);
  fs.writeFileSync(`logos/shapes/${k}.svg`, lockup(k, C.ink, C.bone));
  fs.writeFileSync(`logos/shapes/${k}-light.svg`, lockup(k, C.bone, C.ink));
}
fs.writeFileSync("logos/shapes/names.json", JSON.stringify(Object.fromEntries(Object.entries(MARKS).map(([k, v]) => [k, [v[0], v[1]]]))));
console.log(Object.keys(MARKS).length, "marks");
