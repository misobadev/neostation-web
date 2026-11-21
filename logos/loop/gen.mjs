// Refinements of the "loop + pixel" isotype (round shapes, one accent). Palette "Arena 2".
// Run from the repo root: node logos/loop/gen.mjs
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
const R = 150, W = 56;
const MARKS = {
  l1: ["Ciclo limpio + píxel", "Dos arcos gruesos de punta redonda, sin flechas, rodean un píxel: tus juegos y partidas dando la vuelta entre tus pantallas.",
    stroke(arc(256, 256, R, 160, 300), C.sand, W) + stroke(arc(256, 256, R, -20, 120), C.org, W) + rr(214, 214, 84, 84, 16, C.red)],
  l2: ["Ciclo con puntos", "Como iiSU, cada arco termina en un punto suelto: el movimiento se lee sin flechas.",
    stroke(arc(256, 256, R, 170, 280), C.sand, W) + dot(...pol(256, 256, R, 302), 30, C.sand) + stroke(arc(256, 256, R, -10, 100), C.org, W) + dot(...pol(256, 256, R, 122), 30, C.org) + rr(214, 214, 84, 84, 16, C.red)],
  l3: ["Ciclo + play de píxeles", "El ciclo del 5 envolviendo el play de píxeles del 2: jugar, guardar y seguir en otra pantalla.",
    stroke(arc(256, 256, 176, 165, 295), C.sand, 46) + stroke(arc(256, 256, 176, -15, 115), C.org, 46) + pixelPlay(256, 256, 40, 6, [[3, C.red], [2, C.red], [1, C.red]])],
  l4: ["Ciclo en círculo contenedor", "Como DroidDeck e iiSU, todo dentro de un círculo: el ciclo es un recorte y el píxel es el único acento.",
    `<circle cx="256" cy="256" r="200" fill="${C.sand}"/>` + stroke(arc(256, 256, 120, 165, 295), C.esp, 44) + stroke(arc(256, 256, 120, -15, 115), C.esp, 44) + rr(222, 222, 68, 68, 14, C.red)],
  l5: ["Ficha que gira", "El 3 y el 5 juntos: el borde de una ficha de arcade convertido en dos arcos, con el play al centro.",
    stroke(arc(256, 256, 170, 160, 300), C.sand, 50) + stroke(arc(256, 256, 170, -20, 120), C.org, 50) + `<circle cx="256" cy="256" r="112" fill="${C.sand}"/>` + play(266, 256, 120, C.red)],
  l6: ["Ciclo con flechas, refinado", "El 5 original con flechas más limpias y grosor parejo, para comparar.",
    stroke(arc(256, 256, R, 196, 318), C.sand, W) + head(256, 256, R, 318, C.sand, 52) + stroke(arc(256, 256, R, 16, 138), C.org, W) + head(256, 256, R, 138, C.org, 52) + rr(214, 214, 84, 84, 16, C.red)],
  l7: ["Píxel en diagonal", "El píxel girado 45° como una gema o un punto de guardado, dentro del ciclo.",
    stroke(arc(256, 256, R, 160, 300), C.sand, W) + stroke(arc(256, 256, R, -20, 120), C.org, W) + `<rect x="214" y="214" width="84" height="84" rx="16" fill="${C.red}" transform="rotate(45 256 256)"/>`],
  l8: ["Ciclo de dos colores, un trazo", "Un solo anillo grueso partido en dos colores con el píxel en el centro: lo más simple posible.",
    `<circle cx="256" cy="256" r="${R}" fill="none" stroke="${C.sand}" stroke-width="${W}"/>` + stroke(arc(256, 256, R, 0, 180), C.org, W) + rr(214, 214, 84, 84, 16, C.red)],
};
const wm = JSON.parse(execFileSync("node", ["logos/tools/wordmark.mjs", "bai", "NeoStation", "100", "0.02"]).toString());
const art = (k, bg) => MARKS[k][2].replaceAll(BG, bg);
const bbox = (k) => {
  fs.writeFileSync("/tmp/ns-loop.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${art(k, "#111216")}</svg>`);
  execFileSync("rsvg-convert", ["-w", "1024", "-h", "1024", "/tmp/ns-loop.svg", "-o", "/tmp/ns-loop.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-loop.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 2);
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
  fs.writeFileSync(`logos/loop/${k}-icon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="icon">${art(k, C.ink)}</g></svg>\n`);
  fs.writeFileSync(`logos/loop/${k}.svg`, lockup(k, C.ink, C.bone));
  fs.writeFileSync(`logos/loop/${k}-light.svg`, lockup(k, C.bone, C.ink));
}
fs.writeFileSync("logos/loop/names.json", JSON.stringify(Object.fromEntries(Object.entries(MARKS).map(([k, v]) => [k, [v[0], v[1]]]))));
console.log(Object.keys(MARKS).length, "marks");
