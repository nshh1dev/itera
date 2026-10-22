import { spawnSync } from "node:child_process";

// Preparación explícita, nunca se ejecuta al arrancar la aplicación.
for (const args of [
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"],
  ["scripts/piston.mjs"],
]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("Borradores y runtimes preparados. Para activar una instalación nueva, ejecuta content:replace -- --apply dentro del contenedor.");
