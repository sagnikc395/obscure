import { Command } from "commander";
import { resolve } from "node:path";
import chalk from "chalk";
import { walkMarkdownFiles, chunkMarkdown } from "../utils";
import { addDocuments } from "../db/addData";

export function loadIngestCommand(program: Command) {
  program
    .command("ingest <directory>")
    .description("Ingest markdown files from an Obsidian vault into the vector store")
    .option("-v, --verbose", "Show per-file chunk counts")
    .action(async (directory: string, options: { verbose?: boolean }) => {
      const absDir = resolve(directory);
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
