import { watch } from "node:fs";
import { relative, resolve } from "node:path";
import chalk from "chalk";
import { chunkMarkdown } from "../utils";
import { addDocuments } from "../db/addData";
import { loadManifest, saveManifest } from "./manifest";

export function startWatcher(vaultDir: string, verbose: boolean = false) {
  const absDir = resolve(vaultDir);
  console.log(chalk.blue(`Watching: ${absDir}`));
  console.log(chalk.gray("Press Ctrl+C to stop.\n"));

  // Debounce map to avoid duplicate events
  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  const watcher = watch(absDir, { recursive: true }, (event, filename) => {
    if (!filename || !filename.endsWith(".md")) return;
    // Skip hidden directories
    if (filename.split("/").some((part) => part.startsWith("."))) return;

    // Debounce: wait 300ms before processing
    const existing = pending.get(filename);
    if (existing) clearTimeout(existing);

    pending.set(
      filename,
      setTimeout(async () => {
        pending.delete(filename);
        const filePath = resolve(absDir, filename);
        const relPath = relative(absDir, filePath);

        try {
          const file = Bun.file(filePath);
          if (!(await file.exists())) {
            // File was deleted
            const manifest = await loadManifest(absDir);
            delete manifest.files[relPath];
            await saveManifest(absDir, manifest);
            console.log(chalk.red(`  ✗ ${relPath} (deleted)`));
            return;
          }

          const content = await file.text();
          const chunks = chunkMarkdown(filePath, content, absDir);

          if (chunks.length > 0) {
            await addDocuments(chunks);
          }

          // Update manifest
          const manifest = await loadManifest(absDir);
          const { stat } = await import("node:fs/promises");
          const fileStat = await stat(filePath);
          const hasher = new Bun.CryptoHasher("md5");
          hasher.update(await file.arrayBuffer());

          manifest.files[relPath] = {
            mtime: fileStat.mtimeMs,
            hash: hasher.digest("hex"),
          };
          await saveManifest(absDir, manifest);

          console.log(
            chalk.green(`  ✓ ${relPath} (${chunks.length} chunks)`),
          );
          if (verbose) {
            chunks.forEach((c) =>
              console.log(chalk.gray(`      ${c.metadata?.heading || "(no heading)"}`)),
            );
          }
        } catch (err) {
          console.log(chalk.red(`  ✗ ${relPath}: ${err}`));
        }
      }, 300),
    );
  });

  // Keep process alive
  process.on("SIGINT", () => {
    watcher.close();
    console.log(chalk.gray("\nStopped watching."));
    process.exit(0);
  });
}
