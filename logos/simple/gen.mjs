// Simple isotype candidates (2-4 shapes) in the "Arena 2" palette, with lockups.
// Run from the repo root: node logos/simple/gen.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const C = { sand: "#EBD196", esp: "#3B3A36", tof: "#C29F5E", red: "#FF5A4A", org: "#FF8A1F", ink: "#111216", bone: "#F1EDE4" };
const rr = (x, y, w, h, r, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${extra}/>`;
const plus = (cx, cy, len, t, fill) => `<path fill="${fill}" d="M${cx - t / 2} ${cy - len / 2}h${t}v${(len - t) / 2}h${(len - t) / 2}v${t}h-${(len - t) / 2}v${(len - t) / 2}h-${t}v-${(len - t) / 2}h-${(len - t) / 2}v-${t}h${(len - t) / 2}z"/>`;
const lean = (body) => `<g transform="translate(256 256) skewX(-10) translate(-256 -256)">${body}</g>`;

// console geometry, centred in 512
const body = (fill, x = 166) => rr(x, 96, 196, 320, 34, fill);
const screen = (fill, x = 166) => rr(x + 26, 126, 144, 124, 14, fill);
const dpad = (fill, x = 166) => plus(x + 66, 334, 70, 24, fill);
const button = (fill, x = 166) => `<circle cx="${x + 140}" cy="${324}" r="19" fill="${fill}"/>`;
const stripe = (x, fill, h = 320, y = 96) => rr(x, y, 26, h, 13, fill);
const pixelHeart = (cx, cy, p, fill) => {
  const m = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
  // one path per row run, so no hairline seams appear between pixels
  let d = "";
  m.forEach((row, j) => { for (const r of row.matchAll(/1+/g)) d += `M${cx - 3.5 * p + r.index * p} ${cy - 3 * p + j * p}h${r[0].length * p}v${p + 0.5}h-${r[0].length * p}z`; });
  return `<path fill="${fill}" d="${d}"/>`;
};

const MARKS = {
  s1: ["Consola sola, inclinada", lean(body(C.sand) + screen(C.esp) + dpad(C.tof) + button(C.tof))],
  s2: ["Consola + una franja", lean(stripe(120, C.red) + body(C.sand) + screen(C.esp) + dpad(C.tof) + button(C.tof))],
  s3: ["Consola sin controles + estela", lean(stripe(84, C.org, 260, 126) + stripe(124, C.red, 290, 111) + body(C.sand) + screen(C.esp))],
  s4: ["Consola recta, sin estela", body(C.sand) + screen(C.esp) + dpad(C.tof) + button(C.tof)],
  s5: ["Consola calada (una tinta) + franja", lean(stripe(120, C.org) + body(C.sand) + screen("var(--bg)") + dpad("var(--bg)") + button("var(--bg)"))],
  s6: ["Cartucho", `<path fill="${C.sand}" d="M150 104h168l44 44v236a24 24 0 0 1-24 24H150a24 24 0 0 1-24-24V128a24 24 0 0 1 24-24z"/>` + rr(164, 150, 168, 150, 12, C.red) + rr(164, 330, 30, 46, 6, C.tof) + rr(206, 330, 30, 46, 6, C.tof) + rr(248, 330, 30, 46, 6, C.tof) + rr(290, 330, 30, 46, 6, C.tof)],
  s7: ["Pantalla con corazón", rr(104, 136, 304, 240, 40, C.sand) + rr(136, 168, 240, 176, 18, C.esp) + pixelHeart(256, 260, 24, C.red)],
  s8: ["Pantalla con estela", lean(stripe(86, C.org, 200, 156) + stripe(126, C.red, 230, 141) + rr(166, 126, 236, 260, 40, C.sand) + rr(194, 156, 180, 150, 16, C.esp))],
};

const wm = JSON.parse(execFileSync("node", ["logos/tools/wordmark.mjs", "bai", "NeoStation", "100", "0.02"]).toString());
// tight drawing box of a mark inside its 512 box (measured on a 2x render)
const bbox = (k) => {
  fs.writeFileSync("/tmp/ns-simple.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${MARKS[k][1].replaceAll("var(--bg)", "#111216")}</svg>`);
  execFileSync("rsvg-convert", ["-w", "1024", "-h", "1024", "/tmp/ns-simple.svg", "-o", "/tmp/ns-simple.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-simple.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 2);
  return { x, y, w, h };
};
const lockup = (k, bg, word) => {
  const mark = MARKS[k][1].replaceAll("var(--bg)", bg);
  const b = bbox(k);
  const markH = wm.cap * 1.7, s = markH / b.h, markW = b.w * s, gap = wm.cap * 0.55, W = markW + gap + wm.width, H = markH;
  const scale = 640 / W, ox = (1024 - W * scale) / 2, oy = (512 - H * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 512"><rect width="1024" height="512" fill="${bg}"/>` +
    `<g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${scale.toFixed(4)})"><g id="icon" transform="scale(${s.toFixed(4)}) translate(${-b.x} ${-b.y})">${mark}</g>` +
    `<g id="wordmark" transform="translate(${(markW + gap - wm.minX).toFixed(2)} ${((markH + wm.cap) / 2).toFixed(2)})"><path fill="${word}" d="${wm.d}"/></g></g></svg>\n`;
};
for (const k of Object.keys(MARKS)) {
  fs.writeFileSync(`logos/simple/${k}-icon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g id="icon">${MARKS[k][1].replaceAll("var(--bg)", C.ink)}</g></svg>\n`);
  fs.writeFileSync(`logos/simple/${k}.svg`, lockup(k, C.ink, C.bone));
  fs.writeFileSync(`logos/simple/${k}-light.svg`, lockup(k, C.bone, C.ink));
}
fs.writeFileSync("logos/simple/names.json", JSON.stringify(Object.fromEntries(Object.entries(MARKS).map(([k, v]) => [k, v[0]]))));
console.log(Object.keys(MARKS).length, "marks");
