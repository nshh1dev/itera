import { test } from "node:test";
import assert from "node:assert/strict";
import { exercises } from "../prisma/content";
import { catalogRevision, catalogRevisionDecision, seedVersionContent } from "../prisma/editorial-revision";

function fixture() {
  const source = seedVersionContent(catalogRevision("suma-de-dos-numeros")!);
  return { source, current: { ...structuredClone(source), id: "version-1", published: true } };
}

test("las revisiones solo incluyen ejercicios del catálogo editorial", () => {
  assert.equal(catalogRevision("no-existe"), undefined);
  assert.equal(catalogRevision("constructor"), undefined);
  assert.ok(catalogRevision("tu-primer-resultado"));
  for (const { slug } of exercises) {
    const exercise = catalogRevision(slug)!;
    const content = seedVersionContent(exercise);
    assert.deepEqual(content.variants.map(v => v.language), ["python", "javascript", "typescript"]);
    for (const variant of content.variants) {
      assert.ok(variant.tests.some(t => t.visible), slug);
      assert.ok(variant.tests.some(t => !t.visible), slug);
    }
  }
});

test("objetivo y conocimientos previos forman parte de la versión importada", () => {
  const { source, current } = fixture();
  current.objective = "Objetivo de una versión anterior";
  assert.equal(catalogRevisionDecision(current, source, current.id), "create");
  const another = fixture();
  another.current.prerequisites = [];
  assert.equal(catalogRevisionDecision(another.current, another.source, another.current.id), "create");
});

test("importar contenido idéntico es idempotente incluso después de una respuesta perdida", () => {
  const { source, current } = fixture();
  assert.equal(catalogRevisionDecision(current, source, current.id), "unchanged");
  current.published = false;
  current.id = "version-2";
  assert.equal(catalogRevisionDecision(current, source, "version-1"), "unchanged");
});

test("la comparación ignora ids y orden de carga, pero no la visibilidad ni el contenido", () => {
  const { source, current } = fixture();
  current.variants.reverse();
  for (const variant of current.variants) variant.tests.reverse();
  current.variants[0].tests.find(t => t.order === 0)!.input = { b: 5, a: 3 };
  assert.equal(catalogRevisionDecision(current, source, current.id), "unchanged");
  current.variants[0].tests.find(t => t.order === 2)!.visible = true;
  assert.equal(catalogRevisionDecision(current, source, current.id), "create");
});

test("un cambio publicado permite crear una nueva versión sin reemplazar la anterior", () => {
  const { source, current } = fixture();
  current.statement = "Enunciado anterior";
  const before = structuredClone(current);
  assert.equal(catalogRevisionDecision(current, source, current.id), "create");
  assert.deepEqual(current, before);
});

test("una importación no sobrepasa un borrador distinto ni una revisión concurrente", () => {
  const { source, current } = fixture();
  current.statement = "Mi borrador editorial";
  current.published = false;
  assert.equal(catalogRevisionDecision(current, source, current.id), "draft");
  assert.equal(catalogRevisionDecision(current, source, "otra-version"), "stale");
  current.published = true;
  assert.equal(catalogRevisionDecision(current, source, "otra-version"), "stale");
});

test("las tres variantes, sus contratos y los casos ocultos forman parte de la revisión", () => {
  const { source, current } = fixture();
  current.variants.find(v => v.language === "javascript")!.starter += "\n// Cambio editorial";
  assert.equal(catalogRevisionDecision(current, source, current.id), "create");
  const another = fixture();
  another.current.variants[0].tests.find(t => !t.visible)!.expected = 999;
  assert.equal(catalogRevisionDecision(another.current, another.source, another.current.id), "create");
  for (const field of ["statement", "typeContract"] as const) {
    const changed = fixture();
    changed.current.variants.find(variant => variant.language === "typescript")![field] += "\n// Cambio editorial";
    assert.equal(catalogRevisionDecision(changed.current, changed.source, changed.current.id), "create", field);
  }
});
