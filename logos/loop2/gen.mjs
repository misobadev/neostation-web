// Unique geometry studies for the loop isotype, palette 9 ("bone and one accent").
// Run from the repo root: node logos/loop2/gen.mjs
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
const MARKS = {
  g1: ["Espiral", "Los dos arcos tienen radios distintos y forman una espiral que se cierra hacia el píxel: el juego entrando al centro de tu biblioteca.",
    stroke(arc(256, 256, 172, 150, 330), B, 50) + stroke(arc(256, 256, 112, -30, 160), G, 44) + rr(226, 226, 60, 60, 12, A)],
  g2: ["Cortes en itálica", "Los extremos de los arcos se cortan con la inclinación de la tipografía, como si el anillo girara rápido.",
    chisel(256, 256, R, 160, 300, B, W) + chisel(256, 256, R, -20, 120, G, W) + rr(214, 214, 84, 84, 16, A)],
  g3: ["Dos grosores", "Un arco grueso en hueso y uno fino en gris: el giro tiene peso y estela, como el trazo de un cometa.",
    stroke(arc(256, 256, R, 150, 315), B, 66) + stroke(arc(256, 256, R, -15, 115), G, 30) + rr(214, 214, 84, 84, 16, A)],
  g4: ["Anillo octogonal", "El anillo hecho de tramos rectos en ángulo, como una estación o un portal: más técnico y propio que un círculo.",
    (() => { const pts = Array.from({ length: 8 }, (_, k) => pol(256, 256, 160, 22.5 + 45 * k)); const seg = (i, j, col) => `<path fill="none" stroke="${col}" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" d="M${pts.slice(i, j + 1).map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}"/>`;
      const path = (idx, col) => `<path fill="none" stroke="${col}" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" d="M${idx.map((i) => pts[i].map((v) => v.toFixed(1)).join(" ")).join("L")}"/>`;
      return path([3, 4, 5, 6], B) + path([7, 0, 1, 2], G); })() + rr(218, 218, 76, 76, 14, A)],
  g5: ["Píxel en órbita", "El píxel rojo deja el centro y viaja sobre el anillo, ocupando su hueco: un juego en movimiento entre tus pantallas.",
    stroke(arc(256, 256, R, 140, 395), B, W) + rr(...pol(256, 256, R, 70).map((v) => v - 40), 80, 80, 16, A).replace("<rect", `<rect transform="rotate(25 ${pol(256, 256, R, 70)[0].toFixed(1)} ${pol(256, 256, R, 70)[1].toFixed(1)})"`) + `<circle cx="256" cy="256" r="34" fill="${G}"/>`],
  g6: ["Anillo de píxeles", "El anillo dibujado con cuadrados, como un círculo de 8 bits: lo retro dentro de la forma misma.",
    pixelRing(256, 256, 160, 44, 150, 330, B) + pixelRing(256, 256, 160, 44, 330, 140, G) + rr(222, 222, 68, 68, 12, A)],
  g7: ["Terminales de píxel", "Los arcos terminan en un píxel cuadrado en vez de una punta redonda: el giro y lo retro en el mismo trazo.",
    `<path fill="none" stroke="${B}" stroke-width="${W}" stroke-linecap="butt" d="${arc(256, 256, R, 165, 300)}"/>` + rr(...pol(256, 256, R, 300).map((v) => v - 30), 60, 60, 10, B) +
    `<path fill="none" stroke="${G}" stroke-width="${W}" stroke-linecap="butt" d="${arc(256, 256, R, -15, 120)}"/>` + rr(...pol(256, 256, R, 120).map((v) => v - 30), 60, 60, 10, G) + rr(222, 222, 68, 68, 12, A)],
  g8: ["Órbitas superpuestas", "Un arco grande y uno chico en sentidos opuestos, como dos órbitas alrededor del píxel: una estación con todo girando a su alrededor.",
    stroke(arc(256, 256, 176, 120, 330), B, 46) + stroke(arc(256, 256, 104, -60, 140), G, 40) + rr(232, 232, 48, 48, 10, A)],
  g9: ["Anillo con mordida", "Un solo anillo grueso con un corte en diagonal donde se asoma el acento rojo: una forma, un gesto.",
    stroke(arc(256, 256, R, 70, 370), B, 70) + rr(...pol(256, 256, R, 40).map((v) => v - 36), 72, 72, 14, A) + rr(226, 226, 60, 60, 12, G)],
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
  fs.writeFileSync("/tmp/ns-loop2.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${art(k, "#111216")}</svg>`);
  execFileSync("rsvg-convert", ["-w", "1024", "-h", "1024", "/tmp/ns-loop2.svg", "-o", "/tmp/ns-loop2.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-loop2.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 2);
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
  fs.writeFileSync(`logos/loop2/${k}-icon.svg`, icon("dark"));
  fs.writeFileSync(`logos/loop2/${k}-icon-light.svg`, icon("light"));
  fs.writeFileSync(`logos/loop2/${k}.svg`, lockup(k, C.ink, C.bone, "dark"));
  fs.writeFileSync(`logos/loop2/${k}-light.svg`, lockup(k, "#FFFFFF", "#111216", "light"));
  fs.writeFileSync(`logos/loop2/${k}-black.svg`, lockup(k, "#FFFFFF", "#000000", "black"));
  fs.writeFileSync(`logos/loop2/${k}-white.svg`, lockup(k, "#000000", "#FFFFFF", "white"));
}
fs.writeFileSync("logos/loop2/names.json", JSON.stringify(Object.fromEntries(Object.entries(MARKS).map(([k, v]) => [k, [v[0], v[1]]]))));
console.log(Object.keys(MARKS).length, "marks");
