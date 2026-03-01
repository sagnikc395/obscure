import { Command } from "commander";
export function loadCommands(program: Command) {
  program
    .command("github")
    .description("Interact with the GitHub API")
    .action(() => {
      console.log("GitHub command loaded");
    });
}

// add or push the knowledge graph to github
