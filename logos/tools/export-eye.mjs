// Exports the final NeoStation logo (the eye: a two-weight ring with a red pupil) from logos/eye into logos/export.
// Run from the repo root: node logos/eye/gen.mjs && node logos/tools/export-eye.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SRC = "logos/eye";
const INK = "#111216", BONE = "#F1EDE4";

// Tight bounding box of an SVG's drawing, measured on a 4x render (viewBox units).
function bbox(svg, vbW, vbH) {
  fs.writeFileSync("/tmp/ns-bbox.svg", svg);
  execFileSync("rsvg-convert", ["-w", String(vbW * 4), "-h", String(vbH * 4), "/tmp/ns-bbox.svg", "-o", "/tmp/ns-bbox.png"]);
  const [w, h, x, y] = execFileSync("magick", ["/tmp/ns-bbox.png", "-trim", "-format", "%w %h %X %Y", "info:"]).toString().split(" ").map((v) => parseFloat(v) / 4);
  return { x, y, w, h };
}

// Name the parts so they can be animated: the ring (with an invisible guide circle so it turns about the eye's
// centre) and the pupil.
const tag = (svg) => svg.replace(
  /(<g id="icon"[^>]*>)(<path[^>]*\/><path[^>]*\/>)(<circle )/,
  '$1<g class="ns-ring"><circle cx="256" cy="256" r="183" fill="none"/>$2</g>$3class="ns-pupil" ',
);
const noBg = (svg) => svg.replace(/<rect width="1024" height="512" fill="#[0-9A-F]{6}"\/>/, "");
const read = (f) => tag(noBg(fs.readFileSync(`${SRC}/${f}`, "utf8")));

const dark = read("a4x.svg");
const b = bbox(dark, 1024, 512);
const crop = (svg) => svg.replace('viewBox="0 0 1024 512"', `viewBox="${b.x.toFixed(1)} ${b.y.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}"`);

fs.rmSync("logos/export", { recursive: true, force: true });
fs.mkdirSync("logos/export", { recursive: true });
fs.writeFileSync("logos/export/logo.svg", crop(dark));
fs.writeFileSync("logos/export/logo-light.svg", crop(read("a4x-light.svg")));
fs.writeFileSync("logos/export/logo-mono-ink.svg", crop(read("a4x-black.svg")).replaceAll("#000000", INK));
fs.writeFileSync("logos/export/logo-mono-bone.svg", crop(read("a4x-white.svg")).replaceAll("#FFFFFF", BONE));

const icon = tag(fs.readFileSync(`${SRC}/a4x-icon.svg`, "utf8"));
const ib = bbox(icon, 512, 512);
fs.writeFileSync("logos/export/icon.svg", icon);
fs.writeFileSync("logos/export/icon-box.json", JSON.stringify(ib));
console.log("lockup", b, "icon box", ib);
