import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonCollectionCopyRevisions } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonCollectionCopy, previousCollectionCopy } from "./python-collection-copy-baseline";
import { beforePythonNestedCopy } from "./python-nested-copy-baseline";

const reviewed = [
  "logica-reproduce-fallo", "logica-conserva-regresion", "logica-factorial", "logica-fizzbuzz",
  "logica-mediciones", "logica-carrito", "logica-notas", "logica-saldo",
  "logica-gastos-registro", "logica-gastos-validacion", "python-conjunto-seguro", "python-union",
  "python-interseccion", "python-diferencia", "python-simetrica", "python-subconjunto",
  "logica-repetido", "logica-deduplica", "logica-frecuencias", "logica-primer-unico",
  "logica-anagramas", "python-crea-grupo", "logica-agrupa-registros", "python-comprension",
  "python-comprension-filtro", "python-comprension-condicional", "python-comprension-dict", "python-iterador",
  "python-generador", "python-map", "python-filter", "python-agrega",
];

test("el cuarto contraste entre superficies alcanza 128 actividades con dieciocho ajustes", () => {
  assert.deepEqual(pythonCatalog.slice(96, 128).map(entry => entry.slug), reviewed);
  assert.deepEqual(Object.keys(pythonCollectionCopyRevisions), Object.keys(previousCollectionCopy));
  assert.equal(Object.keys(pythonCollectionCopyRevisions).length, 18);
  let descriptions = 0;
  for (const [slug, revision] of Object.entries(pythonCollectionCopyRevisions)) {
    assert.ok(reviewed.includes(slug), slug);
    assert.equal(Object.keys(revision).length, 1, slug);
    const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
    for (const [field, value] of Object.entries(revision)) {
      assert.ok(["description", "hints"].includes(field), field);
      assert.deepEqual(content[field as keyof typeof revision], value, slug);
      if (field === "description") {
        descriptions++;
        assert.notEqual(content.description, content.objective, slug);
      }
    }
  }
  assert.equal(descriptions, 16);
});

test("los resúmenes conservan conceptos, vacíos, orden y evaluación diferida", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  const concepts: Record<string, RegExp> = {
    "python-conjunto-seguro": /discard.*a diferencia de remove.*añadir agregar y después descartar quitar/s,
    "python-union": /A \| B.*al menos una entrada.*sin repeticiones/s,
    "python-interseccion": /A & B.*presentes en ambas entradas.*entrada vacía/s,
    "python-diferencia": /requeridos - disponibles.*faltantes, no sobrantes/s,
    "python-simetrica": /A \^ B.*ambos lados.*no equivale a A - B/s,
    "python-subconjunto": /incluye la igualdad.*No compara tamaños.*Sin requisitos devuelve True/s,
    "python-crea-grupo": /comparte sus listas.*lista nueva por categoría.*nombres repetidos/s,
    "python-comprension": /sin filtro no elimina posiciones.*incluidas repeticiones/s,
    "python-comprension-filtro": /if posterior al for.*lower.*vocales repetidas/s,
    "python-comprension-condicional": /obtiene un valor en cada posición.*elimina posiciones.*mismo tamaño/s,
    "python-comprension-dict": /diccionario, no un conjunto.*Una clave repetida reemplaza/s,
    "python-iterador": /mismo iterador no reinicia.*original conserva sus elementos/s,
    "python-generador": /bajo demanda.*no el consumo de memoria.*ni el uso de un generador/s,
    "python-map": /no transforma todos los elementos al crearlo.*sin llamarla por adelantado.*no textos repetidos/s,
    "python-filter": /al pedir resultados.*sin transformarlos.*un rechazo no termina/s,
    "python-agrega": /default=None.*negativos y cero.*None \(null en JSON\)/s,
  };
  for (const [slug, concept] of Object.entries(concepts)) {
    assert.match(content(slug).statement, concept, slug);
    assert.equal(content(slug).hints.length, 3, slug);
  }
  for (const slug of ["logica-repetido", "logica-anagramas"] as const) {
    assert.deepEqual(content(slug).hints.slice(0, 2), previousCollectionCopy[slug].hints.slice(0, 2));
    assert.match(content(slug).hints[2], /True/);
    assert.match(content(slug).statement, /True.*False.*JSON/s);
  }
  assert.match(content("logica-anagramas").hints[2], /False.*True fuera de ese bucle/s);
});

test("solo cambian dieciséis descripciones y dos listas de pistas en Python", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonNestedCopy(entry.slug, entry.content) })).map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !Object.keys(pythonCollectionCopyRevisions[entry.slug] ?? {}).includes(field)),
  ) }));
  // Calculada antes de editar; protege los demás campos y las 14 actividades
  // conservadas, incluidos manifiestos, código, enunciados y los 433 ejemplos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "fccb33b2c77b5834e5173291ae489585939267156e0cb30f0e840663afffd986");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonCollectionCopy(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "e9ae5f4540b6cb805a44ac7ff12952697e0547216a872caba4edfd50fde8b8da");
});
