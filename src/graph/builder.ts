import { basename } from "node:path";
import type { GraphNode, GraphEdge, KnowledgeGraph } from "../types";
import { walkMarkdownFiles } from "../utils";

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?\|?[^\]]*\]\]/g;
const TAG_RE = /(?:^|\s)#([a-zA-Z][\w-/]*)/g;

export function parseWikilinks(content: string): string[] {
  const links: string[] = [];
  for (const match of content.matchAll(WIKILINK_RE)) {
    const target = match[1]!.trim();
    if (target) links.push(target);
  }
  return [...new Set(links)];
}

export function parseTags(content: string): string[] {
  const tags: string[] = [];
  for (const match of content.matchAll(TAG_RE)) {
    const tag = match[1]!.trim();
    // skip markdown headings (lines starting with #)
    if (tag) tags.push(tag);
  }
  return [...new Set(tags)];
}

function noteId(name: string): string {
  return name.replace(/\.md$/, "").toLowerCase();
}

export async function buildGraph(vaultDir: string): Promise<KnowledgeGraph> {
  const files = await walkMarkdownFiles(vaultDir);
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const tagNodes = new Set<string>();

  // First pass: create nodes for all files
  for (const filePath of files) {
    const content = await Bun.file(filePath).text();
    const name = basename(filePath, ".md");
    const id = noteId(name);
    const tags = parseTags(content);
    const links = parseWikilinks(content);

    nodes.set(id, {
      id,
      label: name,
      filePath,
      tags,
      linkCount: links.length,
    });
  }

  // Second pass: build edges
  for (const filePath of files) {
    const content = await Bun.file(filePath).text();
    const sourceId = noteId(basename(filePath, ".md"));
    const links = parseWikilinks(content);
    const tags = parseTags(content);

    // Wikilink edges
    for (const link of links) {
      const targetId = noteId(link);
      // Create stub node if target doesn't exist (broken link)
      if (!nodes.has(targetId)) {
        nodes.set(targetId, {
          id: targetId,
          label: link,
          filePath: "",
          tags: [],
          linkCount: 0,
        });
      }
      edges.push({ source: sourceId, target: targetId, type: "wikilink" });
    }

    // Tag edges: notes sharing a tag are connected through a tag node
    for (const tag of tags) {
      const tagId = `tag:${tag}`;
      if (!tagNodes.has(tagId)) {
        tagNodes.add(tagId);
        nodes.set(tagId, {
          id: tagId,
          label: `#${tag}`,
          filePath: "",
          tags: [],
          linkCount: 0,
        });
      }
      edges.push({ source: sourceId, target: tagId, type: "tag" });
    }
  }

  return {
    nodes: [...nodes.values()],
    edges,
  };
}
