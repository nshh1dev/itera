import { test } from "node:test";
import assert from "node:assert/strict";
import { pythonCatalog } from "../prisma/python-content";
import { pythonCosts } from "../prisma/python-costs";
import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent } from "../prisma/editorial-revision";

test("el coste Python es explícito u omitido, sin instrucciones genéricas ni cambios en otras fuentes", () => {
  const generic = /Explica cuántos datos recorres|Cuenta los elementos recorridos/;
  for (const entry of pythonCatalog) {
    assert.doesNotMatch(entry.content.complexity, generic, entry.slug);
    if (!entry.baseline) assert.ok(Object.hasOwn(pythonCosts, entry.slug), `${entry.slug}: decisión editorial explícita`);
    if (entry.slug in pythonCosts) assert.equal(entry.content.complexity, pythonCosts[entry.slug]);
    else if (entry.baseline) assert.equal(entry.content.complexity, entry.baseline.complexity, `${entry.slug}: coste previo conservado`);
  }
  for (const [slug, note] of Object.entries(pythonCosts)) {
    assert.ok(note.length <= 200, `${slug}: límite editorial de 200 caracteres`);
    const entry = pythonCatalog.find(entry => entry.slug === slug);
    assert.ok(entry, `${slug}: actividad existente`);
    if (note) assert.match(note, /referencia/, `${slug}: coste de una estrategia, no de cualquier solución`);
    if (entry.baseline) {
      const source = logicExercises.find(exercise => exercise.slug === slug)!;
      assert.equal(seedVersionContent(source).complexity, entry.baseline.complexity, `${slug}: fuente compartida intacta`);
    }
  }
});

test("las notas distinguen salida, copias, textos, recorridos y persistencia sin medir al alumno", () => {
  assert.equal(pythonCosts["python-constante"], "");
  assert.equal(pythonCosts["python-condicional"], "");
  assert.equal(pythonCosts["logica-importa-preparado"], "");
  assert.match(pythonCosts["python-recorta"], /O\(k\)/);
  assert.match(pythonCosts["python-generador"], /memoria auxiliar O\(1\)/);
  assert.match(pythonCosts["python-map"], /lista final/);
  assert.match(pythonCosts["python-agrega"], /tres veces/);
  assert.match(pythonCosts["python-comprension-filtro"], /texto intermedio/);
  assert.match(pythonCosts["python-academia-califica"], /nota rechazada/);
  assert.match(pythonCosts["python-contactos-busca"], /búsquedas de fragmentos/);
  assert.match(pythonCosts["logica-agenda-operaciones"], /O\(c × t\)/);
  assert.match(pythonCosts["logica-inventario-persistente"], /JSON leído y escrito/);
  assert.match(pythonCosts["logica-actualiza-persistidos"], /estado anterior/);
});
