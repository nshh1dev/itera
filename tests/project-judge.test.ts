import test from "node:test";
import assert from "node:assert/strict";
import { judgeOwnTests, judgeProject } from "../src/server/execution/judge";

const marker = (value: unknown) => `__ITERA_PROJECT__${JSON.stringify(value)}\n`;

test("FUNCTION compara el valor y los archivos reales generados fuera del sandbox", () => {
  const expectedFiles = [{ path: "result.json", content: "{\"ok\":true}" }];
  const result = judgeProject({ stdout: marker({ kind: "function", value: 7, files: expectedFiles }), stderr: "", code: 0 }, { input: 3, expected: 7, expectedFiles, visible: true, order: 0 }, "FUNCTION");
  assert.equal(result.passed, true);
  assert.deepEqual(result.actualFiles, expectedFiles);
});

test("FUNCTION con persistencia compara explícitamente el resultado del segundo proceso", () => {
  const output = { stdout: marker({ kind: "function", value: { guardado: true }, persistence: { registros: 2 }, files: [{ path: "store.json", content: "{\"registros\":2}" }] }), stderr: "", code: 0 };
  const expected = { input: [1, 2], expected: { guardado: true }, expectedPersistence: { registros: 2 }, expectedFiles: [{ path: "store.json", content: "{\"registros\":2}" }], visible: true, order: 0 };
  assert.equal(judgeProject(output, expected, "FUNCTION").passed, true);
  const mismatch = judgeProject({ ...output, stdout: marker({ kind: "function", value: { guardado: true }, persistence: { registros: 1 }, files: expected.expectedFiles }) }, expected, "FUNCTION");
  assert.equal(mismatch.status, "wrong");
  assert.match(mismatch.error ?? "", /segundo proceso/);
  const hidden = judgeProject({ ...output, stdout: marker({ kind: "function", value: { guardado: true }, persistence: { privado: true }, files: [] }) }, { ...expected, visible: false }, "FUNCTION");
  assert.equal(hidden.status, "wrong");
  assert.equal("expectedPersistence" in hidden, false);
  assert.equal("actualFiles" in hidden, false);
});

test("los artefactos diferentes fallan y los casos ocultos no exponen contenidos", () => {
  const expectedFiles = [{ path: "secreto.txt", content: "esperado" }];
  const output = { stdout: marker({ kind: "function", value: 1, files: [{ path: "secreto.txt", content: "real" }] }), stderr: "", code: 0 };
  const visible = judgeProject(output, { input: 1, expected: 1, expectedFiles, visible: true, order: 0 }, "FUNCTION");
  assert.equal(visible.passed, false);
  assert.deepEqual(visible.actualFiles, [{ path: "secreto.txt", content: "real" }]);
  const hidden = judgeProject(output, { input: 1, expected: 1, expectedFiles, visible: false, order: 1 }, "FUNCTION");
  assert.equal(hidden.passed, false);
  assert.equal("input" in hidden, false);
  assert.equal("expectedFiles" in hidden, false);
  assert.equal("actualFiles" in hidden, false);
  assert.equal("output" in hidden, false);
});

test("PROGRAM compara stdout y artefactos, y distingue error del proceso", () => {
  const testCase = { input: "run", expected: "ok", expectedFiles: [], visible: true, order: 0 };
  assert.equal(judgeProject({ stdout: marker({ kind: "program", stdout: "ok\n", code: 0, files: [] }), stderr: "", code: 0 }, testCase, "PROGRAM").passed, true);
  assert.equal(judgeProject({ stdout: marker({ kind: "program", stdout: "ok", code: 2, stderr: "fallo", files: [] }), stderr: "", code: 0 }, testCase, "PROGRAM").status, "runtime");
});

test("las pruebas propias distinguen aserción, error, timeout y cierre exitoso sin acreditar calidad", () => {
  assert.equal(judgeOwnTests({ stdout: "", stderr: "AssertionError: mismatch", code: 1 }).status, "assertion");
  assert.equal(judgeOwnTests({ stdout: "", stderr: "TypeError: bad", code: 1 }).status, "runtime");
  assert.equal(judgeOwnTests({ stdout: "ok", stderr: "", code: 0 }).passed, true);
  assert.equal(judgeOwnTests({ stdout: "", stderr: "", code: 124, status: "TO" }).status, "timeout");
});
