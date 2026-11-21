// Outlines text in one of the fonts in ../fonts and prints JSON: { d, minX, minY, maxX, maxY, width, height, cap }.
// Usage: node logos/tools/wordmark.mjs <font-slug> <text> [size=100] [tracking=0 (em)]
// Fonts are subsets: only the letters of "NeoStation" in any case are available.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const [slug, text, sizeArg = "100", trackArg = "0"] = process.argv.slice(2);
if (!slug || !text) { console.error("usage: wordmark.mjs <font-slug> <text> [size] [tracking]"); process.exit(1); }
const b = fs.readFileSync(path.join(here, "../fonts", `${slug}.ttf`));
const f = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
const size = Number(sizeArg), track = Number(trackArg);
const n2 = (v) => String(Math.round(v * 100) / 100);
const toD = (cmds) => cmds.map((c) => c.type === "M" || c.type === "L" ? `${c.type}${n2(c.x)} ${n2(c.y)}` : c.type === "Q" ? `Q${n2(c.x1)} ${n2(c.y1)} ${n2(c.x)} ${n2(c.y)}` : c.type === "C" ? `C${n2(c.x1)} ${n2(c.y1)} ${n2(c.x2)} ${n2(c.y2)} ${n2(c.x)} ${n2(c.y)}` : "Z").join("");
const glyphs = f.stringToGlyphs(text);
let x = 0, d = "", minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
glyphs.forEach((g, i) => {
  const p = g.getPath(0, 0, size);
  p.commands = p.commands.map((k) => { const m = { ...k }; for (const key of ["x", "x1", "x2"]) if (m[key] !== undefined) m[key] += x; return m; });
  const bb = p.getBoundingBox();
  if (Number.isFinite(bb.x1)) { minX = Math.min(minX, bb.x1); maxX = Math.max(maxX, bb.x2); minY = Math.min(minY, bb.y1); maxY = Math.max(maxY, bb.y2); }
  d += toD(p.commands);
  if (i < glyphs.length - 1) x += (g.advanceWidth + (f.getKerningValue(g, glyphs[i + 1]) || 0)) * size / f.unitsPerEm + track * size;
});
const cap = -f.charToGlyph("N").getPath(0, 0, size).getBoundingBox().y1;
console.log(JSON.stringify({ d, minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, cap }));
