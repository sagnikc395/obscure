import { Command } from "commander";
import { loadCommands } from "./command/github";
import { loadIngestCommand } from "./command/ingest";
import { loadQueryCommand } from "./command/query";
import { loadGraphCommand } from "./command/graph";

const program = new Command();
program
  .name("obscure")
  .description(
    "a CLI tool to interact with Obsidian and build knowledge graphs",
  )
  .version("1.0.0");

loadCommands(program);
loadIngestCommand(program);
loadQueryCommand(program);
loadGraphCommand(program);
program.parse(Bun.argv);
