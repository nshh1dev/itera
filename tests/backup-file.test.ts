import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createPgBackup } from "../scripts/backup-file.mjs";

function temporary(run: (file: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), "itera-backup-test-"));
  try { run(join(directory, "synthetic.dump")); }
  finally { rmSync(directory, { recursive: true, force: true }); }
}

test("reserva el respaldo antes del productor y conserva sus bytes", () => temporary(file => {
  const bytes = Buffer.from("PGDMP\0synthetic-test-only\xff", "latin1");
  createPgBackup(file, (fd: number) => {
    assert.equal(existsSync(file), true);
    writeFileSync(fd, bytes);
  });
  assert.deepEqual(readFileSync(file), bytes);
  if (process.platform !== "win32") assert.equal(statSync(file).mode & 0o777, 0o600);
}));

test("un archivo existente no se trunca ni se llama al productor", () => temporary(file => {
  writeFileSync(file, "previous-backup");
  assert.throws(() => createPgBackup(file, () => assert.fail("No debe ejecutarse")), { code: "EEXIST" });
  assert.equal(readFileSync(file, "utf8"), "previous-backup");
}));

test("un fallo del productor elimina solo su copia parcial y permite reintentar", () => temporary(file => {
  assert.throws(() => createPgBackup(file, (fd: number) => {
    writeFileSync(fd, "PGDMPpartial");
    throw new Error("synthetic-failure");
  }), /synthetic-failure/);
  assert.equal(existsSync(file), false);
  createPgBackup(file, (fd: number) => writeFileSync(fd, "PGDMPsynthetic-retry"));
  assert.equal(readFileSync(file, "utf8"), "PGDMPsynthetic-retry");
}));

test("rechaza salida vacía, cabecera sola y formato incorrecto", () => temporary(file => {
  for (const content of ["", "PGDMP", "not-a-dump"]) {
    assert.throws(() => createPgBackup(file, (fd: number) => writeFileSync(fd, content)), /cabecera PostgreSQL/);
    assert.equal(existsSync(file), false);
  }
}));

test("un proceso escribe directamente al descriptor sin redirección de shell", () => temporary(file => {
  createPgBackup(file, (fd: number) => {
    const result = spawnSync(process.execPath, ["-e", 'process.stdout.write(Buffer.from("PGDMPsynthetic-child"))'], { stdio: ["ignore", fd, "pipe"] });
    assert.equal(result.status, 0);
  });
  assert.equal(readFileSync(file, "utf8"), "PGDMPsynthetic-child");
}));

test("Git y Docker excluyen dumps e informes generados fuera de .local", () => {
  for (const path of [".gitignore", ".dockerignore"]) {
    const patterns = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(patterns, /\*\.dump\r?\n/);
    assert.match(patterns, /\*\.dump\.\*\.verification\.json/);
  }
});
