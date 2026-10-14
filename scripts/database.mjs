import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

export function database(action = "start") {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const url = new URL(process.env.DATABASE_URL || "postgresql://itera:itera@127.0.0.1:5434/itera");
  const candidates = [process.env.PG_BIN, "D:/PostgresSQL/bin", "C:/Program Files/PostgreSQL/18/bin", "C:/Program Files/PostgreSQL/17/bin", "C:/Program Files/PostgreSQL/16/bin"].filter(Boolean);
  const ext = process.platform === "win32" ? ".exe" : "";
  const bin = candidates.find((p) => existsSync(join(p, `pg_ctl${ext}`)));
  const command = (name) => bin ? join(bin, name + ext) : name;
  const run = (name, args, options = {}) => {
    const result = spawnSync(command(name), args, { encoding: "utf8", ...options });
    if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout);
    return result.stdout;
  };
  const data = resolve(".local/postgres");
  if (action === "stop") {
    run("pg_ctl", ["-D", data, "stop", "-m", "fast"], { stdio: "inherit", timeout: 30000 });
    console.log("PostgreSQL de Itera detenido.");
    return;
  }
  // Solo se administra el clúster privado del proyecto, nunca un servicio existente.
  if (url.hostname !== "127.0.0.1" || url.port !== "5434") {
    console.log("DATABASE_URL personalizada: usa tu servidor PostgreSQL existente.");
    return;
  }
  mkdirSync(resolve(".local"), { recursive: true });
  if (!existsSync(join(data, "PG_VERSION"))) {
    const passwordFile = resolve(".local/pg-password.tmp");
    writeFileSync(passwordFile, decodeURIComponent(url.password), { mode: 0o600 });
    try {
      run("initdb", ["-D", data, "-U", decodeURIComponent(url.username), "--pwfile", passwordFile, "--auth=scram-sha-256", "--encoding=UTF8", "--locale=C"]);
    } finally { rmSync(passwordFile, { force: true }); }
  }
  const status = spawnSync(command("pg_ctl"), ["-D", data, "status"], { encoding: "utf8" });
  if (status.status !== 0) run("pg_ctl", ["-D", data, "-l", resolve(".local/postgres.log"), "-o", `-p ${url.port} -h 127.0.0.1 -c shared_buffers=32MB`, "-w", "-t", "15", "start"], { stdio: "inherit", timeout: 30000 });
  const env = { ...process.env, PGPASSWORD: decodeURIComponent(url.password) };
  const args = ["-h", url.hostname, "-p", url.port, "-U", decodeURIComponent(url.username)];
  const dbName = url.pathname.slice(1);
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName)) throw new Error("Nombre de base de datos inválido.");
  const present = run("psql", [...args, "-d", "postgres", "-tAc", `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`], { env });
  if (present.trim() !== "1") run("createdb", [...args, dbName], { env });
  console.log(`PostgreSQL de Itera disponible en 127.0.0.1:${url.port}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve("scripts/database.mjs")) {
  try { database(process.argv[2]); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
