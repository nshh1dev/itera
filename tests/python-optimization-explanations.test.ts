import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonOptimizationExplanations } from "../prisma/python-optimization-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonOptimization } from "./python-optimization-baseline";
import { beforePythonPaths } from "./python-path-baseline";

const retained = ["logica-permutaciones", "logica-alcanzables", "logica-distancias", "logica-dependencias"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("se revisan 24 explicaciones de selección, combinatoria, tablas y grafos: veinte ajustes y cuatro conservadas", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug) && !(entry.slug in pythonSolutionExplanations));
  const block = common.slice(120, 144);
  assert.equal(Object.keys(pythonOptimizationExplanations).length, 20);
  assert.deepEqual(new Set(block.map(entry => entry.slug)), new Set([...Object.keys(pythonOptimizationExplanations), ...retained]));
  for (const entry of block) {
    assert.equal(entry.content.runtimeMode, "FUNCTION", entry.slug);
    const text = entry.content.variants[0].explanation;
    if (entry.slug in pythonOptimizationExplanations) assert.equal(text, pythonOptimizationExplanations[entry.slug], entry.slug);
    assert.doesNotMatch(text, /En Python utiliza la sangría|En Python\n|Paso a paso\n|Coste\n/, entry.slug);
  }
  const reviewed = new Set([...pythonLessons.keys(), ...Object.keys(pythonSolutionExplanations), ...common.slice(0, 144).map(entry => entry.slug)]);
  assert.equal(reviewed.size, 217);
  assert.equal(pythonCatalog.length - reviewed.size, 7);
});

test("los textos explican copias, desempates, restauración y estados sin prometer técnicas certificadas", () => {
  const text = pythonOptimizationExplanations;
  assert.match(text["logica-ancestro"], /a == b.*ambos existen.*No compara magnitudes/);
  assert.match(text["logica-monticulo-inserta"], /\[0, 1, 2, 3\].*no se intercambian iguales.*extraer.*no se llama.*copia y la salida/);
  assert.match(text["logica-monticulo-extrae"], /izquierdo cuando empatan.*\[2, 4, 2, 5\].*insertar no se llama/);
  assert.match(text["logica-prioridad"], /\[2, 10, 1\].*no implementa un montículo/);
  assert.match(text["logica-k-mayores"], /dos 4.*k \+ 1 candidatos.*no ordena la entrada completa/);
  assert.match(text["logica-actividades"], /menos infinito.*inicio >= ultimo_fin.*devuelve 2/);
  assert.match(text["logica-combina-archivos"], /total 9.*total 11.*No abre archivos reales/);
  assert.match(text["logica-potencia"], /\(32, 256, 0\).*incluido 0 elevado a 0.*no supone coste constante/);
  assert.match(text["logica-mezcla"], /incluso el caso base.*lista distinta.*memoria simultánea.*todas las copias/);
  assert.match(text["logica-subconjuntos"], /sin alargar la anterior.*No se recorre una lista mientras se le añaden.*n × 2ⁿ/);
  assert.match(text["logica-combinaciones"], /i \+ 1.*\[\[1, 2\], \[3\]\].*actual.pop.*copia/);
  assert.match(text["logica-reinas"], /fila - columna.*fila \+ columna.*se retiran.*No se agrupan reflejos/);
  assert.match(text["logica-fibonacci"], /de nuevo en cada solve.*comparten el diccionario.*No se conserva una caché/);
  assert.match(text["logica-escalera"], /\[1, 2\] y \[2, 1\].*valores anteriores.*No usa la base F\(0\) = 0/);
  assert.match(text["logica-caminos-obstaculos"], /desde arriba.*izquierda.*se pone en 0.*\[1, 0\].*\[1, 1\]/);
  assert.match(text["logica-monedas"], /no cuántas combinaciones.*dos monedas de 3.*coins \[\].*aunque no haya denominaciones/);
  assert.match(text["logica-mochila"], /peso cero.*una sola vez.*devuelve 9.*devuelve 5.*capacidad \+ 1/);
  assert.match(text["logica-subsecuencia-comun"], /anterior\[j - 1\] \+ 1.*no sean contiguos.*dos filas.*textos vacíos/);
  assert.match(text["logica-adyacencia"], /set distinto.*arista vuelve escrita al revés.*\[\[1, 2\], \[0\], \[0\], \[\]\]/);
  assert.match(text["logica-ciclo-dirigido"], /1 para una llamada activa.*2 devuelve False.*componentes desconectadas/);
});

test("el undécimo lote conserva todo salvo veinte explicaciones y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: beforePythonPaths(entry.slug, entry.content).variants.map(variant => {
    if (!(entry.slug in pythonOptimizationExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar: protege también los cuatro textos conservados.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "27b9cad201c5dc30db804e69b97a2044f319432f6a98ca614a366d6b941b35df");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonOptimization(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "d210ff3789c8ffda0e5437f52fede64748bf855cbf77dd05f1dc0e3b73699d28");
});

