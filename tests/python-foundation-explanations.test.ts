import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonFoundationExplanations } from "../prisma/python-foundation-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { beforePythonCollections } from "./python-collection-baseline";

test("las primeras 16 actividades propias tienen explicaciones revisadas sin copiar la teoría inicial", () => {
  const entries = pythonCatalog.filter(entry => pythonLessons.has(entry.slug)).slice(0, 16);
  const revised = entries.filter(entry => entry.slug !== "python-desempaqueta");
  assert.equal(Object.keys(pythonFoundationExplanations).length, 15);
  assert.deepEqual(new Set(Object.keys(pythonFoundationExplanations)), new Set(revised.map(entry => entry.slug)));
  assert.equal(entries.find(entry => entry.slug === "python-desempaqueta")!.content.variants[0].explanation, pythonSolutionExplanations["python-desempaqueta"]);
  for (const entry of revised) {
    const text = entry.content.variants[0].explanation;
    assert.equal(text, pythonFoundationExplanations[entry.slug], entry.slug);
    assert.ok(!text.includes(pythonLessons.get(entry.slug)!.theory), entry.slug);
    assert.doesNotMatch(text, /\b(?:arreglos?|propiedades?|push)\b/i, entry.slug);
  }
  assert.equal(new Set([...Object.keys(pythonFoundationExplanations), ...Object.keys(pythonSolutionExplanations)]).size, 43);
});

test("las explicaciones justifican fronteras, retornos, alias y el alcance de las copias", () => {
  const texts = pythonFoundationExplanations;
  assert.match(texts["python-constante"], /18.*Python no impide reasignarla/);
  assert.match(texts["python-decimal"], /float\(texto\).*sumar 0.5.*no aplica un formato de dos decimales/);
  assert.match(texts["python-condicional"], /18.*adulto.*17.*menor/);
  assert.match(texts["python-centinela"], /antes de append.*sin añadir el cero.*incluidos negativos y repeticiones/);
  assert.match(texts["python-omite-negativos"], /cero no cumple.*Con break.*posteriores/);
  assert.match(texts["python-ordena-numeros"], /data.sort\(\).*None.*original no es una copia independiente/);
  assert.match(texts["python-recorta"], /\[3, 5\].*fin queda fuera.*no hace falta sumar uno/i);
  assert.match(texts["python-une-palabras"], /Sol\\tLuna.*Sol Luna.*no usa lower/);
  assert.match(texts["python-enumera"], /repetidas tienen posiciones distintas.*omitirlo empezaría en cero/);
  assert.match(texts["python-empareja"], /\[\[1, 3\]\].*no se rellena.*vacía/);
  assert.match(texts["python-retorno-multiple"], /una vez.*tupla.*lista en JSON/);
  assert.match(texts["python-identidad"], /superficiales.*contenedores interiores.*compartidos.*solo se añade a la lista exterior/);
  assert.match(texts["python-opcional-seguro"], /\[\[2\], \[2\]\].*entre las dos llamadas.*explícitamente/);
  assert.match(texts["python-actualiza-diccionario"], /cero es un valor.*copia superficial basta.*enteros/);
  assert.match(texts["python-borra-clave"], /retorno de pop no se usa.*cero.*devuelve copia, no el valor eliminado/);
});

test("el tercer lote solo cambia 15 explicaciones, conservando las 28 anteriores y todo el resto", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...beforePythonCollections(entry.slug, entry.content), variants: beforePythonCollections(entry.slug, entry.content).variants.map(variant => {
    if (!(entry.slug in pythonFoundationExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar la prosa: protege también minutos, ejemplos y ayudas.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "10d48352196ae7c04ac9bc87ce1c475339e6e31ce28b6bbcbdf980e521e1b6d0");
});
