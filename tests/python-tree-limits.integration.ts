// Opt-in, sin Next ni base de datos. Solo referencias fijas; todo código Python
// se ejecuta mediante el adaptador del producto dentro de Piston, nunca en el host.
import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { performance } from "node:perf_hooks";
import { pythonCatalog } from "../prisma/python-content";
import type { Json } from "../src/lib/types";
import { executionRequestTimeoutMs } from "../src/lib/execution-limits";
import { availableRuntime, runCode } from "../src/server/execution/piston";
import { judge } from "../src/server/execution/judge";

const enabled = process.env.ITERA_PYTHON_TREE_LIMITS === "1";
const options = { skip: enabled ? false : "Requiere ITERA_PYTHON_TREE_LIMITS=1 y Piston real", timeout: 120000 };
type Tree = { value: number; left: Tree | null; right: Tree | null };
const node = (value: number, left: Tree | null = null, right: Tree | null = null): Tree => ({ value, left, right });
const sequence = (size: number, offset = 0) => Array.from({ length: size }, (_, index) => offset + index + 1);
function complete(size: number, index = 1, offset = 0): Tree | null {
  return index > size ? null : node(offset + index, complete(size, index * 2, offset), complete(size, index * 2 + 1, offset));
}
function chain(side: "left" | "right"): Tree {
  let tree: Tree | null = null;
  for (let index = 50; index >= 1; index--) tree = node(side === "right" ? index : 51 - index, side === "left" ? tree : null, side === "right" ? tree : null);
  return tree!;
}
// Oráculo de preorden por etiquetas de caminos del árbol completo, independiente
// de las referencias Python recursivas. No se ejecuta la referencia para esperados.
const completePreorder = (size: number, offset = 0) => sequence(size)
  .sort((a, b) => {
    const first = a.toString(2).slice(1), second = b.toString(2).slice(1);
    return first < second ? -1 : first > second ? 1 : 0;
  }).map(value => value + offset);

function boundary(size: number) {
  const tailHeight = size === 100 ? 6 : 9;
  const prefix = 50 - tailHeight;
  const tailSize = size - prefix;
  let tree = complete(tailSize, 1, prefix)!;
  for (let value = prefix; value >= 1; value--) tree = node(value, null, tree);
  return { tree, size, height: 50, preorder: [...sequence(prefix), ...completePreorder(tailSize, prefix)],
    levels: sequence(size), bst: false,
    ancestor: { a: prefix + 32, b: prefix + 33, expected: prefix + 16 } };
}

