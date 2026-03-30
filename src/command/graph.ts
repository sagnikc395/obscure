import { Command } from "commander";
import { resolve } from "node:path";
import chalk from "chalk";
import { buildGraph } from "../graph/builder";
import type { KnowledgeGraph } from "../types";

function printStats(graph: KnowledgeGraph) {
  const noteNodes = graph.nodes.filter((n) => !n.id.startsWith("tag:"));
  const tagNodes = graph.nodes.filter((n) => n.id.startsWith("tag:"));
  const wikilinkEdges = graph.edges.filter((e) => e.type === "wikilink");
  const tagEdges = graph.edges.filter((e) => e.type === "tag");

  console.log(chalk.bold("\nKnowledge Graph Stats"));
  console.log(chalk.gray("─".repeat(40)));
  console.log(`  Notes:       ${chalk.cyan(noteNodes.length)}`);
  console.log(`  Tags:        ${chalk.magenta(tagNodes.length)}`);
  console.log(`  Wikilinks:   ${chalk.yellow(wikilinkEdges.length)}`);
  console.log(`  Tag edges:   ${chalk.yellow(tagEdges.length)}`);
}

function printNeighbors(graph: KnowledgeGraph, nodeId: string) {
  const node = graph.nodes.find(
    (n) => n.id === nodeId || n.label.toLowerCase() === nodeId.toLowerCase(),
  );
  if (!node) {
    console.log(chalk.red(`Node "${nodeId}" not found.`));
    return;
  }

  const outgoing = graph.edges.filter((e) => e.source === node.id);
  const incoming = graph.edges.filter((e) => e.target === node.id);

  console.log(chalk.bold(`\n${node.label}`));
  if (node.tags.length) {
    console.log(chalk.magenta(`  Tags: ${node.tags.map((t) => `#${t}`).join(" ")}`));
  }

  if (outgoing.length) {
    console.log(chalk.gray("\n  Links to:"));
    for (const edge of outgoing) {
      const target = graph.nodes.find((n) => n.id === edge.target);
      const icon = edge.type === "tag" ? "🏷" : "→";
      console.log(`    ${icon} ${target?.label ?? edge.target}`);
    }
  }

  if (incoming.length) {
    console.log(chalk.gray("\n  Linked from:"));
    for (const edge of incoming) {
      const source = graph.nodes.find((n) => n.id === edge.source);
      const icon = edge.type === "tag" ? "🏷" : "←";
      console.log(`    ${icon} ${source?.label ?? edge.source}`);
    }
  }
}

export function loadGraphCommand(program: Command) {
  const graph = program
    .command("graph <directory>")
    .description("Build and explore the knowledge graph from an Obsidian vault");

  graph
    .command("stats")
    .description("Show knowledge graph statistics")
    .argument("<directory>", "Path to Obsidian vault")
    .action(async (directory: string) => {
      const absDir = resolve(directory);
      console.log(chalk.blue(`Building graph from: ${absDir}`));
      const kg = await buildGraph(absDir);
      printStats(kg);
    });

  graph
    .command("neighbors")
    .description("Show connections for a specific note")
    .argument("<directory>", "Path to Obsidian vault")
    .argument("<note>", "Note name to inspect")
    .action(async (directory: string, note: string) => {
      const absDir = resolve(directory);
      const kg = await buildGraph(absDir);
      printNeighbors(kg, note);
    });

}
