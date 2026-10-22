import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { composeArgs, dockerCommand } from "./docker-command.mjs";

if (!existsSync(".local/docker.env")) {
  console.error("Falta .local/docker.env. Ejecuta npm run docker:configure.");
  process.exit(1);
}
const input = process.argv.slice(2);
const development = input[0] === "--dev";
if (development) input.shift();
const [command, args] = dockerCommand(composeArgs(input, development));
// Windows no ejecuta lanzadores .cmd mediante spawn sin shell. WSL conserva
// el directorio de trabajo y evita interpolar argumentos en un shell.
const result = spawnSync(command, args, { stdio: "inherit" });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
