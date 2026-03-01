import { Command } from "commander";
import { loadCommands } from "./command/github";

const program = new Command();
program
  .name("obscure")
  .description(
    "a CLI tool to interact with Obsidian and build knowledge graphs",
  )
  .version("1.0.0");

loadCommands(program);
program.parse(Bun.argv);
