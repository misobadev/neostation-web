// Downloads subset TTFs (only the letters of the name) from Google Fonts into ../fonts.
// Usage: node logos/tools/fetch-fonts.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const TXT = encodeURIComponent("NeoStationNEOSTATIneostati");
const FONTS = [
  ["saira", "Saira:ital,wght@1,800"],
  ["exo2", "Exo+2:ital,wght@1,900"],
  ["kanit", "Kanit:ital,wght@1,800"],
  ["oxanium", "Oxanium:wght@800"],
  ["bai", "Bai+Jamjuree:ital,wght@1,700"],
  ["russo", "Russo+One"],
  ["titillium", "Titillium+Web:wght@900"],
  ["chakra-upright", "Chakra+Petch:wght@700"],
];
for (const [slug, q] of FONTS) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${q}&text=${TXT}`, { headers: { "User-Agent": "curl/8" } })).text();
  const url = css.match(/https:\/\/[^)]+/)?.[0];
  if (!url) { console.log("FAIL", slug); continue; }
  fs.writeFileSync(path.join(here, "../fonts", `${slug}.ttf`), Buffer.from(await (await fetch(url)).arrayBuffer()));
  console.log("ok", slug);
}
