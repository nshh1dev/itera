import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { pythonRecordVocabularyRevisions } from "../prisma/python-vocabulary";
import { beforePythonRecordVocabulary, previousRecordVocabulary } from "./python-record-vocabulary-baseline";

test("el segundo lote de vocabulario acota ocho actividades y dieciséis campos", () => {
  assert.deepEqual(Object.keys(pythonRecordVocabularyRevisions), Object.keys(previousRecordVocabulary));
  assert.equal(Object.keys(pythonRecordVocabularyRevisions).length, 8);
  let fields = 0;
  for (const [slug, revision] of Object.entries(pythonRecordVocabularyRevisions)) {
    const entry = pythonCatalog.find(item => item.slug === slug);
    assert.ok(entry, slug);
    assert.deepEqual(Object.keys(revision), Object.keys(previousRecordVocabulary[slug as keyof typeof previousRecordVocabulary]), slug);
    for (const [field, value] of Object.entries(revision)) {
      assert.ok(["description", "objective", "hints", "practiceGoals"].includes(field), field);
      assert.deepEqual(entry.content[field as keyof typeof revision], value, `${slug}: ${field}`);
      fields++;
    }
  }
  assert.equal(fields, 16);
});

test("las ayudas distinguen diccionarios de nombres y valores de historial", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  for (const slug of ["logica-ficha-producto", "logica-agrupa-registros", "logica-ordena-registros"]) {
    assert.match(content(slug).description, /diccionario/, slug);
  }
  assert.match(content("logica-ficha-resultado").objective, /ficha.*diccionario/);
  assert.match(content("logica-registro-compartido").hints[0], /mismo objeto.*mismo diccionario/);
  assert.match(content("python-lista-registros").hints[0], /registro.*ficha.*diccionario.*aunque se repita/);
  assert.match(content("python-crea-grupo").objective, /lista.*nombre de texto/);
  assert.match(content("logica-actualiza-persistidos").objective, /valores enteros anteriores y su orden/);
  // Se aclara la primera pista sin retirar los siguientes peldaños ni cambiar
  // nombres de variables, claves o la mutación intencional del reto de alias.
  for (const slug of ["logica-registro-compartido", "python-lista-registros"] as const) {
    assert.deepEqual(content(slug).hints.slice(1), previousRecordVocabulary[slug].hints.slice(1));
  }
  assert.match(content("logica-registro-compartido").objective, /intencionalmente/);
  assert.match(content("logica-mochila").constraints[0], /objetos/);
  assert.match(content("python-map").commonErrors[1], /objeto map/);
});

test("el lote conserva todos los campos ajenos y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !Object.keys(pythonRecordVocabularyRevisions[entry.slug] ?? {}).includes(field)),
  ) }));
  // Calculada antes de editar; conserva íntegros enunciados, teoría, ejemplos,
  // código, evaluación, archivos, orden, tiempos y todo metadato no autorizado.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "689257cc003e140243e9ccbfe873dbd85cfa0c35123d60c2b2b603df00f0cc98");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonRecordVocabulary(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "5a6fd6efedc8d0e0524abb4382fc7f88c766c18a3f97f4e084a91fe0a4bae06c");
});
