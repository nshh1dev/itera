import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";

const slugs = ["logica-dos-parametros", "python-desempaqueta", "logica-ficha-resultado", "python-recorre-pares", "logica-notas", "python-contactos-edita", "logica-prefijos", "logica-copia-anidada", "logica-suma-maxima", "logica-cuenta-nodos"];

test("diez explicaciones de solución usan vocabulario Python y justifican la referencia", () => {
  assert.deepEqual(new Set(Object.keys(pythonSolutionExplanations)), new Set(slugs));
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    const text = entry.content.variants[0].explanation;
    assert.equal(text, pythonSolutionExplanations[slug], slug);
    assert.doesNotMatch(text, /\b(?:arreglos?|propiedades?|push)\b/i, slug);
    if (/\bnull\b/.test(text)) assert.match(text, /None.*null.*JSON/, slug);
  }
  assert.match(pythonSolutionExplanations["python-desempaqueta"], /tupla.*lista en JSON/);
  assert.match(pythonSolutionExplanations["python-contactos-edita"], /copia cada ficha.*texto vacío.*claves desconocidas/s);
  assert.match(pythonSolutionExplanations["logica-notas"], /sin dividir entre cero.*media válida de 0/s);
  assert.match(pythonSolutionExplanations["logica-prefijos"], /n \+ 1.*O\(n\)/);
  assert.match(pythonSolutionExplanations["logica-copia-anidada"], /filas compartidas.*celdas son enteros.*no demuestra identidad/s);
  const maximum = pythonCatalog.find(item => item.slug === "logica-suma-maxima")!;
  assert.ok(maximum.content.variants[0].solution.includes("data[1:]"));
  assert.match(maximum.content.variants[0].explanation, /slice ocupa O\(n\) de espacio auxiliar/);
  assert.match(pythonSolutionExplanations["logica-cuenta-nodos"], /antes de consultar claves.*value no interviene/s);
});

test("solo cambian las diez explicaciones: se conservan todos los demás campos del catálogo", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: entry.content.variants.map(variant => {
    if (!slugs.includes(entry.slug)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "8e1b81eec7e2574fc026c8e38c26185962e9a9a06e821235f7831ae4e639ffff");
});
