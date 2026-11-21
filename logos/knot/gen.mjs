// Evolutions of the original NeoStation knot: one continuous strip forming two hexagonal hooks that interlock,
// symmetric under a 180° turn. Rebuilt on a clean hexagonal grid. Run from the repo root: node logos/knot/gen.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

// Centreline of a hexagonal figure-eight in a 512 box: one continuous strip, two loops, one crossing at the centre.
// Left loop (colour a) runs C -> top-right -> ... -> bottom-right -> C; the right loop (colour b) is the same turned 180°.
const C0 = [256, 256];
const LEFT = [C0, [206, 170], [106, 170], [56, 256], [106, 342], [206, 342], C0];
const turn = ([x, y]) => [512 - x, 512 - y];
const RIGHT = LEFT.map(turn);
const W = 46;
// the over-crossing: the diagonal from the right loop's bottom-left into the left loop's top-right passes on top
const OVER = [[279, 295], [233, 217]];
// polyline with every corner rounded by radius r (arcs), as path data
function rounded(pts, r) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [p0, p1, p2] = [pts[i - 1], pts[i], pts[i + 1]];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2), u1 = [v1[0] / l1, v1[1] / l1], u2 = [v2[0] / l2, v2[1] / l2];
    const ang = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    const t = Math.min(r / Math.tan(ang / 2), l1 / 2, l2 / 2), rr = t * Math.tan(ang / 2);
    const a = [p1[0] + u1[0] * t, p1[1] + u1[1] * t], b = [p1[0] + u2[0] * t, p1[1] + u2[1] * t];
    const sweep = u1[0] * u2[1] - u1[1] * u2[0] < 0 ? 1 : 0;
    d += `L${a[0].toFixed(1)} ${a[1].toFixed(1)}A${rr.toFixed(1)} ${rr.toFixed(1)} 0 0 ${sweep} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  const z = pts.at(-1);
  return d + `L${z[0]} ${z[1]}`;
}
const strip = (pts, col, r, w = W) => `<path fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" d="${rounded(pts, r)}"/>`;
// two loops plus the over-crossing (a halo in the ground colour, then the two halves of the top diagonal again)
const knot = (a, b, r, ground, w = W) => strip(LEFT, a, r, w) + strip(RIGHT, b, r, w) +
  `<path fill="none" stroke="${ground}" stroke-width="${w + 18}" d="M${OVER[0][0]} ${OVER[0][1]}L${OVER[1][0]} ${OVER[1][1]}"/>` +
  `<path fill="none" stroke="${b}" stroke-width="${w}" d="M306 342L256 256"/><path fill="none" stroke="${a}" stroke-width="${w}" d="M256 256L206 170"/>`;
const FORMS = {
  k1: ["Infinito hexagonal", "Una sola cinta que forma dos lazos hexagonales y se cruza en el centro: el espíritu del logo original, limpio y en dos colores planos. Significa juegos sin fin, en todas partes.",
    (p, g) => knot(p.a, p.b, 12, g)],
  k2: ["Infinito suave", "El mismo recorrido con curvas amplias: más amable y moderno.",
    (p, g) => knot(p.a, p.b, 52, g)],
  k3: ["Infinito + píxeles", "Un píxel dentro de cada lazo: cada lazo es una pantalla y el píxel es el juego que viaja de una a otra.",
    (p, g) => knot(p.a, p.b, 22, g) + `<rect x="128" y="238" width="36" height="36" rx="7" fill="${p.px}"/><rect x="348" y="238" width="36" height="36" rx="7" fill="${p.px}"/>`],
  k4: ["Infinito en círculo", "El infinito recortado dentro de un círculo de color: listo como ícono de app.",
    (p, g) => `<circle cx="256" cy="256" r="236" fill="${p.a}"/><g transform="translate(256 256) scale(0.74) translate(-256 -256)">${knot(p.cut, p.cut, 20, p.a, 54)}</g>`],
};
const PALETTES = {
  homenaje: ["Homenaje (violeta y verde del original, planos)", { a: "#8B7CF6", b: "#3DDC84", px: "#F1EDE4", cut: "#111216" }],
  neon: ["Neón arcade", { a: "#2EE6D6", b: "#FF3D7F", px: "#FFE14D", cut: "#13252B" }],
  fuego: ["Fuego", { a: "#FFA62B", b: "#FF4D2E", px: "#FFE45C", cut: "#3A1A12" }],
  fosforo: ["Fósforo", { a: "#39E58C", b: "#1FB5A6", px: "#F1EDE4", cut: "#0F2B22" }],
  turquesa: ["Turquesa y mostaza", { a: "#1FA6A0", b: "#E8B33A", px: "#F1EDE4", cut: "#0E2B29" }],
  rojoro: ["Rojo y oro", { a: "#F4C542", b: "#D7263D", px: "#F1EDE4", cut: "#3A0F17" }],
  arena: ["Arena", { a: "#EBD196", b: "#FF8A1F", px: "#FF5A4A", cut: "#3B3A36" }],
};

const wm = JSON.parse(execFileSync("node", ["logos/tools/wordmark.mjs", "bai", "NeoStation", "100", "0.02"]).toString());
const bbox = (art) => {
  fs.writeFileSync("/tmp/ns-knot.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${art}</svg>`);
  execFileSync("rsvg-convert", ["-w", "1024", "-h", "1024", "/tmp/ns-knot.svg", "-o", "/tmp/ns-knot.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-knot.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 2);
  return { x, y, w, h };
};
const lockup = (art, b, bg, word) => {
  const markH = wm.cap * 1.55, s = markH / b.h, markW = b.w * s, gap = wm.cap * 0.55, W2 = markW + gap + wm.width;
  const scale = 640 / W2, ox = (1024 - W2 * scale) / 2, oy = (512 - markH * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 512"><rect width="1024" height="512" fill="${bg}"/><g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${scale.toFixed(4)})"><g id="icon" transform="scale(${s.toFixed(4)}) translate(${-b.x} ${-b.y})">${art}</g><g id="wordmark" transform="translate(${(markW + gap - wm.minX).toFixed(2)} ${((markH + wm.cap) / 2).toFixed(2)})"><path fill="${word}" d="${wm.d}"/></g></g></svg>\n`;
};
const index = [];
for (const [fk, [fname, fnote, draw]] of Object.entries(FORMS)) for (const [pk, [pname, pal]] of Object.entries(PALETTES)) {
  const art = draw(pal, "#111216"), artL = draw(pal, "#F1EDE4"), b = bbox(art), id = `${fk}-${pk}`;
  fs.writeFileSync(`logos/knot/${id}-icon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="icon">${art}</g></svg>\n`);
  fs.writeFileSync(`logos/knot/${id}.svg`, lockup(art, b, "#111216", "#F1EDE4"));
  fs.writeFileSync(`logos/knot/${id}-light.svg`, lockup(artL, b, "#F1EDE4", "#111216"));
  index.push({ id, fk, fname, fnote, pk, pname, pal });
}
fs.writeFileSync("logos/knot/index.json", JSON.stringify(index));
console.log(index.length, "files");
