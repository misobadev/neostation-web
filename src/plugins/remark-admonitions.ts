import type { Parent, PhrasingContent, Root } from "mdast";
import type { LeafDirective, TextDirective } from "mdast-util-directive";
import { directiveToMarkdown } from "mdast-util-directive";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { AdmonitionType } from "@/types";
import { h, isNodeDirective } from "../utils/remark";

const Admonitions = new Set<AdmonitionType>(["tip", "note", "important", "caution", "warning"]);

const AdmonitionIcon: Record<string, string> = {
  note: "mdi:information-outline",
  tip: "mdi:lightbulb-outline",
  important: "mdi:message-alert",
  caution: "mdi:alert-outline",
  warning: "mdi:shield-alert",
};

function isAdmonition(s: string): s is AdmonitionType {
  return Admonitions.has(s as AdmonitionType);
}

function transformUnhandledDirective(node: LeafDirective | TextDirective, index: number, parent: Parent) {
  const textNode = { type: "text", value: toMarkdown(node, { extensions: [directiveToMarkdown()] }) } as const;
  if (node.type === "textDirective") {
    parent.children[index] = textNode;
  } else {
    parent.children[index] = { children: [textNode], type: "paragraph" };
  }
}

const alertRoles: Record<string, string> = {
  note: "alert alert-info",
  tip: "alert alert-success",
  important: "alert",
  caution: "alert alert-warning",
  warning: "alert alert-error",
};

const iconColors: Record<string, string> = {
  note: "text-info",
  tip: "text-success",
  important: "text-primary",
  caution: "text-warning",
  warning: "text-error",
};

export const remarkAdmonitions: Plugin<[], Root> = () => (tree) => {
  visit(tree, (node, index, parent) => {
    if (!parent || index === undefined || !isNodeDirective(node)) return;
    if (node.type === "textDirective" || node.type === "leafDirective") {
      transformUnhandledDirective(node, index, parent);
      return;
    }

    const admonitionType = node.name;
    if (!isAdmonition(admonitionType)) return;

    let title: string = admonitionType;
    let titleNode: PhrasingContent[] = [{ type: "text", value: title }];

    const firstChild = node.children[0];
    if (firstChild?.type === "paragraph" && firstChild.data && "directiveLabel" in firstChild.data && firstChild.children.length > 0) {
      titleNode = firstChild.children;
      title = mdastToString(firstChild.children);
      node.children.splice(0, 1);
    }

    const admonition = h("div", { role: "alert", class: `${alertRoles[admonitionType]} shadow-sm not-prose my-6` }, [
      h("div", { class: "flex items-start gap-3 w-full" }, [
        h("span", { class: iconColors[admonitionType] }, [
          h("svg", { xmlns: "http://www.w3.org/2000/svg", class: "size-6 shrink-0", fill: "none", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor" }, [
            h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: admonitionType === "tip" ? "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" : admonitionType === "caution" ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" : admonitionType === "warning" ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" : admonitionType === "important" ? "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" : "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" }),
          ]),
        ]),
        h("div", { class: "flex flex-col gap-1 flex-1" }, [
          h("span", { class: "font-bold text-sm capitalize" }, titleNode),
          ...(node.children.length > 0 ? [h("div", { class: "text-sm [&>:last-child]:mb-0" }, node.children)] : []),
        ]),
      ]),
    ]);

    parent.children[index] = admonition;
  });
};
