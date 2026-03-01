import { join, relative, basename } from "node:path";
import { readdir } from "node:fs/promises";
import type { DocumentChunk, MarkdownChunkMetadata } from "./types";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stripFrontmatter(content: string): string {
  if (content.startsWith("---")) {
    const end = content.indexOf("---", 3);
    if (end !== -1) return content.slice(end + 3).trimStart();
  }
  return content;
}

export async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: false });
  return (entries as string[])
    .filter(
      (f) =>
        f.endsWith(".md") &&
        !f.split("/").some((part) => part.startsWith(".")),
    )
    .map((f) => join(dir, f));
}

export function chunkMarkdown(
  filePath: string,
  content: string,
  basePath: string,
): DocumentChunk[] {
  const relativePath = relative(basePath, filePath);
  const fileName = basename(filePath);
  const body = stripFrontmatter(content);

  // Split on H1–H3 headings, keeping the delimiter
  const parts = body.split(/^(#{1,3} .+)$/m);

  const chunks: DocumentChunk[] = [];
  let currentHeading = "";
  let buffer = "";
  let idx = 0;

  function flush() {
    const text = buffer.trim();
    if (!text) return;
    const meta: MarkdownChunkMetadata = {
      filePath: relativePath,
      fileName,
      heading: currentHeading,
      chunkIndex: String(idx),
    };
    chunks.push({
      id: `${slugify(relativePath)}-${idx}`,
      content: currentHeading ? `${currentHeading}\n\n${text}` : text,
      metadata: meta,
    });
    idx++;
    buffer = "";
  }

  for (const part of parts) {
    if (/^#{1,3} .+/.test(part)) {
      flush();
      currentHeading = part.trim();
    } else {
      buffer += part;
    }
  }
  flush();

  return chunks;
}
