import "dotenv/config";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pg from "pg";
import { createPgBackup } from "./backup-file.mjs";

const args = ["compose", "--env-file", ".local/docker.env", "-f", "compose.yaml", "-f", "compose.app.yaml"];
function docker(command, input, outputFd) {
  const win = process.platform === "win32";
  const result = spawnSync(win ? "wsl.exe" : "docker", win ? ["-d", "Ubuntu-24.04", "-u", "root", "--exec", "docker", ...args, ...command] : [...args, ...command], { input, maxBuffer: 256 * 1024 * 1024, ...(outputFd === undefined ? {} : { stdio: ["pipe", outputFd, "pipe"] }) });
  if (result.status !== 0) throw new Error(result.stderr?.toString() || result.error?.message || "Falló Docker.");
  return result.stdout;
}
function sql(query) {
  return docker(["exec", "-T", "-e", "PGOPTIONS=-c timezone=UTC", "database", "psql", "-U", "itera", "-d", "itera", "-At", "-v", "ON_ERROR_STOP=1", "-c", query]).toString().trim();
}
const action = process.argv[2];
if (!["backup", "restore", "import-local", "verify-local"].includes(action)) throw new Error("Uso: node scripts/docker-data.mjs backup|restore|import-local|verify-local [archivo.dump]");
mkdirSync(".local/backups", { recursive: true, mode: 0o700 });
const file = resolve(process.argv[3] || `.local/backups/itera-${Date.now()}.dump`);
if (action === "backup") {
  createPgBackup(file, fd => docker(["exec", "-T", "database", "pg_dump", "-U", "itera", "-d", "itera", "-Fc", "--no-owner", "--no-privileges"], undefined, fd));
  console.log(`Respaldo Docker guardado en ${file}`);
} else {
  const count = sql("SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
  if (action !== "verify-local" && count !== "0") throw new Error("La base Docker no está vacía. No se sobrescribe: restaura en un volumen nuevo.");
  let source;
  let client;
  try {
    if (action === "import-local" || action === "verify-local") {
      if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL de la instalación original.");
      const url = new URL(process.env.DATABASE_URL);
      const candidates = [process.env.PG_BIN, "D:/PostgresSQL/bin", "C:/Program Files/PostgreSQL/18/bin"].filter(Boolean);
      const bin = process.platform === "win32" ? candidates.map(p => join(p, "pg_dump.exe")).find(existsSync) : "pg_dump";
      if (!bin) throw new Error("Configura PG_BIN para encontrar pg_dump de la versión del origen o una posterior.");
      client = new pg.Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      await client.query("SET timezone='UTC'");
      const tables = (await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(r => r.tablename);
      const quote = s => '"' + s.replaceAll('"', '""') + '"';
      const query = tables.map(t => `SELECT '${t.replaceAll("'", "''")}' AS name, count(*)::text AS count, md5(coalesce(string_agg(md5(row_to_json(t)::text), '' ORDER BY md5(row_to_json(t)::text)), '')) AS hash FROM public.${quote(t)} t`).join(" UNION ALL ");
      if (!query) throw new Error("La base original no tiene tablas.");
      source = { query, rows: (await client.query(query)).rows };
      if (action === "import-local") createPgBackup(file, fd => {
        const result = spawnSync(bin, ["-Fc", "--no-owner", "--no-privileges"], { env: { ...process.env, PGHOST: url.hostname, PGPORT: url.port || "5432", PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.slice(1)) }, stdio: ["ignore", fd, "pipe"] });
        if (result.status !== 0) throw new Error("Falló el respaldo del origen.");
      });
      if (action === "import-local") console.log(`Respaldo original conservado en ${file}`);
    }
    if (action !== "verify-local") docker(["exec", "-T", "database", "pg_restore", "-U", "itera", "-d", "itera", "--no-owner", "--no-privileges", "--exit-on-error", "--single-transaction"], readFileSync(file));
    if (source) {
      const restored = JSON.parse(sql(`SELECT json_agg(r) FROM (${source.query}) r`));
      const after = (await client.query(source.query)).rows;
      if (JSON.stringify(source.rows) !== JSON.stringify(restored) || JSON.stringify(source.rows) !== JSON.stringify(after)) throw new Error("Las huellas no coinciden o cambió el origen durante la copia. Conserva el original y revisa antes de usar Docker.");
      writeFileSync(`${file}.${Date.now()}.verification.json`, JSON.stringify({ tables: restored, verified: new Date().toISOString() }, null, 2), { flag: "wx", mode: 0o600 });
      // Conservar las sesiones existentes sin cambiar .env ni revelar secretos.
      if (action === "import-local" && process.env.BETTER_AUTH_SECRET) {
        const config = readFileSync(".local/docker.env", "utf8").replace(/^DOCKER_AUTH_SECRET=.*$/m, `DOCKER_AUTH_SECRET=${process.env.BETTER_AUTH_SECRET}`);
        writeFileSync(".local/docker.env", config, { mode: 0o600 });
      }
      console.log(`Copia verificada: ${restored.length} tablas, mismos recuentos y huellas. Origen intacto.`);
    } else console.log("Respaldo restaurado en la base Docker vacía.");
  } finally { await client?.end(); }
}
