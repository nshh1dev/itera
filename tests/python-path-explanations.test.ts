import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonPathExplanations } from "../prisma/python-path-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonPaths } from "./python-path-baseline";

const retained = ["logica-dijkstra"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("las últimas siete explicaciones completan 224 identidades revisadas: seis ajustes y Dijkstra conservado", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug) && !(entry.slug in pythonSolutionExplanations));
  const block = common.slice(144);
  assert.equal(Object.keys(pythonPathExplanations).length, 6);
  assert.equal(block.length, 7);
  assert.deepEqual(new Set(block.map(entry => entry.slug)), new Set([...Object.keys(pythonPathExplanations), ...retained]));
  for (const entry of block) {
    assert.equal(entry.content.runtimeMode, "FUNCTION", entry.slug);
    const text = entry.content.variants[0].explanation;
    if (entry.slug in pythonPathExplanations) assert.equal(text, pythonPathExplanations[entry.slug], entry.slug);
    assert.doesNotMatch(text, /En Python utiliza la sangría|En Python\n|Paso a paso\n|Coste\n/, entry.slug);
  }
  const reviewed = new Set([...pythonLessons.keys(), ...Object.keys(pythonSolutionExplanations), ...common.map(entry => entry.slug)]);
  assert.equal(reviewed.size, 224);
  assert.deepEqual(reviewed, new Set(pythonCatalog.map(entry => entry.slug)));
});

test("las explicaciones precisan marcas, distancias, fronteras, prefijos y paralelismo del código real", () => {
  const text = pythonPathExplanations;
  assert.match(content("logica-dijkstra").variants[0].explanation, /sin montículo.*O\(n² \+ m\).*O\(n \+ m\)/);
  assert.match(text["logica-islas"], /otra matriz.*marca antes de apilar.*diagonales no conectan.*visitados y pila/);
  assert.match(text["logica-laberinto"], /antes de añadirla.*retroceder o subir.*sin salir al descubrir la meta.*no escribe en data/);
  assert.match(text["logica-capacidad"], /llenar exactamente no abre otro.*respuesta es 5.*alto = medio.*bajo = medio \+ 1.*no se ordenan/);
  assert.match(text["logica-edicion"], /izquierda \+ 1.*arriba \+ 1.*diagonal.*1 si difieren y 0 si coinciden.*dos filas/);
  assert.match(text["logica-subsecuencia-creciente"], /data\[j\] < data\[i\].*\[1, 1, 2, 1\].*no el 1 de la última posición.*no implementa la alternativa/);
  assert.match(text["logica-planifica-tareas"], /no suma los finales.*grado llega a cero.*devuelve 8.*duración cero no elimina dependencias.*default=0/);
});

test("el cierre de explicaciones conserva todo salvo seis textos y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: entry.content.variants.map(variant => {
    if (!(entry.slug in pythonPathExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar: protege Dijkstra, las 217 revisadas y demás campos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "0468d2995349d8cfcb4b43171ee1ccc6695a3f7f7d1b42b2a235e0cac85cbed1");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonPaths(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "bcd62b435f85067e305b115f9a1749e8fc1406831f6e63ec364524e5a2507a2e");
});

// Solo referencias fijas; no acredita técnicas, identidad, toda mutación intermedia
// ni límites de ejecución de programas de estudiantes en el sandbox real.
const examples: Record<string, [Json, Json][]> = {
  "logica-dijkstra": [[{ n: 3, aristas: [[0, 2, 10], [0, 1, 2], [1, 2, 3]], destino: 2 }, 5], [{ n: 3, aristas: [[1, 0, 2], [2, 1, 3]], destino: 2 }, 5], [{ n: 2, aristas: [], destino: 1 }, -1], [{ n: 1, aristas: [], destino: 0 }, 0]],
  "logica-islas": [[[[1, 0], [0, 1]], 2], [[[1, 1]], 1], [[[0, 0]], 0], [[], 0], [[[], []], 0]],
  "logica-laberinto": [[[[0, 1], [0, 0]], 2], [[[0]], 0], [[[1]], -1], [[[0, 0], [0, 1]], -1], [[[0, 1, 0], [1, 1, 0], [0, 0, 0]], -1], [[[0, 1, 1, 1, 1], [0, 1, 1, 1, 1], [0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0]], 12]],
  "logica-capacidad": [[{ pesos: [3, 2, 2, 4, 1], dias: 3 }, 5], [{ pesos: [1, 2, 3], dias: 3 }, 3], [{ pesos: [3, 2, 2, 4, 1], dias: 1 }, 12], [{ pesos: [4], dias: 1 }, 4]],
  "logica-edicion": [[{ a: "ab", b: "ba" }, 2], [{ a: "", b: "abc" }, 3], [{ a: "abc", b: "" }, 3], [{ a: "", b: "" }, 0], [{ a: "abc", b: "abc" }, 0], [{ a: "abc", b: "ac" }, 1], [{ a: "a", b: "z" }, 1]],
  "logica-subsecuencia-creciente": [[[3, 1, 2, 0], 2], [[1, 4, 2, 3], 3], [[2, 2], 1], [[], 0], [[-3, -2, -1], 3]],
  "logica-planifica-tareas": [[{ duraciones: [2, 5, 3, 0], dependencias: [[0, 2], [1, 2], [2, 3]] }, 8], [{ duraciones: [2, 7], dependencias: [] }, 7], [{ duraciones: [0, 0], dependencias: [[0, 1], [1, 0]] }, -1], [{ duraciones: [], dependencias: [] }, 0]],
};

test("las siete referencias fijas confirman caminos y optimización conservando la entrada", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set([...Object.keys(pythonPathExplanations), ...retained]));
  const runner = `import sys,json,copy,io,contextlib
for entry in json.load(sys.stdin):
    namespace={}
    exec(entry['code'],namespace)
    for data,expected in entry['cases']:
        original=copy.deepcopy(data)
        output=io.StringIO()
        with contextlib.redirect_stdout(output):
            actual=namespace['solve'](data)
        assert type(actual) is type(expected), (entry['slug'],'tipo de retorno')
        assert actual==expected, (entry['slug'],original,actual,expected)
        assert data==original, (entry['slug'],'entrada modificada')
        assert output.getvalue()=='', (entry['slug'],'salida impresa')
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    encoding: "utf8", timeout: 30000,
    input: JSON.stringify(Object.entries(examples).map(([slug, cases]) => ({ slug, cases, code: content(slug).variants[0].solution }))),
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
