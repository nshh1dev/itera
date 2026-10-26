import { spawnSync } from "node:child_process";

function run(args) {
  return spawnSync(process.execPath, args, { stdio: "inherit" }).status ?? 1;
}
// Publica PostgreSQL solo durante los recorridos que necesitan comprobar datos.
try {
  const ready = run(["scripts/docker.mjs", "-f", "docker/compose.verify.yaml", "up", "-d", "--wait", "database"]);
  if (ready !== 0) process.exitCode = ready;
  else process.exitCode = run(["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.docker.config.ts", ...process.argv.slice(2)]);
} finally {
  const closed = run(["scripts/docker.mjs", "up", "-d", "--wait", "database"]);
  if (closed !== 0) process.exitCode = closed;
}
