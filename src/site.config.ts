import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Miguel Soto",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-US",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	// Used as the default description meta property and webmanifest description
	description:
		"NeoStation is a modern, user-centric frontend for retro gaming that prioritizes exceptional UX/UI design and seamless cross-platform compatibility.",
	// HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
	lang: "en-US",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_US",
	/* 
		- Used to construct the meta title property found in src/components/BaseHead.astro L:11 
		- The webmanifest name found in astro.config.ts L:42
		- The link value found in src/components/layout/Header.astro L:35
		- In the footer found in src/components/layout/Footer.astro L:12
	*/
	title: "NeoStation",
	// ! Please remember to replace the following site property with your own domain, used in astro.config.ts
	url: "https://neostation.dev/",
};

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: string }[] = [
	{
		path: "/",
		title: "Home",
	},
	{
		path: "/neostation/",
		title: "NeoStation",
	},
	{
		path: "/downloads/",
		title: "Downloads",
	},
	{
		path: "/sync/",
		title: "Sync",
	},
	{
		path: "/guide/",
		title: "Guide",
	},
	{
		path: "/theme-designer/",
		title: "Theme Designer",
	},
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		uiLineHeight: "inherit",
	},
	themeCssSelector(theme) {
		return `[data-theme="${theme.name}"]`;
	},
	// Dark-only site — only use dark themes
	themes: ["dracula"],
	useThemedScrollbars: false,
};
