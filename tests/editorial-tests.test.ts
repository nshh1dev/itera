import { test } from "node:test";
import assert from "node:assert/strict";
import { editorialTestsIssue } from "../src/lib/editorial-tests";
import { exercises } from "../prisma/content";
import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent } from "../prisma/editorial-revision";
import { editorialSchema } from "../src/lib/editorial";
import type { Json } from "../src/lib/types";

const cases = [1, 2, 3].map((input, index) => ({ input, expected: input, visible: index === 0 }));
test("los catálogos nuevo e histórico conservan entradas diversas o su excepción de salida fija", () => {
  for (const entry of [...exercises, ...logicExercises]) {
    const version = seedVersionContent(entry);
    for (const variant of version.variants) assert.equal(editorialTestsIssue(variant.tests.map(test => ({ ...test, input: test.input as Json, expected: test.expected as Json })), version.runtimeMode), null, `${entry.slug}: ${variant.language}`);
  }
});
test("repetir un caso no basta para cumplir el mínimo de tres entradas distintas", () => {
  assert.match(editorialTestsIssue([cases[0], cases[0], { ...cases[0], visible: false }], "FUNCTION")!, /tres entradas distintas/);
  assert.match(editorialTestsIssue([cases[0], cases[1], cases[1]], "FUNCTION")!, /tres entradas distintas/);
  assert.equal(editorialTestsIssue(cases, "FUNCTION"), null);
});
test("el guardado y la preparación del catálogo usan la misma validación de pruebas", () => {
  const entry = logicExercises.find(entry => entry.runtimeMode !== "PROGRAM")!;
  const version = seedVersionContent(entry);
  const variants = Object.fromEntries(version.variants.map(variant => [variant.language, variant]));
  const base = { ...entry, ...version, ...variants, tests: version.variants[0].tests };
  assert.equal(editorialSchema.safeParse(base).success, true);
  for (const tests of [[cases[0], cases[0], { ...cases[0], visible: false }], [...cases, { ...cases[0], expected: 9 }]]) {
    const parsed = editorialSchema.safeParse({ ...base, tests });
    assert.equal(parsed.success, false);
    if (!parsed.success) assert.ok(parsed.error.issues.some(issue => issue.path[0] === "tests" && issue.message === editorialTestsIssue(tests, "FUNCTION")));
  }
});
test("entradas JSON equivalentes no se distinguen por orden de propiedades", () => {
  const a = { input: { a: 1, b: { c: 2, d: 3 } }, expected: 4, visible: true };
  const b = { input: { b: { d: 3, c: 2 }, a: 1 }, expected: 4, visible: false };
  assert.match(editorialTestsIssue([a, b, b], "FUNCTION")!, /tres entradas distintas/);
  assert.match(editorialTestsIssue([a, { ...b, expected: 5 }, cases[2]], "FUNCTION")!, /contradictorios/);
});
test("no confunde tipos ni orden de arreglos; los resultados JSON también se comparan por estructura", () => {
  assert.equal(editorialTestsIssue([{ input: 1, expected: 0, visible: true }, { input: "1", expected: 0, visible: false }, { input: [1], expected: 0, visible: false }], "FUNCTION"), null);
  assert.equal(editorialTestsIssue([{ input: [1, 2], expected: 0, visible: true }, { input: [2, 1], expected: 0, visible: false }, cases[2]], "FUNCTION"), null);
  assert.equal(editorialTestsIssue([...cases, { input: 1, expected: 1, visible: false }], "FUNCTION"), null);
  assert.equal(editorialTestsIssue([{ input: 1, expected: { a: 1, b: 2 }, visible: true }, { input: 1, expected: { b: 2, a: 1 }, visible: false }, cases[1], cases[2]], "FUNCTION"), null);
});
test("la salida fija permite casos históricos repetidos pero no resultados contradictorios", () => {
  const fixed = { input: "", expected: "Hola\n", visible: true };
  assert.equal(editorialTestsIssue([fixed], "PROGRAM"), null);
  assert.equal(editorialTestsIssue([fixed, { ...fixed, visible: false }], "PROGRAM"), null);
  assert.equal(editorialTestsIssue([fixed, { ...fixed, expected: "Hola \r\n\r\n" }], "PROGRAM"), null);
  assert.match(editorialTestsIssue([fixed, { ...fixed, expected: "Adiós\n" }], "PROGRAM")!, /contradictorios/);
  assert.match(editorialTestsIssue([fixed], "FUNCTION")!, /tres entradas distintas/);
});
test("conserva requisitos de ejemplo visible, prueba oculta, texto PROGRAM y cantidad acotada", () => {
  assert.match(editorialTestsIssue(cases.map(entry => ({ ...entry, visible: false })), "FUNCTION")!, /ejemplo visible/);
  assert.match(editorialTestsIssue(cases.map(entry => ({ ...entry, visible: true })), "FUNCTION")!, /oculta/);
  assert.match(editorialTestsIssue(cases, "PROGRAM")!, /texto/);
  for (const entries of [[], Array(11).fill(cases[0])]) assert.match(editorialTestsIssue(entries, "FUNCTION")!, /una y diez/);
});
