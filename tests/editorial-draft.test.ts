import { test } from "node:test";
import assert from "node:assert/strict";
import { editorialHasChanges, readEditorialDraft } from "../src/lib/editorial-draft";
import type { EditorialData } from "../src/components/admin-editor";

const variant = { starter: "código", solution: "referencia", explanation: "explicación" };
const emptyLanguageJson = { python: "", javascript: "", typescript: "" };
const initial: EditorialData = { id: "ejercicio", versionId: "version-2", versionNumber: 2, published: true, slug: "ejercicio", title: "Título", description: "Descripción", statement: "Enunciado", objective: "Objetivo", prerequisites: [], practiceGoals: [], prerequisiteSlugs: [], complexity: "", commonErrors: [], activityType: "PRACTICE", runtimeMode: "FUNCTION", category: "Fundamentos", level: "BEGINNER", minutes: 10, hints: [], constraints: [], python: variant, javascript: variant, typescript: variant, projects: emptyLanguageJson, projectSolutions: emptyLanguageJson, tests: "[]" };

test("los cambios pendientes dependen del contenido, no de los estados devueltos por el servidor", () => {
  assert.equal(editorialHasChanges({ ...initial, published: false, versionNumber: 3 }, initial), false);
  assert.equal(editorialHasChanges({ ...initial, exercisePublished: false }, { ...initial, exercisePublished: true }), false);
  assert.equal(editorialHasChanges({ ...initial, title: "Nuevo título" }, initial), true);
  assert.equal(editorialHasChanges({ ...initial, python: { ...variant, starter: "Otro código" } }, initial), true);
});

test("recupera contenido editorial incompleto sin exigir que ya se pueda publicar", () => {
  const edited = { ...initial, title: "Pendiente", objective: "", tests: "[{JSON incompleto", python: { ...variant, starter: "", typeContract: "" } };
  const result = readEditorialDraft(JSON.stringify(edited), initial);
  assert.equal(result?.title, edited.title);
  assert.equal(result?.tests, edited.tests);
  assert.equal(result?.python.starter, "");
});

test("recupera manifiestos y soluciones privadas sin reemplazar permisos, y conserva copias antiguas", () => {
  const privateProject = { version: 1, entrypoint: "main.py", files: [{ path: "main.py", content: "def solve(data): return data" }] };
  const solution = [{ path: "main.py", content: "def solve(data): return data + 1" }];
  const edited = { ...initial, projects: { ...emptyLanguageJson, python: JSON.stringify(privateProject) }, projectSolutions: { ...emptyLanguageJson, python: JSON.stringify(solution) }, tests: JSON.stringify([{ input: [1], expected: 2, expectedFiles: [{ path: "out.txt", content: "ok" }], expectedPersistence: [2], visible: false }]) };
  const restored = readEditorialDraft(JSON.stringify({ ...edited, id: "attacker", role: "ADMIN" }), initial);
  assert.deepEqual(restored?.projects, edited.projects);
  assert.deepEqual(restored?.projectSolutions, edited.projectSolutions);
  assert.equal(restored?.id, initial.id);
  assert.equal(restored && "role" in restored, false);
  const oldCopy = { ...initial, projects: undefined, projectSolutions: undefined };
  assert.equal(readEditorialDraft(JSON.stringify(oldCopy), initial)?.title, initial.title);
});

test("una copia local nunca cambia la identidad, la versión ni la publicación remotas", () => {
  const edited = { ...initial, id: "ajeno", versionId: "version-999", versionNumber: 999, slug: "ajeno", published: false, exercisePublished: false, role: "ADMIN", title: "Mi edición" };
  const result = readEditorialDraft(JSON.stringify(edited), { ...initial, exercisePublished: true });
  assert.equal(result?.id, initial.id);
  assert.equal(result?.versionId, initial.versionId);
  assert.equal(result?.versionNumber, initial.versionNumber);
  assert.equal(result?.slug, initial.slug);
  assert.equal(result?.published, initial.published);
  assert.equal(result?.exercisePublished, true);
  assert.equal(result?.title, edited.title);
  assert.equal(result && "role" in result, false);
});

test("un manifiesto o una solución privada cambia la versión y debe guardarse", () => {
  assert.equal(editorialHasChanges({ ...initial, projects: { ...initial.projects, python: "{\"version\":1}" } }, initial), true);
  assert.equal(editorialHasChanges({ ...initial, projectSolutions: { ...initial.projectSolutions, python: "[]" } }, initial), true);
});

test("en una ficha nueva se recupera también el slug todavía sin guardar", () => {
  const result = readEditorialDraft(JSON.stringify({ ...initial, slug: "mi-reto" }), { ...initial, id: undefined, versionId: undefined, slug: "" });
  assert.equal(result?.slug, "mi-reto");
});

test("rechaza copias dañadas, demasiado grandes o con campos de tipos distintos", () => {
  for (const value of [null, "{", "null", "[]", JSON.stringify({ ...initial, title: 1 }), JSON.stringify({ ...initial, hints: [null] }), JSON.stringify({ ...initial, minutes: null }), JSON.stringify({ ...initial, python: null }), JSON.stringify({ ...initial, javascript: { ...variant, typeContract: 123 } }), JSON.stringify({ ...initial, tests: "x".repeat(10_000_001) })]) assert.equal(readEditorialDraft(value, initial), null);
});
