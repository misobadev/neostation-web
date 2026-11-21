// Builds the site's brand files from logos/export (the handheld isotype, "Arena 2" palette).
// Run: node logos/tools/export-handheld.mjs && node logos/tools/brand-assets.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const ex = "logos/export";
const INK = "#111216";
const WHITE = "#FFFFFF";
const logo = fs.readFileSync(`${ex}/logo.svg`, "utf8");
const icon = fs.readFileSync(`${ex}/icon.svg`, "utf8");
const iconBody = icon.match(/<g id="icon"[^>]*>[\s\S]*?<\/g>/)[0];

// Drawing box of the isotype inside its 512 box, measured by export-handheld.mjs.
const BOX = JSON.parse(fs.readFileSync(`${ex}/icon-box.json`, "utf8"));
// Colour roles: the console and its trail, and the details (screen and controls).
const COLOURS = ["#FF8A1F", "#FF5A4A", "#EBD196"];
const DETAILS = ["#3B3A36", "#C29F5E"];
// Recolour: `paint` repaints the console and trail, `detail` repaints screen and controls (null keeps brand colours).
const badge = ({ paint = null, detail = null } = {}) => {
  let g = iconBody;
  if (paint) for (const c of COLOURS) g = g.replaceAll(`fill="${c}"`, `fill="${paint}"`);
  if (detail) for (const c of DETAILS) g = g.replaceAll(`fill="${c}"`, `fill="${detail}"`);
  return g;
};

// App icon: square tile (no rounding, platforms apply their own mask) with the isotype at 50 % of the width,
// tested under square, rounded-square and circle masks. OPTICAL shifts it left: the console outweighs the trail,
// so the ink centroid sits 3.3 % right of the drawing's centre; it is moved back by half of that.
const OPTICAL = ((0.541 - 0.508) / 2) * 512;
const tile = (size, { bg = INK, fill = 0.5, ...colours } = {}) => {
  const s = (size * fill) / BOX.w, tx = (size - BOX.w * s) / 2 - BOX.x * s - OPTICAL * s, ty = (size - BOX.h * s) / 2 - BOX.y * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}"/>` +
    `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})">${badge(colours)}</g></svg>\n`;
};
const isotype = (colours = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(BOX.x - 4).toFixed(2)} ${(BOX.y - 4).toFixed(2)} ${(BOX.w + 8).toFixed(2)} ${(BOX.h + 8).toFixed(2)}">${badge(colours)}</svg>\n`;
const tight = isotype();

// Variants: colour, white and black, for both the isotype and the app icon.
const ISOTYPES = { color: {}, white: { paint: WHITE, detail: INK }, black: { paint: INK, detail: WHITE } };
const APPICONS = {
  color: { bg: INK },
  white: { bg: INK, paint: WHITE, detail: INK },
  black: { bg: WHITE, paint: INK, detail: WHITE },
};

// Site logo: the wordmark follows currentColor so header/footer can theme it.
fs.mkdirSync("src/assets/brand", { recursive: true });
fs.writeFileSync("src/assets/brand/logo-horizontal.svg", logo.replace(/(<g id="wordmark"[^>]*>\s*<path fill=")#F1EDE4/, "$1currentColor"));
fs.writeFileSync("src/assets/brand/isotype.svg", tight);

// Public brand kit
fs.rmSync("public/brand", { recursive: true, force: true });
fs.mkdirSync("public/brand", { recursive: true });
for (const f of ["logo.svg", "logo-light.svg", "logo-mono-ink.svg", "logo-mono-bone.svg"]) fs.copyFileSync(`${ex}/${f}`, `public/brand/neostation-${f}`);
for (const [k, colours] of Object.entries(ISOTYPES)) fs.writeFileSync(`public/brand/neostation-isotype-${k}.svg`, isotype(colours));
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
- neostation-isotype-{color,white,black}.svg: the handheld isotype alone.
- neostation-appicon-{color,white,black}.svg: the isotype on a square tile (platforms apply their own corner mask).
- Keep clear space around the logo equal to the height of the wordmark's capital N.
- Do not recolour, reorder, stretch or outline the console and its trail, and do not drop the trail from the logo.

Colours
- Cabinet ink   #111216  background
- Bone          #F1EDE4  text and wordmark on dark
- Sand          #EBD196  the console body
- Red           #FF5A4A  speed trail, next to the console
- Orange        #FF8A1F  speed trail, the farthest stripe
- Espresso      #3B3A36  console screen
- Toffee        #C29F5E  console controls
- Start yellow  #FFD23F  the website's main action colour
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
