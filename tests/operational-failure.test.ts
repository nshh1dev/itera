import { test } from "node:test";
import assert from "node:assert/strict";
import { reportOperationalFailure, type OperationalPhase } from "../src/server/operational-failure";

test("el registro operativo solo emite evento, identificador y fase autorizados", t => {
  const calls: unknown[][] = [];
  t.mock.method(console, "error", (...args: unknown[]) => { calls.push(args); });
  reportOperationalFailure("draft.save");
  reportOperationalFailure("editorial.publish");
  assert.equal(calls.length, 2);
  const entries = calls.map(args => {
    assert.equal(args.length, 1);
    const entry = JSON.parse(args[0] as string);
    assert.deepEqual(Object.keys(entry).sort(), ["event", "id", "phase"]);
    assert.equal(entry.event, "itera.operational_failure");
    assert.match(entry.id, /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/);
    return entry;
  });
  assert.notEqual(entries[0].id, entries[1].id);
  assert.deepEqual(entries.map(entry => entry.phase), ["draft.save", "editorial.publish"]);
});

test("solo acepta referencias de intento UUID/CUID y descarta fases o contexto arbitrarios", t => {
  const lines: string[] = [];
  t.mock.method(console, "error", (line: string) => { lines.push(line); });
  for (const id of ["00000000-0000-4000-8000-000000000001", "c" + "a".repeat(24)]) {
    reportOperationalFailure("execution.case", id);
    assert.equal(JSON.parse(lines.at(-1)!).submissionId, id);
  }
  for (const invalid of ["correo@privado.test", "codigo-privado\ncaso-oculto", "postgres://secreto", "x".repeat(1000), { code: "secreto", toString() { throw new Error("no convertir"); } }]) {
    reportOperationalFailure("execution.case", invalid as string);
    assert.deepEqual(Object.keys(JSON.parse(lines.at(-1)!)).sort(), ["event", "id", "phase"]);
  }
  const count = lines.length;
  reportOperationalFailure("fase privada\ncredenciales" as OperationalPhase);
  assert.equal(lines.length, count);
  assert.equal(lines.some(line => /privado|secreto|oculto|credenciales/.test(line)), false);
});

test("un destino de registro roto no altera la operación original", t => {
  t.mock.method(console, "error", () => { throw new Error("destino no disponible"); });
  assert.doesNotThrow(() => reportOperationalFailure("execution.finalize"));
});
