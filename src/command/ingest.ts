import { Command } from "commander";
import { resolve } from "node:path";
import chalk from "chalk";
import { walkMarkdownFiles, chunkMarkdown } from "../utils";
import { addDocuments } from "../db/addData";
import { incrementalSync } from "../sync/incremental";
import { startWatcher } from "../sync/watcher";

export function loadIngestCommand(program: Command) {
  program
    .command("ingest <directory>")
    .description("Ingest markdown files from an Obsidian vault into the vector store")
    .option("-v, --verbose", "Show per-file chunk counts")
    .option("-s, --sync", "Incremental sync — only ingest new or changed files")
    .option("-w, --watch", "Watch for file changes and auto-ingest")
    .action(async (directory: string, options: { verbose?: boolean; sync?: boolean; watch?: boolean }) => {
      const absDir = resolve(directory);

      if (options.watch) {
        // Run an initial sync then start watching
        console.log(chalk.blue(`Initial sync: ${absDir}`));
        const result = await incrementalSync(absDir, options.verbose);
        console.log(
          chalk.green(`✓ Synced: ${result.added} added, ${result.updated} updated, ${result.deleted} deleted, ${result.unchanged} unchanged (${result.totalChunks} chunks)`),
        );
        startWatcher(absDir, options.verbose);
        return;
      }

      if (options.sync) {
        console.log(chalk.blue(`Incremental sync: ${absDir}`));
        const result = await incrementalSync(absDir, options.verbose);
        console.log(
          chalk.green(`✓ Synced: ${result.added} added, ${result.updated} updated, ${result.deleted} deleted, ${result.unchanged} unchanged (${result.totalChunks} chunks)`),
        );
        return;
      }

      // Full ingest (original behavior)
      console.log(chalk.blue(`Scanning: ${absDir}`));

      const files = await walkMarkdownFiles(absDir);
      console.log(chalk.gray(`Found ${files.length} markdown file(s)`));

      let totalChunks = 0;

      for (const filePath of files) {
        const content = await Bun.file(filePath).text();
        const chunks = chunkMarkdown(filePath, content, absDir);
        if (chunks.length === 0) continue;

        await addDocuments(chunks);
        totalChunks += chunks.length;

        if (options.verbose) {
          console.log(chalk.gray(`  ${filePath} → ${chunks.length} chunk(s)`));
        }
      }

      console.log(
        chalk.green(`✓ Ingested ${totalChunks} chunk(s) from ${files.length} file(s)`),
      );
    });
}
