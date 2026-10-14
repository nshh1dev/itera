import { existsSync, writeFileSync, appendFileSync, mkdirSync, cpSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { database } from "./database.mjs";

if (!existsSync(".env")) {
  writeFileSync(".env", `DATABASE_URL="postgresql://itera:${randomBytes(24).toString("hex")}@127.0.0.1:5434/itera"\nBETTER_AUTH_SECRET="${randomBytes(48).toString("hex")}"\nBETTER_AUTH_URL="http://127.0.0.1:3000"\nPISTON_URL="http://127.0.0.1:2000"\n`, { mode: 0o600 });
  console.log("Configuración local creada; secretos excluidos de Git.");
}
process.loadEnvFile(".env");
if (!process.env.NEXT_TELEMETRY_DISABLED) {
  appendFileSync(".env", '\nNEXT_TELEMETRY_DISABLED="1"\n');
  process.env.NEXT_TELEMETRY_DISABLED = "1";
}
mkdirSync("public/monaco", { recursive: true });
cpSync("node_modules/monaco-editor/min/vs", "public/monaco/vs", { recursive: true });
console.log("Monaco copiado localmente: no usa un CDN.");

function runNode(script, args) {
  const result = spawnSync(process.execPath, [resolve(script), ...args], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
try {
  database("start");
  runNode("node_modules/prisma/build/index.js", ["generate"]);
  runNode("node_modules/prisma/build/index.js", ["migrate", "deploy"]);
  runNode("node_modules/tsx/dist/cli.mjs", ["prisma/seed.ts"]);
  console.log("\nItera está lista. Inicia la aplicación con npm run dev.");
} catch (error) {
  console.error(`\nNo se pudo completar la preparación: ${error.message}\nConsulta README.md para configurar PostgreSQL.`);
  process.exitCode = 1;
}
