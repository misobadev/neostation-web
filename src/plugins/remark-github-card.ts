import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h, isNodeDirective } from "../utils/remark";

const DIRECTIVE_NAME = "github";

export const remarkGithubCard: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node, index, parent) => {
		if (!parent || index === undefined || !isNodeDirective(node)) return;
		if (node.type !== "leafDirective" || node.name !== DIRECTIVE_NAME) return;

		let repoName = node.attributes?.repo ?? node.attributes?.user ?? null;
		if (!repoName) return;

		repoName = repoName.endsWith("/") ? repoName.slice(0, -1) : repoName;
		repoName = repoName.startsWith("https://github.com/")
			? repoName.replace("https://github.com/", "")
			: repoName;

		const repoParts = repoName.split("/");
		const SimpleUUID = `GC-${crypto.randomUUID()}`;
		const realUrl = `https://github.com/${repoName}`;

		if (repoParts.length > 1) {
			const script = h("script", {}, [
				{
					type: "text",
					value: `
          fetch('https://api.github.com/repos/${repoName}', { referrerPolicy: "no-referrer" })
            .then(r => r.json())
            .then(d => {
              const t = document.getElementById('${SimpleUUID}');
              t.classList.remove("skeleton");
              if (d.description) t.querySelector('.gh-description').textContent = d.description.replace(/:[a-zA-Z0-9_]+:/g, '');
              else t.querySelector('.gh-description').remove();
              if (d.language) t.querySelector('.gh-language').textContent = d.language;
              t.querySelector('.gh-stars').textContent = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(d.stargazers_count).replaceAll("\\u202f", '');
              t.querySelector('.gh-forks').textContent = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(d.forks).replaceAll("\\u202f", '');
              if (d.license?.spdx_id) t.querySelector('.gh-license').textContent = d.license.spdx_id;
              else t.querySelector('.gh-license').remove();
            })
            .catch(() => document.getElementById('${SimpleUUID}')?.remove())
        `,
				},
			]);

			const card = h(
				"div",
				{ id: SimpleUUID, class: "card card-border bg-base-200 skeleton min-h-24" },
				[
					h("div", { class: "card-body" }, [
						h("div", { class: "flex items-center gap-3" }, [
							h("div", { class: "gh-avatar skeleton size-8 rounded-full shrink-0" }),
							h("a", { class: "gh-text font-bold text-sm link link-primary", href: realUrl }, [
								{ type: "text", value: `${repoParts[0]}/${repoParts[1]}` },
							]),
						]),
						h("p", { class: "gh-description text-xs text-base-content/60 mt-1" }, [
							{ type: "text", value: "Loading..." },
						]),
						h("div", { class: "flex flex-wrap gap-3 mt-2 text-xs" }, [
							h("span", { class: "gh-stars badge badge-ghost badge-sm" }, [
								{ type: "text", value: "" },
							]),
							h("span", { class: "gh-forks badge badge-ghost badge-sm" }, [
								{ type: "text", value: "" },
							]),
							h("span", { class: "gh-license badge badge-ghost badge-sm" }, [
								{ type: "text", value: "" },
							]),
							h("span", { class: "gh-language badge badge-ghost badge-sm ml-auto" }, [
								{ type: "text", value: "" },
							]),
						]),
					]),
					script,
				],
			);

			parent.children.splice(index, 1, card);
		} else if (repoParts.length === 1) {
			const script = h("script", {}, [
				{
					type: "text",
					value: `
          fetch('https://api.github.com/users/${repoName}', { referrerPolicy: "no-referrer" })
            .then(r => r.json())
            .then(d => {
              const t = document.getElementById('${SimpleUUID}');
              t.classList.remove("skeleton");
              t.querySelector('.gh-followers').textContent = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(d.followers).replaceAll("\\u202f", '');
              t.querySelector('.gh-repos').textContent = Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(d.public_repos).replaceAll("\\u202f", '');
              if (d.location) t.querySelector('.gh-location').textContent = d.location;
            })
            .catch(() => document.getElementById('${SimpleUUID}')?.remove())
        `,
				},
			]);

			const card = h(
				"div",
				{ id: SimpleUUID, class: "card card-border bg-base-200 skeleton min-h-24" },
				[
					h("div", { class: "card-body" }, [
						h("div", { class: "flex items-center gap-3" }, [
							h("div", { class: "gh-avatar skeleton size-8 rounded-full shrink-0" }),
							h("a", { class: "gh-text font-bold text-sm link link-primary", href: realUrl }, [
								{ type: "text", value: repoParts[0] },
							]),
						]),
						h("div", { class: "flex flex-wrap gap-3 mt-2 text-xs" }, [
							h("span", { class: "gh-followers badge badge-ghost badge-sm" }, [
								{ type: "text", value: "" },
							]),
							h("span", { class: "gh-repos badge badge-ghost badge-sm" }, [
								{ type: "text", value: "" },
							]),
							h("span", { class: "gh-location badge badge-ghost badge-sm ml-auto" }, [
								{ type: "text", value: "" },
							]),
						]),
					]),
					script,
				],
			);

			parent.children.splice(index, 1, card);
		}
	});
};
