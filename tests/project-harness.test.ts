import test from "node:test";
import assert from "node:assert/strict";
import { projectExecutionFiles } from "../src/server/execution/harness";
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
});

test("el conductor de pruebas ejecuta solo el entrypoint público configurado", () => {
  const definition = { ...project, testEntrypoint: "test_main.py", files: [...project.files, { path: "test_main.py", content: "assert True" }] };
  const files = projectExecutionFiles("python", definition.files, definition, "tests");
  assert.equal(files[0].name, "test_main.py");
  assert.ok(files.some(file => file.name === "main.py"));
});
