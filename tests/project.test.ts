import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProjectPath, projectDefinitionSchema, snapshotProjectFiles, validateExpectedProjectFiles, validateProjectPersistence, validateProjectSolution, validateProjectSnapshot } from "../src/lib/project";

const valid = {
  version: 1 as const,
  entrypoint: "logic.py",
  files: [{ path: "logic.py", content: "def solve(data): return data" }],
};

test("valida manifiestos versionados y punto de entrada", () => {
  assert.equal(projectDefinitionSchema.safeParse(valid).success, true);
  assert.equal(projectDefinitionSchema.safeParse({ ...valid, entrypoint: "missing.py" }).success, false);
  assert.equal(projectDefinitionSchema.safeParse({ ...valid, entrypoint: "LOGIC.py" }).success, false);
  assert.equal(projectDefinitionSchema.safeParse({ ...valid, testEntrypoint: "TEST.py", files: [...valid.files, { path: "test.py", content: "" }] }).success, false);
});

test("rechaza rutas peligrosas y colisiones sin distinguir mayúsculas", () => {
  for (const path of ["../x.py", "folder/x.py", "/tmp/x.py", "C:x.py", "x\\y.py", "__itera_driver.ts"]) {
    assert.equal(normalizeProjectPath(path), null, path);
  }
  assert.equal(projectDefinitionSchema.safeParse({ ...valid, files: [...valid.files, { path: "LOGIC.py", content: "" }] }).success, false);
});

test("limita cantidad y tamaño del proyecto", () => {
  assert.equal(projectDefinitionSchema.safeParse({ ...valid, files: [{ path: "logic.py", content: "x".repeat(64 * 1024 + 1) }] }).success, false);
  assert.equal(projectDefinitionSchema.safeParse({ ...valid, files: Array.from({ length: 21 }, (_, i) => ({ path: `f${i}.py`, content: "" })) }).success, false);
});

test("snapshots conservan contenido por archivo sin compartir objetos", () => {
  const source = [{ path: "logic.py", content: "original", readOnly: false }];
  const snapshot = snapshotProjectFiles(source);
  snapshot[0].content = "edited";
  assert.equal(source[0].content, "original");
});

test("solución editorial privada solo admite los archivos editables del manifiesto", () => {
  const project = { ...valid, files: [...valid.files, { path: "data.json", content: "{}", readOnly: true }] };
  assert.deepEqual(validateProjectSolution(project, [{ path: "logic.py", content: "def solve(data): return data" }]), [
    { path: "logic.py", content: "def solve(data): return data" },
    { path: "data.json", content: "{}", readOnly: true },
  ]);
  assert.deepEqual(validateProjectSolution(project, [...project.files]), project.files);
  assert.throws(() => validateProjectSolution(project, [...project.files, project.files[1]]));
  assert.throws(() => validateProjectSolution(project, [
    { path: "logic.py", content: "x" },
    { path: "data.json", content: "changed" },
  ]));
});

test("snapshots completos preservan recursos de solo lectura y limitan rutas/tamaño", () => {
  const project = { ...valid, files: [...valid.files, { path: "data.json", content: "{}", readOnly: true }] };
  assert.deepEqual(validateProjectSnapshot(project, project.files), project.files);
  assert.throws(() => validateProjectSnapshot(project, [{ ...project.files[0], content: "" }]));
  assert.throws(() => validateProjectSnapshot(project, [...project.files, { path: "../escape.txt", content: "" }]));
});

test("expectedFiles permite modificar recursos editables, pero no código ni recursos protegidos", () => {
  const project = { ...valid, files: [
    ...valid.files,
    { path: "store.json", content: "{}" },
    { path: "seed.txt", content: "base", readOnly: true },
  ] };
  assert.deepEqual(validateExpectedProjectFiles(project, [{ path: "store.json", content: "{\"ok\":true}" }]), [{ path: "store.json", content: "{\"ok\":true}" }]);
  assert.deepEqual(validateExpectedProjectFiles(project, [{ path: "result.json", content: "{}" }]), [{ path: "result.json", content: "{}" }]);
  for (const file of [
    { path: "seed.txt", content: "changed" },
    { path: "main.py", content: "changed" },
    { path: "script.js", content: "code" },
    { path: "STORE.json", content: "wrong-case" },
  ]) assert.throws(() => validateExpectedProjectFiles(project, [file]));
});

test("artefactos esperados comparten el límite de 32 KiB del runtime", () => {
  assert.throws(() => validateExpectedProjectFiles(valid, [{ path: "large.txt", content: "x".repeat(32 * 1024 + 1) }]));
  assert.throws(() => validateExpectedProjectFiles(valid, [{ path: "one.txt", content: "x".repeat(20 * 1024) }, { path: "two.txt", content: "x".repeat(13 * 1024) }]));
  assert.throws(() => validateExpectedProjectFiles(valid, Array.from({ length: 21 }, (_, index) => ({ path: `f${index}.txt`, content: "" }))));
});

test("verifyPersistence requiere FUNCTION, entradas array y expectativa para cada caso", () => {
  const persistent = { ...valid, verifyPersistence: true };
  assert.equal(projectDefinitionSchema.safeParse(persistent).success, true);
  assert.equal(projectDefinitionSchema.safeParse({ ...valid, verifyPersistence: "yes" }).success, false);
  validateProjectPersistence(persistent, "FUNCTION", [], null);
  assert.throws(() => validateProjectPersistence(persistent, "FUNCTION", {}, 1));
  assert.throws(() => validateProjectPersistence(persistent, "PROGRAM", [], 1));
  assert.throws(() => validateProjectPersistence(persistent, "FUNCTION", [], undefined));
  assert.throws(() => validateProjectPersistence(valid, "FUNCTION", [], 1));
});

test("los artefactos esperados no pueden colisionar con el código ni usar rutas internas", () => {
  assert.deepEqual(validateExpectedProjectFiles(valid, [{ path: "result.json", content: "{}" }]), [{ path: "result.json", content: "{}" }]);
  assert.throws(() => validateExpectedProjectFiles(valid, [{ path: "logic.py", content: "" }]));
  assert.throws(() => validateExpectedProjectFiles(valid, [{ path: "__itera_runner.py", content: "" }]));
});