const node = (value: number, left: Json = null, right: Json = null): Json => ({ value, left, right });
const tree = node(10, node(20, node(4), node(7)), node(3));
// Expectativas independientes sobre código fijo. No se ejecutan programas de
// alumnos ni se certifican técnicas, identidad, mutaciones intermedias o límites reales.
const examples: Record<string, [Json, Json][]> = {
  "logica-ancestro": [[{ tree, a: 4, b: 7 }, 20], [{ tree, a: 20, b: 4 }, 20], [{ tree, a: 7, b: 7 }, 7], [{ tree, a: 4, b: 3 }, 10]],
  "logica-monticulo-inserta": [[{ heap: [1, 3, 2], value: 0 }, [0, 1, 2, 3]], [{ heap: [], value: 2 }, [2]], [{ heap: [1, 2, 3], value: 2 }, [1, 2, 3, 2]]],
  "logica-monticulo-extrae": [[[1, 2, 2, 4, 5], { minimo: 1, heap: [2, 4, 2, 5] }], [[], { minimo: null, heap: [] }], [[2], { minimo: 2, heap: [] }], [[1, 1, 1], { minimo: 1, heap: [1, 1] }]],
  "logica-prioridad": [[[{ id: 10, prioridad: 1 }, { id: 2, prioridad: 1 }, { id: 1, prioridad: 3 }], [2, 10, 1]], [[], []]],
  "logica-k-mayores": [[{ numbers: [4, 1, 4, 2], k: 2 }, [4, 4]], [{ numbers: [-2, -1, -2], k: 3 }, [-1, -2, -2]], [{ numbers: [4], k: 0 }, []], [{ numbers: [], k: 0 }, []]],
  "logica-actividades": [[[[-3, -1], [-1, 2], [-3, 2]], 2], [[], 0]],
  "logica-combina-archivos": [[[1, 2, 3], 9], [[0, 0, 2], 2], [[7], 0], [[], 0]],
  "logica-potencia": [[{ base: 2, exponente: 5 }, 32], [{ base: 0, exponente: 0 }, 1], [{ base: 0, exponente: 5 }, 0], [{ base: 1, exponente: 100 }, 1]],
  "logica-mezcla": [[[3, 1, 3, 2], [1, 2, 3, 3]], [[-2, -3], [-3, -2]], [[4], [4]], [[], []]],
  "logica-subconjuntos": [[[1, 2], [[], [1], [2], [1, 2]]], [[], [[]]]],
  "logica-permutaciones": [[[2, 10], [[2, 10], [10, 2]]], [[], [[]]]],
  "logica-combinaciones": [[{ numbers: [3, 1, 2], target: 3 }, [[1, 2], [3]]], [{ numbers: [2], target: 4 }, []], [{ numbers: [], target: 0 }, [[]]], [{ numbers: [], target: 1 }, []]],
  "logica-reinas": [[1, 1], [2, 0], [3, 0], [4, 2]],
  "logica-fibonacci": [[0, 0], [1, 1], [4, 3], [8, 21]],
  "logica-escalera": [[0, 1], [1, 1], [3, 3], [4, 5]],
  "logica-caminos-obstaculos": [[[[0, 1], [0, 0]], 1], [[[0]], 1], [[[1]], 0], [[[0, 0], [0, 1]], 0]],
  "logica-monedas": [[{ coins: [1, 3, 4], amount: 6 }, 2], [{ coins: [], amount: 0 }, 0], [{ coins: [], amount: 2 }, -1], [{ coins: [2], amount: 3 }, -1]],
  "logica-mochila": [[{ pesos: [0, 2, 2], valores: [5, 3, 4], capacidad: 2 }, 9], [{ pesos: [0, 2, 2], valores: [5, 3, 4], capacidad: 0 }, 5], [{ pesos: [2], valores: [3], capacidad: 4 }, 3], [{ pesos: [], valores: [], capacidad: 0 }, 0]],
  "logica-subsecuencia-comun": [[{ a: "abc", b: "ac" }, 2], [{ a: "aaa", b: "aa" }, 2], [{ a: "", b: "ac" }, 0], [{ a: "abc", b: "" }, 0], [{ a: "a", b: "b" }, 0]],
  "logica-adyacencia": [[{ n: 4, aristas: [[0, 2], [2, 0], [0, 1]] }, [[1, 2], [0], [0], []]], [{ n: 1, aristas: [] }, [[]]]],
  "logica-alcanzables": [[{ n: 5, aristas: [[3, 1], [1, 2], [2, 3]], inicio: 3 }, [1, 2, 3]], [{ n: 2, aristas: [], inicio: 1 }, [1]]],
  "logica-distancias": [[{ n: 5, aristas: [[0, 1], [1, 2], [0, 2], [2, 3]], inicio: 0 }, [0, 1, 1, 2, -1]], [{ n: 2, aristas: [], inicio: 1 }, [-1, 0]]],
  "logica-ciclo-dirigido": [[{ n: 3, aristas: [[0, 1], [0, 2], [1, 2]] }, false], [{ n: 3, aristas: [[1, 2], [2, 1]] }, true], [{ n: 1, aristas: [[0, 0]] }, true], [{ n: 0, aristas: [] }, false]],
  "logica-dependencias": [[{ n: 3, dependencies: [[1, 0]] }, [1, 0, 2]], [{ n: 3, dependencies: [[1, 2], [2, 1]] }, []], [{ n: 0, dependencies: [] }, []]],
};

test("las 24 referencias fijas confirman selección, combinatoria, tablas y grafos conservando la entrada", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set([...Object.keys(pythonOptimizationExplanations), ...retained]));
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
