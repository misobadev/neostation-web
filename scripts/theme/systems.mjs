// Refreshes the system names the Theme Designer shows (chips, pills) from
// the NeoAssets catalog.
//
//   node scripts/theme/systems.mjs
//
// The API sends no CORS headers, so the page can't ask it from the browser:
// the names it needs are baked into scripts/theme/source.html between the
// `<systems>` markers. Run `npm run build:theme` afterwards.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, "source.html");
const API = "https://api.neoassets.dev/api/v1/systems";

// The systems the preview shows.
const IDS = [
	"neogeo", "lynx", "gg", "sms", "pccd", "tgcd", "gb", "tg16", "snes", "sfc", "scd", "cps2", "jag",
	"arcade", "a2", "2600", "cv", "vect", "msx", "nes", "sg1k", "fc", "cpc", "mark3", "android",
];

const res = await fetch(API);
if (!res.ok) throw new Error(`${API}: HTTP ${res.status}`);
const all = await res.json();
const byId = new Map(all.map((s) => [s.id, s]));
const lines = IDS.map((id) => {
	const s = byId.get(id);
	if (!s) throw new Error(`${id} is not in the NeoAssets catalog`);
	return `  ${JSON.stringify(id)}:${JSON.stringify({ name: s.name, short: s.short_name })},`;
});

const html = readFileSync(SOURCE, "utf8");
const start = "/* <systems> */";
const end = "/* </systems> */";
const a = html.indexOf(start);
const b = html.indexOf(end);
if (a < 0 || b < a) throw new Error("systems markers not found in source.html");
const block = `${start}\nconst SYSTEMS = {\n${lines.join("\n")}\n};\n`;
writeFileSync(SOURCE, html.slice(0, a) + block + html.slice(b));
console.log(`Wrote ${IDS.length} systems into ${SOURCE}`);
