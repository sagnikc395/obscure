import { stat } from "node:fs/promises";
import { relative } from "node:path";
import chalk from "chalk";
import { walkMarkdownFiles, chunkMarkdown } from "../utils";
import { addDocuments } from "../db/addData";
import { loadManifest, saveManifest } from "./manifest";

interface SyncResult {
  added: number;
  updated: number;
  deleted: number;
  unchanged: number;
  totalChunks: number;
}

async function fileHash(filePath: string): Promise<string> {
  const content = await Bun.file(filePath).arrayBuffer();
  const hasher = new Bun.CryptoHasher("md5");
  hasher.update(content);
  return hasher.digest("hex");
}

export async function incrementalSync(
  vaultDir: string,
  verbose: boolean = false,
): Promise<SyncResult> {
  const manifest = await loadManifest(vaultDir);
  const files = await walkMarkdownFiles(vaultDir);

  const result: SyncResult = {
    added: 0,
    updated: 0,
    deleted: 0,
    unchanged: 0,
    totalChunks: 0,
  };

  const currentFiles = new Set<string>();

  for (const filePath of files) {
    const relPath = relative(vaultDir, filePath);
    currentFiles.add(relPath);

    const fileStat = await stat(filePath);
    const mtime = fileStat.mtimeMs;
    const prev = manifest.files[relPath];

    // Skip if mtime hasn't changed
    if (prev && prev.mtime === mtime) {
      result.unchanged++;
      continue;
    }

    // Check hash to avoid re-ingesting if content is the same
    const hash = await fileHash(filePath);
    if (prev && prev.hash === hash) {
      // Update mtime but skip ingestion
      manifest.files[relPath] = { mtime, hash };
      result.unchanged++;
      continue;
    }

    // Ingest the file
    const content = await Bun.file(filePath).text();
    const chunks = chunkMarkdown(filePath, content, vaultDir);
    if (chunks.length > 0) {
      await addDocuments(chunks);
      result.totalChunks += chunks.length;
    }

    if (prev) {
      result.updated++;
      if (verbose) console.log(chalk.yellow(`  ↻ ${relPath} (${chunks.length} chunks)`));
    } else {
      result.added++;
      if (verbose) console.log(chalk.green(`  + ${relPath} (${chunks.length} chunks)`));
    }

    manifest.files[relPath] = { mtime, hash };
  }

  // Detect deleted files
  for (const relPath of Object.keys(manifest.files)) {
    if (!currentFiles.has(relPath)) {
      delete manifest.files[relPath];
      result.deleted++;
      if (verbose) console.log(chalk.red(`  - ${relPath} (deleted)`));
    }
  }

  await saveManifest(vaultDir, manifest);
  return result;
}
