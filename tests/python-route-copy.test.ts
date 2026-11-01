import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonModuleCopy, pythonPathCopy } from "../src/lib/python-route-copy";
import { pythonCurriculumUnits, pythonCurriculumSlugs } from "../src/lib/python-curriculum";
import { learningModules, modulesForPath, moduleForExercise } from "../src/lib/learning-modules";
import { learningPaths } from "../src/lib/learning-paths";
import { languagePaths } from "../src/lib/language-curriculum";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("los 57 módulos Python tienen títulos y descripciones ajustados a sus actividades", () => {
  assert.equal(pythonCurriculumUnits.length, 57);
  assert.deepEqual(new Set(Object.keys(pythonModuleCopy)), new Set(pythonCurriculumUnits.map(unit => unit.slug)));
  for (const path of learningPaths) {
    const modules = modulesForPath(path.slug, "python");
    for (const [index, module] of modules.entries()) {
      assert.equal(module.title, `${index + 1}. ${pythonModuleCopy[module.slug].title}`);
      assert.equal(module.objective, pythonModuleCopy[module.slug].description);
      assert.ok(module.objective.length >= 40 && module.objective.length <= 300, module.slug);
      assert.doesNotMatch(module.objective, /\b(?:arreglos?|propiedades?)\b|Puedo | · /i, module.slug);
    }
  }
  assert.match(moduleForExercise("logica-frecuencias", "python")!.title, /Repetidos y frecuencias/);
  assert.doesNotMatch(moduleForExercise("logica-frecuencias", "python")!.objective, /agrupar/);
  assert.match(moduleForExercise("logica-agrupa-registros", "python")!.title, /Agrupar/);
  assert.match(moduleForExercise("logica-lee-archivo", "python")!.title, /Archivos de texto y JSON/);
  assert.match(moduleForExercise("logica-agenda-almacenamiento", "python")!.objective, /tareas entre procesos/);
  for (const slug of ["python-academia-inscribe", "python-contactos-crea", "python-transforma-campo"]) {
    assert.match(moduleForExercise(slug, "python")!.title, /Prácticas:/, slug);
  }
});

test("las cuatro rutas proyectan solo su descripción con Python activo y conservan títulos y contenido personalizado", () => {
  assert.deepEqual(new Set(Object.keys(pythonPathCopy)), new Set(learningPaths.map(path => path.slug)));
  const catalog = pythonCurriculumSlugs.map(slug => ({ id: slug, slug }));
  const paths = [...learningPaths.map(path => ({ ...path, title: `Título guardado: ${path.title}`, items: [{ exerciseId: "personalizado" }] })),
    { ...learningPaths[0], slug: "ruta-propia", description: "Descripción propia", items: [{ exerciseId: "personalizado" }] }];
  const before = JSON.stringify(paths);
  for (const language of ["javascript", "typescript"] as const) assert.equal(languagePaths(paths, catalog, language), paths);
  assert.equal(languagePaths(paths, catalog.filter(entry => !entry.slug.startsWith("python-")), "python"), paths);
  const projected = languagePaths(paths, catalog, "python");
  for (const [index, path] of projected.slice(0, 4).entries()) {
    assert.equal(path.description, pythonPathCopy[path.slug].description);
    assert.equal(path.title, paths[index].title);
    assert.equal(path.level, paths[index].level);
    assert.ok(path.items.some(item => item.exerciseId === "personalizado"));
    const unitSlugs = modulesForPath(path.slug, "python").flatMap(module => module.slugs);
    assert.deepEqual(path.items.filter(item => item.exerciseId !== "personalizado").map(item => item.exerciseId), unitSlugs);
  }
  assert.equal(projected.at(-1), paths.at(-1));
  assert.equal(JSON.stringify(paths), before);
  assert.match(projected[2].description, /comprensiones.*iteradores.*registros académicos y contactos/);
});

test("las proyecciones conservan orden, contratos y fuentes comunes", () => {
  assert.equal(hash({ learningPaths, learningModules }), "f385a8f00ec5c20a7bf4162f5756c251804a1e248aed8a9e1e704c10c1ff8b36");
  // Teoría y ejemplos tienen revisión y huella acotadas en python-module-theory.test.ts.
  // Huella anterior sin títulos: 075eae32072d0f51aacfe5a52e54d170827c8bc30d681733b5b6153d35c5398c.
  assert.equal(hash(pythonCurriculumUnits.map(({ title, theory, examples, ...rest }) => { void [title, theory, examples]; return rest; })), "bcf226222d8e646c2353ea5df4fe956f83b956f685574a80397a3af72eff5e1d");
  assert.equal(pythonReleaseFingerprint(pythonCatalog), "3a713639f6d74074a72e133e105598a4df11a0b0f7367ab39dc7f91aedd14e8e");
});
