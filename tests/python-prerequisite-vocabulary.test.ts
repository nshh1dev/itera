import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonPrerequisiteVocabulary } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonPrerequisiteVocabulary, previousPrerequisiteVocabulary } from "./python-prerequisite-vocabulary-baseline";
import { beforePythonIntroCopy } from "./python-intro-copy-baseline";

test("cuatro prerrequisitos textuales usan claves, tramos y listas de Python", () => {
  assert.deepEqual(Object.keys(pythonPrerequisiteVocabulary), Object.keys(previousPrerequisiteVocabulary));
  assert.equal(Object.keys(pythonPrerequisiteVocabulary).length, 4);
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  for (const [slug, prerequisites] of Object.entries(pythonPrerequisiteVocabulary)) {
    assert.deepEqual(content(slug).prerequisites, prerequisites, slug);
    assert.equal(prerequisites.length, previousPrerequisiteVocabulary[slug].length, slug);
  }
  assert.match(content("logica-dos-parametros").prerequisites[0], /claves de un diccionario/);
  assert.deepEqual(content("logica-dos-parametros").prerequisites.slice(1), previousPrerequisiteVocabulary["logica-dos-parametros"].slice(1));
  assert.match(content("logica-opcional").prerequisites[0], /clave ausente.*valor presente/);
  assert.deepEqual(content("logica-ventana-fija").prerequisites, ["Tramos consecutivos de una lista", "Actualización incremental"]);
  assert.deepEqual(content("logica-mochila").prerequisites, ["Programación dinámica", "Listas"]);
});

test("los textos del catálogo incluyen los prerrequisitos en el control de términos heredados", () => {
  assert.equal(pythonCatalog.length, 224);
  for (const { slug, content } of pythonCatalog) {
    const texts = [content.title, content.description, content.objective, content.statement,
      ...content.prerequisites, ...content.constraints, ...content.hints,
      ...content.practiceGoals, content.complexity, ...content.commonErrors,
      ...content.variants.flatMap(variant => [variant.explanation, variant.statement ?? "",
        ...variant.tests.filter(item => item.visible).map(item => item.explanation ?? "")])];
    for (const text of texts) {
      // No prohíbe objeto (identidad/map/mochila) ni propiedad de búsqueda.
      // No inspecciona código, claves JSON ni recursos como si fueran prosa.
      assert.doesNotMatch(text, /\b(?:arreglos?|subarreglos?|propiedades|undefined)\b/i, slug);
    }
  }
});

test("las minúsculas de JSON y la salida PROGRAM no sustituyen literales Python", () => {
  const programSlugs: string[] = [];
  for (const { slug, content } of pythonCatalog) {
    const texts = [content.description, content.statement, content.variants[0].explanation,
      ...content.variants[0].tests.filter(item => item.visible).map(item => item.explanation ?? "")];
    if (!texts.some(text => /\b(?:null|true|false)\b/.test(text))) continue;
    if (content.runtimeMode === "PROGRAM") {
      programSlugs.push(slug);
      assert.match(content.statement, /True/);
      assert.match(content.statement, /minúsculas/);
      assert.ok(content.variants[0].tests.filter(item => item.visible).every(item =>
        typeof item.expected === "string" && /^(?:true|false)\n$/.test(item.expected)), slug);
    } else {
      // La propia explicación puede introducir None/JSON; el enunciado también
      // contextualiza ejemplos breves que no necesitan repetir esa definición.
      for (const text of texts.filter(text => /\b(?:null|true|false)\b/.test(text))) {
        const context = `${content.statement}\n${text}`;
        assert.match(context, /JSON/, slug);
        if (/\bnull\b/.test(text)) assert.match(context, /None/, slug);
        if (/\b(?:true|false)\b/.test(text)) assert.match(context, /True.*False/s, slug);
      }
    }
    for (const variant of content.variants) {
      for (const code of [variant.starter, variant.solution]) {
        assert.doesNotMatch(code, /\breturn\s+(?:null|true|false)\b/, slug);
      }
    }
  }
  assert.deepEqual(programSlugs, ["logica-booleano", "logica-igualdad", "logica-alcanza"]);
});

test("solo cambian cuatro listas de prerrequisitos, no las dependencias ni los ejemplos", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonIntroCopy(entry.slug, entry.content) })).map(entry => !(entry.slug in pythonPrerequisiteVocabulary) ? entry
    : { ...entry, content: { ...entry.content, prerequisites: [] } });
  // Calculada antes de editar; incluye prerequisiteSlugs, categorías, orden,
  // versiones, ayudas, ejemplos, código y contratos completos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "28a008d16fb04f97fb2d33319d9353eadb94038a09d5bda5dac0c4dbb2696fc1");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonPrerequisiteVocabulary(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "c89f4cd3841fad9c97a90e9f87ccd31e2255a9c5d5c329cfcb6c2028cdc36392");
});
