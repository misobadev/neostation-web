// Generates the Theme Designer page from the single-file tool, in the repo's
// conventional shape:
//   - src/styles/components/theme-designer.css  (scoped CSS, like admonition.css)
//   - src/pages/theme-designer.astro                     (markup + behaviour)
//
// Source of truth is scripts/theme/source.html (the standalone tool). Re-run
// `npm run build:theme` after updating it. The tool's CSS/DOM are scoped under
// `.tb` so they can't leak into the rest of the site, and its three fonts are
// remapped onto the repo's self-hosted families (Sora + JetBrains Mono load
// globally via global.css; Anta is imported by the generated page).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "source.html");
const OUT_PAGE = resolve(here, "../../src/pages/theme-designer.astro");
const OUT_CSS = resolve(here, "../../src/styles/components/theme-designer.css");

const html = readFileSync(SRC, "utf8");

// The tool splits inlined art-URL vars and the UI stylesheet into separate
// <style> blocks — concatenate ALL of them, not just the first.
let css = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
const body = html.match(/<body>([\s\S]*?)<script>/)[1];
const script = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];

css = css.replace(/\/\*[\s\S]*?\*\//g, ""); // strip comments (commas inside them break the prefixer)
css = css.replace(/:root\{/g, ".tb{"); // both the art-var block and the token block
css = css.replace(/\n\s*body\{/g, "\n.tb{");
css = css.replace(/\n\s*html\{[^}]*\}/g, "");
css = css.replace(/\n\s*\*\{box-sizing:border-box\}/g, "\n.tb *{box-sizing:border-box}");

// Remap the tool's font families onto the repo's self-hosted fonts.
// Sora + JetBrains Mono load site-wide (global.css) as *Variable* families;
// Anta is added as a dependency and imported by the generated page.
css = css.replace(/'Sora'/g, "'Sora Variable'");
css = css.replace(/'JetBrains Mono'/g, "'JetBrains Mono Variable'");

function prefixSelector(sel) {
	return sel
		.split(",")
		.map((s) => {
			const t = s.trim();
			if (!t) return s;
			if (t.startsWith(".tb")) return t;
			if (t === "*") return ".tb *";
			return `.tb ${t}`;
		})
		.join(", ");
}

let out2 = "";
let i = 0;
const n = css.length;
let atKeyframes = 0;
let depth = 0;
let buf = "";
while (i < n) {
	const c = css[i];
	if (c === "{") {
		const sel = buf.trim();
		buf = "";
		if (sel.startsWith("@keyframes")) {
			atKeyframes = depth + 1;
			out2 += `${sel}{`;
			depth++;
			i++;
			continue;
		}
		if (sel.startsWith("@")) {
			out2 += `${sel}{`;
			depth++;
			i++;
			continue;
		}
		out2 += `${atKeyframes && depth >= atKeyframes ? sel : prefixSelector(sel)}{`;
		depth++;
		i++;
		continue;
	}
	if (c === "}") {
		out2 += `${buf}}`;
		buf = "";
		depth--;
		if (atKeyframes && depth < atKeyframes) atKeyframes = 0;
		i++;
		continue;
	}
	buf += c;
	i++;
}
css = out2;

const cssFile = `/* Theme Designer — GENERATED from scripts/theme/source.html by scripts/theme/build.mjs.
   Do not edit by hand — edit source.html and run \`npm run build:theme\`.
   Every rule is scoped under .tb so it cannot leak into the rest of the site. */
${css.trim()}
`;

const page = `---
// NeoStation Theme Designer — route: /theme-designer/.
// GENERATED from scripts/theme/source.html by scripts/theme/build.mjs.
// Do not edit by hand — edit source.html and run \`npm run build:theme\`.
import Base from "@/layouts/Base.astro";
import "@fontsource/anta";
// Page-scoped styles (137 KB, mostly inlined art) — imported here rather than
// in global.css so only /theme-designer/ pays for them.
import "@/styles/components/theme-designer.css";
import type { SiteMeta } from "@/types";

const meta: SiteMeta = {
  title: "Theme Designer - NeoStation",
  description:
    "Design a NeoStation theme with a live preview of the System Browser and Game Detail screens, then export it as theme JSON built on daisyUI tokens and share it in our Discord.",
};
---

<Base meta={meta}>
  <div class="relative py-12 md:py-20">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Hero -->
      <div class="text-center">
        <h1
          class="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
        >
          Theme <span class="text-primary">Designer</span>
        </h1>
        <div class="max-w-3xl mx-auto">
          <p class="text-lg md:text-xl text-base-content/60 leading-relaxed">
            Design your own NeoStation theme with a live preview of the System
            Browser and Game Detail screens, then export it as theme JSON built
            on daisyUI colour and radius tokens. Share your themes with the
            community in our
            <a
              href="https://discord.gg/xE2kgKsRVq"
              target="_blank"
              rel="noopener"
              class="text-primary hover:underline">Discord server</a>.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="tb">
${body
	.trimEnd()
	.split("\n")
	.map((l) => `    ${l}`)
	.join("\n")}
  </div>
</Base>

<script is:inline>
${script.trim()}
</script>
`;

writeFileSync(OUT_CSS, cssFile);
writeFileSync(OUT_PAGE, page);
console.log(`Wrote:\n  ${OUT_CSS}\n  ${OUT_PAGE}`);
