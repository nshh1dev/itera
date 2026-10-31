import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonEditorialRevisions } from "../prisma/python-editorial";

test("el primer lote editorial estructura 24 prácticas sin tocar programas ni proyectos", () => {
  const slugs = Object.keys(pythonEditorialRevisions);
  assert.equal(slugs.length, 24);
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    assert.ok(entry, slug);
    assert.equal(entry.content.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.content.variants[0].project, undefined, slug);
    assert.equal(entry.content.statement, pythonEditorialRevisions[slug].statement);
    assert.equal(entry.content.variants[0].statement, entry.content.statement);
    assert.deepEqual([...entry.content.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.doesNotMatch(entry.content.statement, /\barreglos?\b|\bsubarreglo\b|\bUn objeto\b|\bun objeto con\b/i, slug);
    assert.doesNotMatch(entry.content.statement, /Devuelve (null|true|false)\b/, slug);
    assert.ok(entry.content.hints.length >= 3, `${slug}: conserva ayudas progresivas`);
    assert.ok(entry.content.variants[0].explanation.length > 0, `${slug}: conserva explicación de la referencia`);
  }
});

test("los enunciados distinguen representación Python, JSON, límites y desempates", () => {
  const text = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content.statement;
  for (const slug of ["logica-opcional", "logica-mediciones", "logica-notas", "logica-segundo-maximo"]) {
    assert.match(text(slug), /None.*null.*JSON/, slug);
  }
  assert.match(text("logica-palindromo"), /True.*False/);
  assert.match(text("logica-palindromo"), /JSON.*true.*false/);
  assert.match(text("logica-ficha-resultado"), /ficha.*diccionario/);
  assert.match(text("logica-carrito"), /Cada artículo es un diccionario/);
  assert.match(text("logica-pareja"), /menor i.*mayor j/);
  assert.match(text("logica-ventana-suma"), /al menos.*no necesariamente igualarlo/);
  assert.match(text("logica-filas"), /longitudes diferentes o estar vacías/);
  assert.match(text("logica-prefijos"), /posición i.*primeros i elementos/);
  const notes = pythonCatalog.find(entry => entry.slug === "logica-notas")!;
  assert.match(notes.content.hints[2], /Devuelve None/);
  // Las instrucciones de PROGRAM deben conservar el texto exacto de salida,
  // no sustituir true/false por los literales Python.
  assert.match(text("logica-igualdad"), /Muestra true.*false/);
  assert.match(text("logica-alcanza"), /Muestra true.*false/);
});

test("el lote editorial conserva íntegra la evaluación, los ejemplos y los metadatos de recorrido", () => {
  // Huella anterior al lote, sin enunciados. Complementa las pruebas ejecutables
  // por actividad; no genera respuestas esperadas con las soluciones.
  const payload = pythonCatalog.map(entry => ({
    slug: entry.slug, category: entry.category, level: entry.content.level,
    minutes: entry.content.minutes, activityType: entry.content.activityType,
    runtimeMode: entry.content.runtimeMode, conceptRule: entry.content.conceptRule,
    variants: entry.content.variants.map(variant => {
      const { statement: _statement, ...assessment } = variant;
      void _statement;
      return assessment;
    }),
  }));
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "1a6daa5e0e984a6c3897bb9b4e0364fd00b2758f3387282d7d95175e7b08dda5");
});
