// Builds the site's brand files from logos/export (iteration 5, "Soft era").
// Run: node logos/tools/brand-assets.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const ex = "logos/export";
const INK = "#111216";
const logo = fs.readFileSync(`${ex}/logo.svg`, "utf8");
const icon = fs.readFileSync(`${ex}/icon.svg`, "utf8");
const iconBody = icon.match(/<g id="icon">[\s\S]*?<\/g>/)[0];

// Icon artwork spans x 45.75–460.03, y 104–408 inside its 512 box.
const BOX = { x: 45.75, y: 104, w: 414.28, h: 304 };
const WHITE = "#FFFFFF";
const BANDS = ["#4A74FF", "#FF5A4A", "#FFD23F"];
// Recolour the three bands: null keeps the brand colours, a hex paints all three.
const badge = (paint) => (paint ? BANDS.reduce((g, c) => g.replaceAll(`fill="${c}"`, `fill="${paint}"`), iconBody) : iconBody);

// App icon: square tile (no rounding, platforms apply their own mask) with the badge at 50 % of the width.
// Tested under square, rounded-square, circle and teardrop masks: at 50 % the badge's farthest corner sits at
// 61 % of the radius, well inside Android's adaptive safe zone (92 %), with room to breathe in every shape.
// OPTICAL shifts the badge left: the yellow tile pulls the ink centroid 2.2 % right of the geometric centre,
// so it is moved back by half of that.
const OPTICAL = ((0.515 - 0.493) / 2) * 512;
const tile = (size, { bg = INK, paint = null, fill = 0.5 } = {}) => {
  const s = (size * fill) / BOX.w, tx = (size - BOX.w * s) / 2 - BOX.x * s - OPTICAL * s, ty = (size - BOX.h * s) / 2 - BOX.y * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}"/>` +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})">${badge(paint)}</g></svg>\n`;
};
const isotype = (paint = null) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BOX.x - 4} ${BOX.y - 4} ${BOX.w + 8} ${BOX.h + 8}">${badge(paint)}</svg>\n`;
const tight = isotype();

// Variants: colour, white and black, for both the isotype and the app icon.
const ISOTYPES = { color: null, white: WHITE, black: INK };
const APPICONS = {
  color: { bg: INK },
  white: { bg: INK, paint: WHITE },
  black: { bg: WHITE, paint: INK },
};

// Site logo: the wordmark follows currentColor so header/footer can theme it.
fs.mkdirSync("src/assets/brand", { recursive: true });
fs.writeFileSync("src/assets/brand/logo-horizontal.svg", logo.replace('<g id="wordmark" fill="#F1EDE4">', '<g id="wordmark" fill="currentColor">'));
fs.writeFileSync("src/assets/brand/isotype.svg", tight);

// Public brand kit
fs.rmSync("public/brand", { recursive: true, force: true });
fs.mkdirSync("public/brand", { recursive: true });
for (const f of ["logo.svg", "logo-light.svg", "logo-mono-ink.svg", "logo-mono-bone.svg"]) fs.copyFileSync(`${ex}/${f}`, `public/brand/neostation-${f}`);
for (const [k, paint] of Object.entries(ISOTYPES)) fs.writeFileSync(`public/brand/neostation-isotype-${k}.svg`, isotype(paint));
for (const [k, opts] of Object.entries(APPICONS)) fs.writeFileSync(`public/brand/neostation-appicon-${k}.svg`, tile(512, opts));

// Favicons and touch icon
// The favicon uses the same proportions as the app icon.
fs.writeFileSync("public/favicon.svg", tile(64));
const raster = (svg, size, out) => { fs.writeFileSync("/tmp/ns-tile.svg", svg); execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), "/tmp/ns-tile.svg", "-o", out]); };
raster(tile(512), 512, "public/favicon.png");
fs.mkdirSync("public/icons", { recursive: true });
raster(tile(180), 180, "public/icons/apple-touch-icon.png");
console.log("brand assets written");

// Downloadable brand kit: SVGs, PNGs and a short usage sheet, zipped into public/brand/.
const kit = "/tmp/neostation-brand-kit";
fs.rmSync(kit, { recursive: true, force: true });
for (const d of ["svg", "png"]) fs.mkdirSync(`${kit}/${d}`, { recursive: true });
for (const f of fs.readdirSync("public/brand").filter((f) => f.endsWith(".svg"))) fs.copyFileSync(`public/brand/${f}`, `${kit}/svg/${f}`);
// PNGs are named after their SVG plus the width, and published both in the kit and in public/brand/png/.
const PNG_SIZES = {
  logo: [600, 1200, 2400],
  isotype: [256, 512, 1024],
  appicon: [256, 512, 1024],
};
fs.mkdirSync("public/brand/png", { recursive: true });
const png = (svgName, w, square) => {
  const out = `${svgName.replace(/\.svg$/, "")}-${w}.png`;
  execFileSync("rsvg-convert", ["-w", String(w), ...(square ? ["-h", String(w)] : []), `public/brand/${svgName}`, "-o", `public/brand/png/${out}`]);
  fs.copyFileSync(`public/brand/png/${out}`, `${kit}/png/${out}`);
};
for (const f of ["neostation-logo.svg", "neostation-logo-light.svg", "neostation-logo-mono-ink.svg", "neostation-logo-mono-bone.svg"]) for (const w of PNG_SIZES.logo) png(f, w);
for (const k of Object.keys(ISOTYPES)) for (const w of PNG_SIZES.isotype) png(`neostation-isotype-${k}.svg`, w);
for (const k of Object.keys(APPICONS)) for (const w of PNG_SIZES.appicon) png(`neostation-appicon-${k}.svg`, w, true);
fs.writeFileSync(`${kit}/README.txt`, `NeoStation brand kit

Logo
- neostation-logo.svg: for dark backgrounds (bone wordmark).
- neostation-logo-light.svg: for light backgrounds (ink wordmark).
- neostation-logo-mono-*.svg: one-colour versions for print or embroidery.
- neostation-isotype-{color,white,black}.svg: the badge alone.
- neostation-appicon-{color,white,black}.svg: the badge on a square tile (platforms apply their own corner mask).
- Keep clear space around the logo equal to the height of the wordmark's capital N.
- Do not recolour, reorder, stretch, rotate or outline the bands, and do not use the yellow tile alone.

Colours
- Cabinet ink   #111216  background
- Bone          #F1EDE4  text and wordmark on dark
- Start yellow  #FFD23F  brand colour
- Red           #FF5A4A  badge band
- Blue          #4A74FF  badge band
Text on any brand colour is ink (#111216).

Type
- Wordmark: Bai Jamjuree Bold Italic (SIL Open Font License).
- Interface and text: Bai Jamjuree; labels and data: JetBrains Mono.

The NeoStation name and logo identify the NeoStation project. Use them to refer to NeoStation,
not to suggest endorsement of other products.
`);
fs.rmSync("public/brand/neostation-brand-kit.zip", { force: true });
execFileSync("zip", ["-qr", `${process.cwd()}/public/brand/neostation-brand-kit.zip`, "."], { cwd: kit });
console.log("brand kit zipped");
