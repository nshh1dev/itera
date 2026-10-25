import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStoredDraft, prepareDraftRecovery, uniqueDraftCopies } from "../src/lib/draft-recovery";

test("lee los borradores anteriores sin inventar una base de sincronización", () => {
  const local = parseStoredDraft(JSON.stringify({ code: "pendiente", revision: 2 }));
  assert.equal(local?.code, "pendiente");
  assert.equal(local?.baseCode, undefined);
  assert.equal(prepareDraftRecovery({ code: "servidor", revision: 2 }, local).pending, true);
});

test("una copia distinta requiere elección explícita, aunque su revisión sea menor, igual o mayor", () => {
  for (const revision of [0, 1, 3, 10]) {
    const remote = { code: "remoto", revision: 3 };
    const local = { code: "local", revision };
    const result = prepareDraftRecovery(remote, local);
    assert.equal(result.pending, true);
    assert.equal(result.code, "remoto");
    assert.deepEqual(result.copies.map(copy => copy.code), ["remoto", "local"]);
  }
});

test("solo retoma automáticamente una edición cuya base y revisión remotas siguen intactas", () => {
  const local = { code: "edición pendiente", revision: 3, baseCode: "base" };
  assert.equal(prepareDraftRecovery({ code: "base", revision: 3 }, local).code, local.code);
  assert.equal(prepareDraftRecovery({ code: "base", revision: 3 }, local).pending, false);
  assert.equal(prepareDraftRecovery({ code: "base", revision: 4 }, local).pending, true);
  assert.equal(prepareDraftRecovery({ code: "base nueva", revision: 3 }, local).pending, true);
});

test("código idéntico no crea un conflicto por una revisión local antigua", () => {
  const result = prepareDraftRecovery({ code: "igual", revision: 5 }, { code: "igual", revision: 1 });
  assert.equal(result.pending, false);
  assert.equal(result.code, "igual");
});

test("las copias vacías se conservan y se pueden recuperar", () => {
  const result = prepareDraftRecovery({ code: "remoto", revision: 5 }, { code: "", revision: 1 });
  assert.equal(result.pending, true);
  assert.equal(result.copies[1].code, "");
});

test("un invitado retoma su copia sin tratar la plantilla como borrador remoto", () => {
  const result = prepareDraftRecovery({ code: "plantilla", revision: 0 }, { code: "local", revision: 0 }, null, false);
  assert.equal(result.pending, false);
  assert.equal(result.code, "local");
});

test("la transferencia de invitado conserva el código sin pisar otra copia local o remota", () => {
  const empty = { code: "plantilla", revision: 0 };
  const first = prepareDraftRecovery(empty, null, "invitado");
  assert.equal(first.code, "invitado");
  assert.equal(first.pending, false);
  for (const result of [
    prepareDraftRecovery(empty, { code: "otra local", revision: 0 }, "invitado"),
    prepareDraftRecovery({ code: "remoto", revision: 2 }, null, "invitado"),
  ]) {
    assert.equal(result.pending, true);
    assert.ok(result.copies.some(copy => copy.code === "invitado"));
  }
});

test("recuperar o editar no elimina las alternativas históricas", () => {
  const copies = [{ code: "antigua", revision: 1, source: "local" as const }];
  const local = parseStoredDraft(JSON.stringify({ code: "elegida", revision: 4, baseCode: "remoto", copies }));
  assert.deepEqual(prepareDraftRecovery({ code: "elegida", revision: 4 }, local).copies, copies);
  assert.deepEqual(uniqueDraftCopies([...copies, ...copies, { code: "otra", revision: 9, source: "remote" }]).map(copy => copy.code), ["antigua", "otra"]);
});

test("ignora datos dañados, revisiones inválidas y copias excesivas sin ejecutar su contenido", () => {
  for (const input of [null, "{", "null", "[]", '{"code":123,"revision":1}', '{"code":"x","revision":-1}', '{"code":"x","revision":1.5}', JSON.stringify({ code: "x".repeat(30001), revision: 1 })]) assert.equal(parseStoredDraft(input), null);
  const valid = { code: "segura", revision: 1, copies: [{ code: "otra", revision: 1, source: "remote" }, { code: "no válida", revision: 1, source: "externa" }, null] };
  assert.equal(parseStoredDraft(JSON.stringify(valid))?.copies?.length, 1);
});
