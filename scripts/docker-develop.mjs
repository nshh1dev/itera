import { spawn } from "node:child_process";
import { open, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { posix } from "node:path";
import { setTimeout } from "node:timers/promises";
import { composeArgs, dockerCommand } from "./docker-command.mjs";
import { sourceChanges, sourceSnapshot } from "./docker-watch.mjs";

if (!existsSync(".local/docker.env")) throw new Error("Primero prepara Docker según docs/docker.md.");
let stopping = false;
process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

async function command(executable, args, capture = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit" });
    let output = "";
    let error = "";
    child.stdout?.on("data", data => { output += data; });
    child.stderr?.on("data", data => { error += data; });
    child.on("error", reject);
    child.on("exit", code => code === 0 ? resolve(output.trim()) : reject(new Error(error || `Falló ${executable} (${code}).`)));
  });
}
const docker = (args, capture = false) => command(...dockerCommand(args), capture);
const compose = (args, capture = false) => docker(composeArgs(args, true), capture);

// Un seguimiento por proyecto. La creación exclusiva evita dos sincronizadores.
const lockPath = ".local/docker-development.lock";
const stopPath = ".local/docker-development.stop";
const stopRequested = () => stopping || existsSync(stopPath);
let lock;
try { lock = await open(lockPath, "wx"); }
catch { throw new Error(`Ya hay un seguimiento activo o un cierre interrumpido. Cierra la otra terminal; si no existe, revisa ${lockPath} antes de retirarlo.`); }
await lock.writeFile(String(process.pid));
let logs;
try {
  let previous = await sourceSnapshot(process.cwd());
  if (stopRequested()) throw new Error("Se solicitó detener el seguimiento antes del arranque.");
  await compose(["up", "-d", "--build", "--wait"]);
  console.log("Desarrollo en http://127.0.0.1:3000. Sincronizando cada segundo; Ctrl+C detiene el seguimiento, docker-apagar apaga el entorno.");
  const [logsCommand, logsArgs] = dockerCommand(composeArgs(["logs", "--follow", "--tail", "10", "app"], true));
  logs = spawn(logsCommand, logsArgs, { stdio: ["ignore", "inherit", "inherit"] });
  logs.on("error", error => console.error(`No se pudieron seguir los registros: ${error.message}`));
  // No seguir apuntando a un contenedor de producción tras cambiar de modo.
  async function developmentContainer() {
    if (process.platform === "win32") {
      const running = (await command("wsl.exe", ["--list", "--running", "--quiet"], true)).replaceAll("\0", "");
      if (!running.includes("Ubuntu-24.04")) return false;
    }
    const current = await compose(["ps", "-q", "app"], true);
    if (!current) return false;
    const mode = await docker(["inspect", "--format", '{{index .Config.Labels "itera.mode"}}', current], true);
    if (mode !== "development") return false;
    return current;
  }
  while (!stopRequested()) {
    await setTimeout(1000);
    if (stopRequested()) break;
    const container = await developmentContainer();
    if (!container) break;
    const current = await sourceSnapshot(process.cwd());
    const changes = sourceChanges(previous, current);
    if (!changes.length) continue;
    if (changes.some(change => change.action === "rebuild")) {
      console.log("Dependencias o construcción modificadas: reconstruyendo solo la app de desarrollo…");
      await compose(["up", "-d", "--build", "--wait", "app"]);
    } else {
      for (const change of changes) {
        // Las rutas proceden exclusivamente de la lista permitida del snapshot.
        const target = `/app/${change.path}`;
        if (change.deleted) await docker(["exec", container, "rm", "-f", "--", target]);
        else {
          await docker(["exec", container, "mkdir", "-p", posix.dirname(target)]);
          await docker(["cp", change.path, `${container}:${target}`]);
        }
        console.log(`${change.deleted ? "Retirado" : "Sincronizado"}: ${change.path}`);
      }
      if (changes.some(change => change.action === "schema")) console.log("Prisma cambió: no se aplicaron migraciones ni se regeneró el cliente. Consulta docs/docker-development.md.");
      if (changes.some(change => change.action === "restart")) await compose(["restart", "app"]);
    }
    previous = current;
  }
  console.log("Seguimiento terminado. Usa docker-desarrollar para retomarlo o docker-apagar para liberar WSL.");
} finally {
  logs?.kill();
  await lock.close();
  await unlink(lockPath);
  try { await unlink(stopPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
}