const slugs = ["logica-cuenta-nodos", "logica-altura", "logica-preorden", "logica-niveles", "logica-arbol-busqueda", "logica-ancestro"] as const;
for (const slug of slugs) test(`límites reales Python de árboles: ${slug}`, options, async t => {
  // Opt-in sin ejecutor/runtime falla: no convierte falta de infraestructura en éxito.
  const runtime = await availableRuntime("python");
  const entry = pythonCatalog.find(item => item.slug === slug)!;
  const variant = entry.content.variants[0];
  const size = slug === "logica-cuenta-nodos" || slug === "logica-ancestro" ? 100 : 500;
  assert.equal(entry.content.runtimeMode, "FUNCTION");
  assert.match(variant.statement || entry.content.statement, new RegExp(`hasta ${size} nodos`));
  assert.match(variant.statement || entry.content.statement, /profundidad máxima 50/);
  const right = sequence(50), left = [...right].reverse();
  const shapes = [
    { tree: chain("right"), size: 50, height: 50, preorder: right, levels: right, bst: true, ancestor: { a: 25, b: 50, expected: 25 } },
    { tree: chain("left"), size: 50, height: 50, preorder: left, levels: left, bst: true, ancestor: { a: 25, b: 1, expected: 25 } },
    { tree: complete(size), size, height: Math.floor(Math.log2(size)) + 1, preorder: completePreorder(size), levels: sequence(size), bst: false, ancestor: { a: 64, b: 65, expected: 32 } },
    boundary(size),
  ];
  for (const shape of shapes) {
    const pending = [{ tree: shape.tree!, depth: 1 }];
    let count = 0, depth = 0;
    while (pending.length) {
      const item = pending.pop()!;
      count++; depth = Math.max(depth, item.depth);
      for (const child of [item.tree.left, item.tree.right]) if (child) pending.push({ tree: child, depth: item.depth + 1 });
    }
    assert.equal(count, shape.size);
    assert.equal(depth, shape.height);
  }
  const expectedFor = (shape: typeof shapes[number]): Json => ({
    "logica-cuenta-nodos": shape.size, "logica-altura": shape.height,
    "logica-preorden": shape.preorder, "logica-niveles": shape.levels,
    "logica-arbol-busqueda": shape.bst, "logica-ancestro": shape.ancestor.expected,
  })[slug];
  const cases = [...variant.tests.map(fixture => ({ input: fixture.input as Json, expected: fixture.expected as Json })),
    ...shapes.map(shape => ({ input: slug === "logica-ancestro"
      ? { tree: shape.tree, a: shape.ancestor.a, b: shape.ancestor.b } : shape.tree as Json, expected: expectedFor(shape) }))];
  const largest = shapes.at(-1)!;
  let orderedBoundary: Tree | undefined;
  // Un árbol de búsqueda equilibrado válido obliga a visitar ambas ramas completas.
  if (slug === "logica-arbol-busqueda") {
    const ordered = (start: number, end: number): Tree | null => {
      if (start >= end) return null;
      const middle = Math.floor((start + end) / 2);
      return node(middle, ordered(start, middle), ordered(middle + 1, end));
    };
    cases.push({ input: ordered(0, size), expected: true });
    // También tamaño y profundidad máximos juntos, con propiedad válida: una
    // infracción junto a la raíz permitiría terminar antes de recorrer 500 nodos.
    orderedBoundary = structuredClone(largest.tree!);
    const stack: Tree[] = [];
    let current: Tree | null = orderedBoundary, value = 0;
    while (current || stack.length) {
      while (current) { stack.push(current); current = current.left; }
      current = stack.pop()!;
      current.value = ++value;
      current = current.right;
    }
    assert.equal(value, size);
    cases.push({ input: orderedBoundary, expected: true });
  }
  const durations: number[] = [], outputBytes: number[] = [];
  for (const [order, fixture] of cases.entries()) {
    const start = performance.now();
    const output = await runCode("python", runtime, variant.solution, fixture.input);
    durations.push(performance.now() - start);
    outputBytes.push(Buffer.byteLength(output.stdout));
    assert.equal(judge(output, { ...fixture, visible: false, order }).status, "passed", `${slug}: caso ${order + 1}`);
    assert.ok(durations.at(-1)! < executionRequestTimeoutMs("python"));
    assert.ok(outputBytes.at(-1)! < 65536, "salida dentro de los 64 KiB configurados en Piston");
  }
  // Ida y vuelta del árbol de tamaño/profundidad máximos por el mismo conductor
  // JSON que usa solve: no basta con ejecutar una función de altura escalar.
  const roundTrip = await runCode("python", runtime, "def solve(data):\n    return data\n", largest.tree);
  assert.equal(judge(roundTrip, { input: largest.tree, expected: largest.tree, visible: false, order: 0 }).status, "passed");
  const roundTripBytes = Buffer.byteLength(roundTrip.stdout);
  assert.ok(roundTripBytes < 65536);
  // Medición acotada del proceso de la referencia, no del pico total del cgroup
  // ni de la serialización posterior. No cambia recursionlimit ni presupuestos.
  const probe = `${variant.solution}\n__reference = solve\ndef solve(data):\n    import resource, sys\n    value = __reference(data)\n    return [value, resource.getrusage(resource.RUSAGE_SELF).ru_maxrss, sys.getrecursionlimit()]\n`;
  const input: Json = slug === "logica-ancestro" ? { tree: largest.tree, a: largest.ancestor.a, b: largest.ancestor.b } : orderedBoundary ?? largest.tree;
  const measured = await runCode("python", runtime, probe, input);
  assert.equal(measured.code, 0);
  assert.ok(!measured.signal && !measured.status);
  const metrics: unknown = JSON.parse(measured.stdout.trim().split(/\r?\n/).at(-1)!);
  assert.ok(Array.isArray(metrics) && metrics.length === 3);
  assert.deepEqual(metrics[0], orderedBoundary ? true : expectedFor(largest));
  assert.ok(typeof metrics[1] === "number" && metrics[1] > 0 && metrics[1] < 262144);
  assert.ok(typeof metrics[2] === "number" && metrics[2] > 50);
  t.diagnostic(JSON.stringify({ slug, runtime: runtime.version, cases: cases.length, maxNodes: size, maxDepth: 50,
    maxCaseMs: Math.ceil(Math.max(...durations)), maxOutputBytes: Math.max(...outputBytes), roundTripBytes,
    referencePeakRssKiB: metrics[1], recursionLimit: metrics[2] }));
});
