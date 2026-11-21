// Refreshes the Theme Designer's "Start from" presets from NeoStation's
// built-in themes, so the designer always starts from what the app ships.
//
//   node scripts/theme/presets.mjs ../neostation-frontend
//
// Reads lib/themes/<id>_theme.dart in the app repo, maps each theme's colour
// constants onto the designer's 16 colours and rewrites the block between the
// `<presets>` markers in scripts/theme/source.html. Run `npm run build:theme`
// afterwards to regenerate the page.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, "source.html");
const app = process.argv[2];
if (!app) {
	console.error("Usage: node scripts/theme/presets.mjs <path to neostation-frontend>");
	process.exit(1);
}

// In the app's theme order, with the names its theme picker shows.
const THEMES = [
	["dark", "Dark"],
	["light", "Light"],
	["oled", "OLED"],
	["valentine", "Valentine"],
	["dracula", "Dracula"],
	["nord", "Nord"],
	["coffee", "Coffee"],
	["tokyo_night", "Tokyo Night"],
	["retro", "Retro"],
	["abyss", "Abyss"],
	["cyberpunk", "Cyberpunk"],
	["aqua", "Aqua"],
	["palenight", "Palenight"],
	["horizon", "Horizon"],
	["dmg", "DMG"],
	["sixteen_bit", "16 Bits"],
	["sunset", "Sunset"],
	["neon_arcade", "Neon Arcade"],
	["deep_sea", "Deep Sea"],
	["matcha", "Matcha"],
	["famicom", "Famicom"],
];

function readTheme(id) {
	const dart = readFileSync(resolve(app, "lib/themes", `${id}_theme.dart`), "utf8");
	const c = {};
	for (const m of dart.matchAll(/const Color _(\w+?)(?:Color)? = Color\(0x[0-9A-Fa-f]{2}([0-9A-Fa-f]{6})\)/g)) {
		c[m[1]] = `#${m[2].toUpperCase()}`;
	}
	const need = (k) => {
		if (!c[k]) throw new Error(`${id}: no _${k}Color`);
		return c[k];
	};
	return {
		brightness: /ColorScheme\.light\(/.test(dart) ? "light" : "dark",
		colors: {
			background: need("background"),
			surface: need("surface"),
			text: need("onSurface"),
			border: need("outline"),
			selection: need("primary"),
			onSelection: need("onPrimary"),
			selectedCard: need("secondary"),
			onSelectedCard: need("onSecondary"),
			action: c.tertiary ?? need("primary"),
			onAction: c.onTertiary ?? need("onPrimary"),
			// Options and Search use tertiaryFixed, which every theme sets to
			// its surface.
			button: need("surface"),
			onButton: need("onSurface"),
			success: need("success"),
			warning: need("warning"),
			error: need("error"),
			info: need("info"),
		},
	};
}

const lines = THEMES.map(([id, name]) => {
	const t = readTheme(id);
	return `  ${JSON.stringify(id)}:${JSON.stringify({ name, brightness: t.brightness, colors: t.colors })},`;
});

const html = readFileSync(SOURCE, "utf8");
const start = "/* <presets> */";
const end = "/* </presets> */";
const a = html.indexOf(start);
const b = html.indexOf(end);
if (a < 0 || b < a) throw new Error("presets markers not found in source.html");
const block = `${start}\nconst PRESETS = {\n${lines.join("\n")}\n};\n`;
writeFileSync(SOURCE, html.slice(0, a) + block + html.slice(b));
console.log(`Wrote ${THEMES.length} presets into ${SOURCE}`);
