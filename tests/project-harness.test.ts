import test from "node:test";
import assert from "node:assert/strict";
import { executionFiles, projectExecutionFiles } from "../src/server/execution/harness";
import type { Language } from "../src/lib/types";
import type { ProjectDefinition } from "../src/lib/project";

const project: ProjectDefinition = {
  version: 1,
  entrypoint: "main.py",
  files: [{ path: "main.py", content: "def solve(data): return data" }, { path: "helper.py", content: "def add(a, b): return a + b" }],
};

test("Python FUNCTION conserva main del alumno y antepone un driver fijo privado", () => {
  const files = projectExecutionFiles("python", project.files, project, "FUNCTION");
  assert.equal(files[0].name, "__itera_runner.py");
  assert.equal(files[1].name, "main.py");
  assert.match(files[0].content, /spec_from_file_location/);
  assert.match(files[0].content, /__itera_module\.solve/);
  assert.match(files[0].content, /json\.loads/);
});

test("JavaScript FUNCTION usa módulos del proyecto sin inyectarlos en el campo code", () => {
  const definition = { ...project, entrypoint: "main.js", files: [{ path: "main.js", content: "module.exports = solve;" }, { path: "helper.js", content: "exports.value = 4;" }] };
  const files = projectExecutionFiles("javascript", definition.files, definition, "FUNCTION");
  assert.equal(files[0].name, "__itera_runner.js");
  assert.match(files[0].content, /require\('\.\/main\.js'\)/);
  assert.equal(files[1].content, "module.exports = solve;");
});

test("TypeScript compila todos los módulos estrictamente dentro del sandbox", () => {
  const definition = { ...project, entrypoint: "main.ts", files: [{ path: "main.ts", content: "export function solve(data: number): number { return add(data, 1); }" }, { path: "helper.ts", content: "export function add(a: number, b: number): number { return a + b; }" }] };
  const files = projectExecutionFiles("typescript", definition.files, definition, "FUNCTION", "type Solve = (data: number) => number;");
  assert.equal(files[0].name, "__itera_runner.ts");
  assert.match(files[0].content, /--strict/);
  assert.match(files[0].content, /main\.ts/);
  assert.match(files[0].content, /__itera_build\/main\.js/);
  assert.ok(files.some(file => file.name === "main.ts" && file.content.includes("type Solve")));
});

test("FUNCTION TypeScript no procesa una salida si el proceso hijo termina con error", () => {
  const definition = { ...project, entrypoint: "main.ts", files: [{ path: "main.ts", content: "export function solve(data: number): number { return data; }" }] };
  const files = projectExecutionFiles("typescript", definition.files, definition, "FUNCTION");
  assert.match(files[0].content, /executed\.status !== 0/);
  assert.match(files[0].content, /process\.exit\(executed\.status \|\| 1\)/);
});

test("verifyPersistence añade un segundo proceso limpio con solve([]) y conserva el contrato en los tres drivers", () => {
  const cases: { language: Language; definition: ProjectDefinition; marker: string; input: string }[] = [
    { language: "python", definition: { ...project, verifyPersistence: true }, marker: "__itera_check = subprocess.run", input: "input='[]'" },
    { language: "javascript", definition: { ...project, entrypoint: "main.js", verifyPersistence: true, files: [{ path: "main.js", content: "module.exports = solve;" }] }, marker: "__itera_second = child.spawnSync", input: "solve([])" },
    { language: "typescript", definition: { ...project, entrypoint: "main.ts", verifyPersistence: true, files: [{ path: "main.ts", content: "export function solve(data: number[]): number { return data.length; }" }] }, marker: "const second = child.spawnSync", input: "input: '[]'" },
  ];
  for (const { language, definition, marker, input } of cases) {
    const files = projectExecutionFiles(language, definition.files, definition, "FUNCTION");
    assert.ok(files[0].content.includes(marker), language);
    assert.ok(files[0].content.includes(input), language);
    assert.ok(files[0].content.includes("persistence"), language);
  }
  assert.throws(() => projectExecutionFiles("typescript", [{ path: "main.TS", content: "" }], { version: 1, entrypoint: "main.TS", files: [{ path: "main.TS", content: "" }] }, "FUNCTION"));
});

test("verifyPersistence no bloquea pruebas propias independientes", () => {
  const definition = { ...project, verifyPersistence: true, testEntrypoint: "tests.py", files: [...project.files, { path: "tests.py", content: "" }] };
  assert.doesNotThrow(() => projectExecutionFiles("python", definition.files, definition, "tests"));
});

test("el harness legado declara require de node:assert/strict para funciones y functionBatch", () => {
  const legacy = executionFiles("typescript", "const assert = require('node:assert/strict');\nfunction solve(data: number): number { assert.equal(data, 1); return data; }", "FUNCTION");
  assert.ok(legacy[0].content.includes('declare function require(name: \\"node:assert/strict\\")'));
  const projectBatch = projectExecutionFiles("typescript", [{ path: "main.ts", content: "export function solve(data: number): number { const assert = require('node:assert/strict'); assert.equal(data, 1); return data; }" }], { version: 1, entrypoint: "main.ts", files: [{ path: "main.ts", content: "" }] }, "FUNCTION");
  assert.match(projectBatch.find(file => file.name === "__itera_node.d.ts")!.content, /declare function require/);
  assert.match(projectBatch.find(file => file.name === "__itera_node.d.ts")!.content, /declare module "node:assert\/strict"/);
});

test("PROGRAM conserva main del alumno y captura la ejecución con un driver de proyecto", () => {
  const files = projectExecutionFiles("python", project.files, project, "PROGRAM");
  assert.equal(files[0].name, "__itera_runner.py");
  assert.equal(files[1].name, "main.py");
  assert.match(files[0].content, /subprocess\.run/);
  assert.match(files[0].content, /__ITERA_PROJECT__/);
});

test("rechaza archivos internos y puntos de entrada con extensión ajena", () => {
  assert.throws(() => projectExecutionFiles("python", [{ path: "__itera_evil.py", content: "" }, project.files[0]], project, "FUNCTION"));
  assert.throws(() => projectExecutionFiles("javascript", project.files, project, "FUNCTION"));
  assert.throws(() => projectExecutionFiles("python", [project.files[0]], project, "FUNCTION"));
  const wrongCaseTest = { ...project, testEntrypoint: "tests.PY", files: [...project.files, { path: "tests.PY", content: "" }] };
  assert.throws(() => projectExecutionFiles("python", wrongCaseTest.files, wrongCaseTest, "tests"));
});

test("el conductor de pruebas ejecuta solo el entrypoint público configurado", () => {
  const definition = { ...project, testEntrypoint: "test_main.py", files: [...project.files, { path: "test_main.py", content: "assert True" }] };
  const files = projectExecutionFiles("python", definition.files, definition, "tests");
  assert.equal(files[0].name, "test_main.py");
  assert.ok(files.some(file => file.name === "main.py"));
});
