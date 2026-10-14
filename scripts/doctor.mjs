import pg from "pg";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

console.log(`Node: ${process.version}`);
console.log(`Configuración: ${existsSync(".env") ? "disponible" : "ejecuta npm run setup"}`);
console.log(`Editor local: ${existsSync("public/monaco/vs/loader.js") ? "disponible" : "ejecuta npm run setup"}`);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000 });
try { await client.connect(); await client.query("SELECT 1"); console.log("PostgreSQL: disponible"); }
catch { console.log("PostgreSQL: no disponible; ejecuta npm run db:start"); }
finally { await client.end(); }
// El instalador de Docker Desktop puede no haber añadido el CLI al PATH de esta sesión.
const dockerBin = [
  process.env.DOCKER_BIN,
  process.platform === "win32" ? "C:/Program Files/Docker/Docker/resources/bin/docker.exe" : null,
  "docker",
].filter(Boolean);
let dockerInfo = null;
for (const command of dockerBin) {
  const attempt = spawnSync(command, ["info", "--format", "{{.ServerVersion}}"], { encoding: "utf8" });
  if (attempt.status === 0) { dockerInfo = attempt.stdout.trim(); break; }
  if (attempt.error?.code !== "ENOENT") break;
}
console.log(`Docker: ${dockerInfo ?? "no disponible (necesario para Piston)"}`);
try {
  const response = await fetch(`${process.env.PISTON_URL || "http://127.0.0.1:2000"}/api/v2/runtimes`, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error();
  const runtimes = await response.json();
  console.log("Piston:", runtimes.map((r) => `${r.language} ${r.version}`).join(", ") || "sin lenguajes; ejecuta npm run runner:setup");
} catch { console.log("Piston: no disponible. La interfaz funciona; la ejecución requiere iniciar el sandbox."); }
