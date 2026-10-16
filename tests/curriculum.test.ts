import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { exercises } from "../prisma/content";
import { seedVersionContent } from "../prisma/editorial-revision";
import { learningModules, modulesForPath } from "../src/lib/learning-modules";
import { learningPaths, introductorySteps } from "../src/lib/learning-paths";
import { languages } from "../src/lib/types";
import { editorialSchema, publicationMetadataSchema } from "../src/lib/editorial";
import { prerequisiteIssue } from "../src/lib/curriculum";
import { ModuleLesson } from "../src/components/practice/module-lesson";

test("las cuatro rutas cubren cada identidad una vez y terminan con integración", () => {
  const slugs = learningModules.flatMap(module => module.slugs);
  assert.equal(slugs.length, new Set(slugs).size);
  assert.deepEqual([...slugs].sort(), exercises.map(exercise => exercise.slug).sort());
  for (const path of learningPaths) {
    const modules = modulesForPath(path.slug);
    assert.ok(modules.length >= 4, path.slug);
    assert.deepEqual(path.slugs, modules.flatMap(module => module.slugs));
    assert.equal(exercises.find(exercise => exercise.slug === path.slugs!.at(-1))?.activityType, "INTEGRATION", path.slug);
    for (const unit of modules) {
      assert.ok(unit.theory.length > 150, unit.slug);
      assert.ok(unit.readiness.length >= 2, unit.slug);
      for (const language of languages) assert.ok(unit.examples[language].length > 20, `${unit.slug}: ${language}`);
    }
  }
});

test("los nuevos pasos enseñan variables antes de leer y separan imprimir de devolver", () => {
  const before = (a: string, b: string) => assert.ok(introductorySteps.indexOf(a) >= 0 && introductorySteps.indexOf(a) < introductorySteps.indexOf(b), `${a} antes de ${b}`);
  before("guarda-y-muestra", "lee-y-saluda");
  before("numero-y-texto", "lee-y-suma");
  before("corrige-un-calculo", "tu-primer-resultado");
  before("suma-de-dos-numeros", "presupuesto-de-merienda");
});

test("todo el catálogo supera la validación editorial y de publicación y tiene prerrequisitos anteriores", () => {
  const entries = exercises.map((exercise, order) => ({ slug: exercise.slug, order }));
  for (const exercise of exercises) {
    const version = seedVersionContent(exercise);
    const variants = Object.fromEntries(version.variants.map(variant => [variant.language, variant]));
    const result = editorialSchema.safeParse({ ...exercise, ...version, ...variants, tests: version.variants[0].tests });
    assert.equal(result.success, true, `${exercise.slug}: ${result.success ? "" : JSON.stringify(result.error.issues)}`);
    const publication = publicationMetadataSchema.safeParse(version);
    assert.equal(publication.success, true, `${exercise.slug}: ${publication.success ? "" : JSON.stringify(publication.error.issues)}`);
    assert.equal(prerequisiteIssue(exercise.slug, version.prerequisiteSlugs, entries), undefined, exercise.slug);
  }
});

test("la lección muestra un ejemplo adaptado y escapa texto sin revelar soluciones", () => {
  const unit = learningModules[0];
  const html = renderToStaticMarkup(ModuleLesson({ lesson: { ...unit, theory: "Lee <script> como texto.", example: unit.examples.typescript }, language: "typescript" }));
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /console.log/);
  assert.match(html, /No es la solución del reto/);
  assert.doesNotMatch(html, /Hola, mundo!/);
});
