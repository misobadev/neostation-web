import { h as _h, type Properties } from "hastscript";
import type { Node, Paragraph as P } from "mdast";
import type { Directives } from "mdast-util-directive";
// The type augmentation for hName/hProperties lives in mdast-util-to-hast.
// Astro 7 defaults to Sätteri, so it is no longer pulled in transitively.
import type {} from "mdast-util-to-hast";

/** Checks if a node is a directive. */
export function isNodeDirective(node: Node): node is Directives {
	return (
		node.type === "containerDirective" ||
		node.type === "leafDirective" ||
		node.type === "textDirective"
	);
}

/** From Astro Starlight: Function that generates an mdast HTML tree ready for conversion to HTML by rehype. */
// biome-ignore lint/suspicious/noExplicitAny: mdast children are untyped
export function h(el: string, attrs: Properties = {}, children: any[] = []): P {
	const { properties, tagName } = _h(el, attrs);
	return {
		children,
		data: { hName: tagName, hProperties: properties },
		type: "paragraph",
	};
}
