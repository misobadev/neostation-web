// Exports the final NeoStation logo (handheld, tone D) from logos/handheld into logos/export.
// Run from the repo root: node logos/tools/export-handheld.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SRC = "logos/handheld/tones/D.svg";
const SRC_ICON = "logos/handheld/tones/D-icon.svg";
const INK = "#111216", BONE = "#F1EDE4";
export const SCREEN = "#4A4C58", CONTROLS = "#E0A800";
const COLOURS = ["#4A74FF", "#FF5A4A", "#FFD23F"];

// Tight bounding box of an SVG's drawing, measured on a 4x render (viewBox units).
function bbox(svg, vbW, vbH) {
  fs.writeFileSync("/tmp/ns-bbox.svg", svg);
  execFileSync("rsvg-convert", ["-w", String(vbW * 4), "-h", String(vbH * 4), "/tmp/ns-bbox.svg", "-o", "/tmp/ns-bbox.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-bbox.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 4);
  return { x, y, w, h };
}

const lockup = fs.readFileSync(SRC, "utf8").replace(/\s*<rect width="1024" height="512" fill="#111216"\/>/, "");
const b = bbox(lockup, 1024, 512);
const vb = `${b.x.toFixed(1)} ${b.y.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}`;
const crop = (svg) => svg.replace('viewBox="0 0 1024 512"', `viewBox="${vb}"`);
const wordmark = (svg, colour) => svg.replace(/(<g id="wordmark"[^>]*>\s*<path fill=")#F1EDE4/, `$1${colour}`);
// One-colour versions: body and bands take `ink`, screen and controls take `paper` (cut-outs).
const mono = (svg, ink, paper) => {
  let out = svg;
  for (const c of COLOURS) out = out.replaceAll(`fill="${c}"`, `fill="${ink}"`);
  out = out.replaceAll(`fill="${SCREEN}"`, `fill="${paper}"`).replaceAll(`fill="${CONTROLS}"`, `fill="${paper}"`);
  return wordmark(out, ink);
};

fs.writeFileSync("logos/export/logo.svg", crop(lockup));
fs.writeFileSync("logos/export/logo-light.svg", wordmark(crop(lockup), INK));
fs.writeFileSync("logos/export/logo-mono-ink.svg", mono(crop(lockup), INK, BONE));
fs.writeFileSync("logos/export/logo-mono-bone.svg", mono(crop(lockup), BONE, INK));

const icon = fs.readFileSync(SRC_ICON, "utf8");
const ib = bbox(icon, 512, 512);
fs.writeFileSync("logos/export/icon.svg", icon);
fs.writeFileSync("logos/export/icon-box.json", JSON.stringify(ib));
console.log("lockup", vb, "icon box", ib);
