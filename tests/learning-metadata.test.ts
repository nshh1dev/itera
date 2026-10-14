import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { exercises } from "../prisma/content";
import { learningMetadata } from "../prisma/learning-metadata";
import { learningMetadataSchema } from "../src/lib/learning-metadata";
import { LearningGuide } from "../src/components/practice/learning-guide";

test("cada ejercicio del catálogo tiene objetivo y conocimientos previos editoriales válidos", () => {
  assert.deepEqual(Object.keys(learningMetadata).sort(), exercises.map(e => e.slug).sort());
  for (const exercise of exercises) {
    assert.equal(learningMetadataSchema.safeParse(exercise).success, true, exercise.slug);
    if (exercise.level !== "BEGINNER") assert.ok(exercise.prerequisites!.length > 0, exercise.slug);
  }
  assert.deepEqual(learningMetadata["tu-primer-resultado"].prerequisites, []);
});

test("la validación recorta espacios y rechaza objetivos vacíos y requisitos repetidos o excesivos", () => {
  assert.deepEqual(learningMetadataSchema.parse({ objective: "  Practicar una suma con dos datos.  ", prerequisites: ["  Usar return  "] }), {
    objective: "Practicar una suma con dos datos.", prerequisites: ["Usar return"],
  });
  const valid = { objective: "Practicar una suma con dos datos.", prerequisites: [] };
  assert.equal(learningMetadataSchema.safeParse({ ...valid, objective: "   " }).success, false);
  assert.equal(learningMetadataSchema.safeParse({ ...valid, objective: "a".repeat(501) }).success, false);
  assert.equal(learningMetadataSchema.safeParse({ ...valid, prerequisites: ["for", "FOR"] }).success, false);
  assert.equal(learningMetadataSchema.safeParse({ ...valid, prerequisites: [""] }).success, false);
  assert.equal(learningMetadataSchema.safeParse({ ...valid, prerequisites: ["a".repeat(121)] }).success, false);
  assert.equal(learningMetadataSchema.safeParse({ ...valid, prerequisites: Array.from({ length: 9 }, (_, i) => `Concepto ${i}`) }).success, false);
});

test("la guía no atribuye conocimientos ni objetivos a una versión histórica vacía", () => {
  const html = renderToStaticMarkup(LearningGuide({ objective: "", prerequisites: [] }));
  assert.match(html, /todavía no tiene un objetivo editorial/);
  assert.match(html, /no especifica conocimientos previos/);
  assert.doesNotMatch(html, /No necesitas conocimientos de programación/);
  assert.match(html, /no bloqueos/);
});

test("la guía muestra una versión documentada y no interpreta su contenido como HTML", () => {
  const html = renderToStaticMarkup(LearningGuide({ objective: "Practicar <script> sin ejecutar etiquetas.", prerequisites: ["Bucles", "Variables"] }));
  assert.match(html, /Bucles/);
  assert.match(html, /Variables/);
  assert.doesNotMatch(html, /<script>/);
  const first = renderToStaticMarkup(LearningGuide({ objective: "Observar tu primer programa.", prerequisites: [] }));
  assert.match(first, /No necesitas conocimientos de programación previos/);
});
