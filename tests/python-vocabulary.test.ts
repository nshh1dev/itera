import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonVocabularyRevisions } from "../prisma/python-vocabulary";

const fields = ["description", "objective", "constraints", "hints", "commonErrors", "practiceGoals"] as const;

test("el lote de vocabulario aplica 22 revisiones explícitas solo a metadatos y ayudas", () => {
  assert.equal(Object.keys(pythonVocabularyRevisions).length, 22);
  for (const [slug, revision] of Object.entries(pythonVocabularyRevisions)) {
    const entry = pythonCatalog.find(item => item.slug === slug);
    assert.ok(entry, slug);
    for (const [key, value] of Object.entries(revision)) {
      assert.ok(fields.includes(key as typeof fields[number]), `${slug}: ${key}`);
      assert.deepEqual(entry.content[key as typeof fields[number]], value, `${slug}: ${key}`);
    }
  }
});

test("las ayudas y descripciones distinguen listas, claves y ausencia de representaciones JSON", () => {
  for (const entry of pythonCatalog) {
    for (const field of fields) {
      const value = entry.content[field];
      for (const text of Array.isArray(value) ? value : [value]) {
        assert.doesNotMatch(text, /\b(?:arreglos?|subarreglos?|push|propiedades?)\b/i, `${entry.slug}: ${field}`);
        if (/\bnull\b/.test(text)) {
          assert.match(text, /\bNone\b/, `${entry.slug}: ${field}: ausencia Python`);
          assert.match(text, /JSON/, `${entry.slug}: ${field}: representación`);
        }
      }
    }
  }
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  assert.match(content("logica-booleano").description, /True.*true.*minúsculas/);
  assert.match(content("logica-alternativas").practiceGoals[0], /or.*not/);
  assert.match(content("logica-indices").hints[2], /append/);
  assert.match(content("logica-ficha-producto").hints[0], /ficha.*diccionario/);
  assert.match(content("logica-ausencia").practiceGoals[0], /None sin descartar cero/);
  // Objeto es correcto para identidad Python o elementos físicos: no sustituirlo.
  assert.match(content("logica-registro-compartido").hints[0], /mismo objeto/);
  assert.match(content("python-map").commonErrors[1], /objeto map/);
  assert.match(content("logica-mochila").constraints[0], /objetos/);
});

test("el vocabulario no cambia enunciados, evaluación, archivos, orden, niveles ni tiempos", () => {
  const payload = pythonCatalog.map(entry => {
    const { description, objective, hints, constraints, practiceGoals, commonErrors, ...content } = entry.content;
    void [description, objective, hints, constraints, practiceGoals, commonErrors];
    return { slug: entry.slug, category: entry.category, content };
  });
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "d10eac0f644da52469a3021241e9319ff874278ad65c05b1059c2b8f495171d8");
});
