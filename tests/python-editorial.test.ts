import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonEditorialRevisions } from "../prisma/python-editorial";

test("los lotes editoriales estructuran 48 prácticas sin tocar programas ni proyectos", () => {
  const slugs = Object.keys(pythonEditorialRevisions);
  assert.equal(slugs.length, 48);
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    assert.ok(entry, slug);
    assert.equal(entry.content.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.content.variants[0].project, undefined, slug);
    assert.equal(entry.content.statement, pythonEditorialRevisions[slug].statement);
    assert.equal(entry.content.variants[0].statement, entry.content.statement);
    assert.deepEqual([...entry.content.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.doesNotMatch(entry.content.statement, /\barreglos?\b|\bsubarreglo\b|\bun objeto con\b/i, slug);
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

test("el lote avanzado conserva reglas deterministas, límites, ausencias y objetivos de práctica", () => {
  const advanced = pythonCatalog.filter(entry => entry.content.level === "ADVANCED");
  assert.deepEqual(advanced.filter(entry => entry.slug in pythonEditorialRevisions).map(entry => entry.slug), advanced.slice(0, 24).map(entry => entry.slug));
  const text = (slug: string) => pythonEditorialRevisions[slug].statement;
  for (const slug of ["logica-cuenta-nodos", "logica-altura", "logica-preorden", "logica-niveles", "logica-arbol-busqueda", "logica-ancestro"]) {
    assert.match(text(slug), /value.*left.*right/, slug);
    assert.match(text(slug), /profundidad máxima 50/, slug);
    assert.match(text(slug), /None.*null/, slug);
  }
  assert.match(text("logica-cuenta-nodos"), /hasta 100 nodos/);
  assert.match(text("logica-altura"), /hasta 500 nodos/);
  assert.match(text("logica-arbol-busqueda"), /todos los antecesores/);
  assert.match(text("logica-ancestro"), /pueden ser iguales.*no tiene por qué ser de búsqueda/);
  assert.match(text("logica-monticulo-inserta"), /No intercambies iguales/);
  assert.match(text("logica-monticulo-extrae"), /empate.*izquierdo/);
  assert.match(text("logica-monticulo-extrae"), /minimo es None.*heap es \[\]/);
  assert.match(text("logica-subconjuntos"), /empieza con \[\[\]\].*copias de los subconjuntos actuales/);
  assert.match(text("logica-permutaciones"), /hasta 6 enteros distintos entre -1000 y 1000/);
  assert.match(text("logica-permutaciones"), /valores numéricos/);
  assert.match(text("logica-combinaciones"), /target cero devuelve \[\[\]\]/);
  assert.match(text("logica-reinas"), /simetrías como soluciones diferentes/);
  assert.match(text("logica-combina-archivos"), /no necesitas abrir ni escribir archivos reales/);
  assert.match(text("logica-mochila"), /peso cero.*una vez.*capacidad cero/);
  assert.match(text("logica-caminos-obstaculos"), /solo a la derecha o abajo/);
  assert.match(text("logica-monedas"), /amount cero devuelve 0 incluso sin denominaciones/);
  assert.match(text("logica-subsecuencia-comun"), /puede saltar caracteres/);
  assert.match(text("logica-escalera"), /orden distingue formas/);
});
