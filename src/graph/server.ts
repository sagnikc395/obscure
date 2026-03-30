import chalk from "chalk";
import type { KnowledgeGraph } from "../types";
import graphHtml from "./graph.html";

export async function startGraphServer(graph: KnowledgeGraph, port: number) {
  Bun.serve({
    port,
    routes: {
      "/": graphHtml,
      "/api/graph": {
        GET: () => {
          return new Response(JSON.stringify(graph), {
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    },
    development: {
      hmr: true,
      console: true,
    },
  });

  console.log(
    chalk.green(`\nGraph visualization running at http://localhost:${port}`),
  );
  console.log(chalk.gray("Press Ctrl+C to stop.\n"));
}
