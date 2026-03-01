import { Command } from "commander";
import chalk from "chalk";
import { queryData } from "../db/queryData";
import type { QueryResult } from "../types";

export function loadQueryCommand(program: Command) {
  program
    .command("query <text>")
    .description("Query the knowledge base for relevant notes")
    .option("-n, --results <number>", "Number of results to return", "5")
    .action(async (text: string, options: { results: string }) => {
      const nResults = parseInt(options.results, 10);
      console.log(chalk.blue(`Querying: "${text}"`));

      const raw = (await queryData([text], nResults)) as QueryResult;

      const docs = raw.documents?.[0];
      if (!docs?.length) {
        console.log(chalk.yellow("No results found."));
        return;
      }

      docs.forEach((doc, i) => {
        const meta = raw.metadatas?.[0]?.[i];
        const distance = raw.distances?.[0]?.[i];

        console.log(
          chalk.bold(
            `\n[${i + 1}] ${meta?.fileName ?? "Unknown"} — ${meta?.heading ?? ""}`,
          ),
        );
        if (meta?.filePath) console.log(chalk.gray(`    ${meta.filePath}`));
        if (distance != null)
          console.log(chalk.gray(`    Score: ${distance.toFixed(4)}`));

        const preview = doc ?? "";
        console.log(preview.length > 400 ? preview.slice(0, 400) + "…" : preview);
      });
    });
}
