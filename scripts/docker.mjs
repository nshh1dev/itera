import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!existsSync(".local/docker.env")) {
  console.error("Falta .local/docker.env. Ejecuta npm run docker:configure.");
  process.exit(1);
}
const args = ["compose", "--env-file", ".local/docker.env", "-f", "compose.yaml", "-f", "compose.app.yaml", ...process.argv.slice(2)];
// Windows no ejecuta lanzadores .cmd mediante spawn sin shell. WSL conserva
// el directorio de trabajo y evita interpolar argumentos en un shell.
const result = process.platform === "win32"
  ? spawnSync("wsl.exe", ["-d", "Ubuntu-24.04", "-u", "root", "--exec", "docker", ...args], { stdio: "inherit" })
  : spawnSync("docker", args, { stdio: "inherit" });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
