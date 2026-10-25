// Operación explícita contra PostgreSQL real: conserva el dump y elimina solo
// la base temporal creada por esta prueba. No inicia servicios ni migra el origen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { composeArgs, dockerCommand } from "../scripts/docker-command.mjs";

function docker(args: string[], input?: Buffer) {
  const [command, parameters] = dockerCommand(composeArgs(["exec", "-T", "-e", "PGOPTIONS=-c timezone=UTC", "database", ...args]));
  assert.ok(typeof command === "string" && Array.isArray(parameters));
  const result = spawnSync(command, parameters, { input, maxBuffer: 256 * 1024 * 1024, timeout: 120000 });
  if (result.status !== 0) throw new Error("Falló la operación PostgreSQL/Docker; no se vuelcan datos ni credenciales en el resultado de la prueba.");
  return result.stdout.toString("utf8").trim();
}

const sql = (database: string, query: string) => docker(["psql", "-U", "itera", "-d", database, "-At", "-v", "ON_ERROR_STOP=1", "-c", query]);
const quote = (name: string) => '"' + name.replaceAll('"', '""') + '"';

function fingerprint(database: string) {
  const tables: string[] = JSON.parse(sql(database, "SELECT coalesce(json_agg(tablename ORDER BY tablename), '[]'::json) FROM pg_tables WHERE schemaname='public'"));
  assert.ok(tables.length > 0, "No hay tablas públicas que verificar.");
  const query = tables.map((name, index) => `SELECT ${index} AS ordinal, count(*)::text AS count, md5(coalesce(string_agg(md5(row_to_json(t)::text), '' ORDER BY md5(row_to_json(t)::text)), '')) AS hash FROM public.${quote(name)} t`).join(" UNION ALL ");
  return { tables, rows: JSON.parse(sql(database, `SELECT json_agg(r ORDER BY ordinal) FROM (${query}) r`)) };
}

test("el respaldo real se restaura en una base temporal con los mismos recuentos y huellas", {
  skip: process.env.ITERA_BACKUP_RESTORE === "1" ? false : "Requiere autorización, Docker preparado e ITERA_BACKUP_RESTORE=1; consulta docs/docker.md",
  timeout: 300000,
}, () => {
  const suffix = randomUUID().replaceAll("-", "");
  const temporaryDatabase = `itera_restore_check_${suffix}`;
  const file = resolve(`.local/backups/restore-check-${Date.now()}-${suffix}.dump`);
  const before = fingerprint("itera");
  const backup = spawnSync(process.execPath, ["scripts/docker-data.mjs", "backup", file], { timeout: 120000, maxBuffer: 1024 * 1024 });
  assert.equal(backup.status, 0, "No se pudo crear el respaldo real; no se intenta restaurar.");
  console.log(`Respaldo conservado en ${file}`);
  const archive = readFileSync(file);
  // pg_restore analiza el índice, además del control básico de cabecera del exportador.
  docker(["pg_restore", "--list"], archive);
  let created = false;
  try {
    docker(["createdb", "-U", "itera", "--template=template0", temporaryDatabase]);
    created = true;
    docker(["pg_restore", "-U", "itera", "-d", temporaryDatabase, "--no-owner", "--no-privileges", "--exit-on-error", "--single-transaction"], archive);
    const restored = fingerprint(temporaryDatabase);
    const after = fingerprint("itera");
    // No usar deepEqual: un fallo no debe imprimir las huellas ni datos del catálogo.
    assert.equal(JSON.stringify(restored) === JSON.stringify(before), true, "La copia restaurada difiere del origen previo.");
    assert.equal(JSON.stringify(after) === JSON.stringify(before), true, "El origen cambió durante la comprobación.");
    console.log(`Restauración verificada: ${before.tables.length} tablas públicas; origen sin cambios de recuentos/huellas.`);
  } finally {
    if (created) {
      assert.match(temporaryDatabase, /^itera_restore_check_[a-f0-9]{32}$/);
      docker(["dropdb", "-U", "itera", temporaryDatabase]);
      console.log("Base temporal eliminada; se conserva el respaldo.");
    }
  }
});
