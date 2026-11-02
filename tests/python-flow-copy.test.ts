import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonFlowCopyRevisions } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonFlowCopy, previousFlowCopy } from "./python-flow-copy-baseline";

const reviewed = [
  "logica-elige-mensaje", "logica-signo", "logica-mayor-tres", "logica-dos-requisitos",
  "logica-alternativas", "logica-tarifa", "python-condicional", "logica-uno-n",
  "logica-cuenta-atras", "logica-suma-uno-n", "logica-tabla", "logica-multiplos",
  "logica-bucle-roto", "python-centinela", "python-omite-negativos", "logica-posicion",
  "logica-indices", "logica-suma-lista", "logica-maximo", "logica-cuenta-condicion",
  "logica-filtra-lista", "logica-busqueda-lineal", "logica-longitud-texto", "logica-minusculas",
  "logica-vocales", "logica-invierte", "logica-elimina-caracter", "logica-palabras",
  "python-ordena-numeros", "python-recorta", "python-une-palabras", "python-desempaqueta",
];

test("el segundo contraste entre superficies alcanza 64 actividades con ocho ajustes nuevos", () => {
  assert.deepEqual(pythonCatalog.slice(32, 64).map(entry => entry.slug), reviewed);
  assert.deepEqual(Object.keys(pythonFlowCopyRevisions), Object.keys(previousFlowCopy));
  assert.equal(Object.keys(pythonFlowCopyRevisions).length, 8);
  for (const [slug, revision] of Object.entries(pythonFlowCopyRevisions)) {
    assert.ok(reviewed.includes(slug), slug);
    assert.equal(Object.keys(revision).length, 1, slug);
    const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
    for (const [field, value] of Object.entries(revision)) {
      assert.ok(["description", "hints"].includes(field), field);
      assert.deepEqual(content[field as keyof typeof revision], value, slug);
    }
    if (slug !== "logica-dos-requisitos") assert.notEqual(content.description, content.objective, slug);
  }
});

test("los resúmenes conservan las distinciones conceptuales y los límites en el enunciado", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  const concepts: Record<string, RegExp> = {
    "python-condicional": /if condicion else.*desde los 18.*no certifican/s,
    "python-centinela": /break.*termina inmediatamente.*No incluyas ese cero ni los elementos posteriores/s,
    "python-omite-negativos": /continue.*a diferencia de break.*conservando ceros y repeticiones/s,
    "python-ordena-numeros": /sorted.*sort\(\).*devuelve None.*con sus repeticiones/s,
    "python-recorta": /lista\[a:b\].*inicio incluido hasta fin excluido.*coinciden, devuelve \[\]/s,
    "python-une-palabras": /split\(\).*split\(' '\).*Conserva mayúsculas y signos/s,
    "python-desempaqueta": /a, b = b, a.*primero la derecha.*tupla.*lista en JSON/s,
  };
  for (const [slug, concept] of Object.entries(concepts)) {
    assert.match(content(slug).statement, concept, slug);
    assert.equal(content(slug).hints.length, 3, slug);
  }
  assert.deepEqual(content("logica-dos-requisitos").hints.slice(0, 2), previousFlowCopy["logica-dos-requisitos"].hints.slice(0, 2));
  assert.match(content("logica-dos-requisitos").hints[2], /booleanos con and.*conserva las comparaciones/);
  assert.match(content("logica-dos-requisitos").statement, /Cero cumple ambas condiciones.*JSON/s);
});

test("solo cambian siete descripciones y una lista de pistas en Python", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !Object.keys(pythonFlowCopyRevisions[entry.slug] ?? {}).includes(field)),
  ) }));
  // Calculada antes de editar; conserva las otras 24 actividades del bloque,
  // todos los enunciados, objetivos, ejemplos, soluciones, casos y recorrido.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "d24e4e58f13cdb9bc82785617a85c98421bab2cfbc791599bdfa457a42ffd6f6");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonFlowCopy(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "24642cf0e58f1ea9bcdd7099fe09011dab86eaab8767426f0673005c1b47c008");
});
