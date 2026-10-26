import { test } from "node:test";
import assert from "node:assert/strict";
import { editorialHasChanges, readEditorialDraft } from "../src/lib/editorial-draft";
import type { EditorialData } from "../src/components/admin-editor";

const variant = { starter: "código", solution: "referencia", explanation: "explicación" };
const initial: EditorialData = { id: "ejercicio", versionId: "version-2", versionNumber: 2, published: true, slug: "ejercicio", title: "Título", description: "Descripción", statement: "Enunciado", objective: "Objetivo", prerequisites: [], practiceGoals: [], prerequisiteSlugs: [], complexity: "", commonErrors: [], activityType: "PRACTICE", runtimeMode: "FUNCTION", category: "Fundamentos", level: "BEGINNER", minutes: 10, hints: [], constraints: [], python: variant, javascript: variant, typescript: variant, tests: "[]" };

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

test("en una ficha nueva se recupera también el slug todavía sin guardar", () => {
  const result = readEditorialDraft(JSON.stringify({ ...initial, slug: "mi-reto" }), { ...initial, id: undefined, versionId: undefined, slug: "" });
  assert.equal(result?.slug, "mi-reto");
});

test("rechaza copias dañadas, demasiado grandes o con campos de tipos distintos", () => {
  for (const value of [null, "{", "null", "[]", JSON.stringify({ ...initial, title: 1 }), JSON.stringify({ ...initial, hints: [null] }), JSON.stringify({ ...initial, minutes: null }), JSON.stringify({ ...initial, python: null }), JSON.stringify({ ...initial, javascript: { ...variant, typeContract: 123 } }), JSON.stringify({ ...initial, tests: "x".repeat(300001) })]) assert.equal(readEditorialDraft(value, initial), null);
});
