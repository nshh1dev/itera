import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonDictionaryPrerequisites } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { pythonCurriculumUnits } from "../src/lib/python-curriculum";
import { pythonModuleCopy, pythonPathCopy } from "../src/lib/python-route-copy";
import { beforePythonDictionaryPrerequisites, previousDictionaryPrerequisites } from "./python-dictionary-prerequisites-baseline";

test("frecuencias, delimitadores y altura piden diccionarios sin cambiar los demás prerrequisitos", () => {
  assert.deepEqual(Object.keys(pythonDictionaryPrerequisites), Object.keys(previousDictionaryPrerequisites));
  assert.equal(Object.keys(pythonDictionaryPrerequisites).length, 3);
  for (const [slug, prerequisites] of Object.entries(pythonDictionaryPrerequisites)) {
    const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
    assert.deepEqual(content.prerequisites, prerequisites, slug);
    const previous = previousDictionaryPrerequisites[slug];
    assert.equal(prerequisites.length, previous.length, slug);
    assert.deepEqual(prerequisites.filter(text => !/Diccionarios/.test(text)), previous.filter(text => !/objetos/i.test(text)), slug);
  }
  assert.deepEqual(pythonDictionaryPrerequisites["logica-altura"], ["Recursión", "Diccionarios anidados"]);
});

test("el vocabulario Python cubre textos de actividades, rutas y teoría sin prohibir usos correctos de objeto", () => {
  const legacy = /\b(?:arreglos?|subarreglos?|propiedades|undefined)\b|diccionarios u objetos|objetos anidados/i;
  for (const { slug, content: c } of pythonCatalog) {
    const texts = [c.title, c.description, c.objective, c.statement, c.complexity,
      ...c.prerequisites, ...c.constraints, ...c.hints, ...c.practiceGoals, ...c.commonErrors,
      ...c.variants.flatMap(v => [v.statement ?? "", v.explanation,
        ...v.tests.filter(t => t.visible).map(t => t.explanation ?? "")])];
    for (const text of texts) assert.doesNotMatch(text, legacy, slug);
  }
  for (const unit of pythonCurriculumUnits) {
    for (const text of [unit.title, unit.theory]) assert.doesNotMatch(text, legacy, unit.slug);
  }
  for (const [slug, copy] of Object.entries({ ...pythonModuleCopy, ...pythonPathCopy })) {
    for (const text of Object.values(copy)) assert.doesNotMatch(text, legacy, slug);
  }
  const content = (slug: string) => pythonCatalog.find(e => e.slug === slug)!.content;
  assert.match(content("logica-registro-compartido").hints[0], /mismo objeto/);
  assert.match(content("python-map").commonErrors[1], /objeto map/);
  assert.match(content("logica-mochila").constraints[0], /objetos/);
  assert.match(content("logica-arbol-busqueda").statement, /propiedad de búsqueda/);
  assert.match(content("python-diferencia").variants[0].explanation, /'mapa'/);
});

test("solo cambian tres listas textuales y se conservan dependencias, evaluación e historia", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !(entry.slug in pythonDictionaryPrerequisites && field === "prerequisites")),
  ) }));
  // Calculada antes de editar: incluye prerequisiteSlugs y las otras 221
  // actividades; no excluye metadatos, teoría, ayudas, código ni casos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "9f3c58d77750847fb9f15759ee7ecc47af2c78dce1ac8dbcb67a5d20a235c1aa");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonDictionaryPrerequisites(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "499552ede7872652cf4ec311d10bc19bafe2b06bbc582fa86551463705560c80");
});
