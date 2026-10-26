import test from "node:test";
import assert from "node:assert/strict";
import { buildEditorialSavePayload, editorialPayloadBytes, maximumEditorialPayloadBytes } from "../src/lib/editorial-payload";
import type { EditorialData } from "../src/components/admin-editor";

const variant = { starter: "starter", solution: "solution", explanation: "explicación válida" };
const base: EditorialData = {
  slug: "inventario", title: "Inventario", description: "Ejercicio editorial", statement: "Enunciado del ejercicio con suficiente detalle.", objective: "Practicar persistencia local en archivos.", prerequisites: [], practiceGoals: ["Archivos"], prerequisiteSlugs: [], complexity: "", commonErrors: [], activityType: "PRACTICE", runtimeMode: "FUNCTION", category: "Fundamentos", level: "BEGINNER", minutes: 10, hints: ["Primera pista", "Segunda pista", "Tercera pista"], constraints: [], python: variant, javascript: variant, typescript: variant,
  projects: { python: "", javascript: "", typescript: "" }, projectSolutions: { python: "", javascript: "", typescript: "" }, tests: "[]",
};

test("la serialización del formulario conserva proyectos privados y expectativas por caso", () => {
  const manifest = { version: 1, entrypoint: "main.py", verifyPersistence: true, files: [{ path: "main.py", content: "def solve(data): return data" }, { path: "almacen.json", content: "{}" }] };
  const privateSolution = [{ path: "main.py", content: "def solve(data): return data" }, { path: "almacen.json", content: "{}" }];
  const tests = [{ input: [1], expected: 1, expectedFiles: [{ path: "almacen.json", content: "{\"items\":[1]}" }], expectedPersistence: [1], visible: false, explanation: "" }];
  const result = buildEditorialSavePayload({
    ...base,
    projects: { ...base.projects, python: JSON.stringify(manifest) },
    projectSolutions: { ...base.projectSolutions, python: JSON.stringify(privateSolution) },
    tests: JSON.stringify(tests),
  });
  if (!result.data) throw new Error(result.error);
  assert.deepEqual(result.data.projects, { python: manifest });
  assert.deepEqual(result.data.projectSolutions, { python: privateSolution });
  assert.deepEqual(result.data.tests, tests);
  assert.equal("projects" in result.data, true);
});

test("la serialización informa el campo y lenguaje cuando un JSON editorial está roto", () => {
  const result = buildEditorialSavePayload({ ...base, projects: { ...base.projects, typescript: "{" } });
  assert.deepEqual(result, { error: "El JSON de manifiesto para TypeScript no es válido." });
});

test("el límite de la acción cubre los tres manifiestos y soluciones máximos sin aceptar cuerpos ilimitados", () => {
  const file = (path: string) => [{ path, content: "x".repeat(256 * 1024) }];
  const payload = {
    ...base,
    projects: { python: JSON.stringify({ version: 1, entrypoint: "main.py", files: file("main.py") }), javascript: JSON.stringify({ version: 1, entrypoint: "main.js", files: file("main.js") }), typescript: JSON.stringify({ version: 1, entrypoint: "main.ts", files: file("main.ts") }) },
    projectSolutions: { python: JSON.stringify(file("main.py")), javascript: JSON.stringify(file("main.js")), typescript: JSON.stringify(file("main.ts")) },
  };
  assert.ok(editorialPayloadBytes(payload) < maximumEditorialPayloadBytes);
  assert.ok(maximumEditorialPayloadBytes < 12 * 1024 * 1024);
});
