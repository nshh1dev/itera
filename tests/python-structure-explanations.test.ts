import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonStructureExplanations } from "../prisma/python-structure-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonStructures } from "./python-structure-baseline";
import { beforePythonOptimization } from "./python-optimization-baseline";

const retained = ["logica-diagonales", "logica-suma-recursiva", "logica-arbol-busqueda"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("se revisan 24 explicaciones de ventanas, matrices y estructuras: 21 ajustes y tres conservadas", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug) && !(entry.slug in pythonSolutionExplanations));
  const block = common.slice(96, 120);
  assert.equal(Object.keys(pythonStructureExplanations).length, 21);
  assert.deepEqual(new Set(block.map(entry => entry.slug)), new Set([...Object.keys(pythonStructureExplanations), ...retained]));
  for (const entry of block) {
    assert.equal(entry.content.runtimeMode, "FUNCTION", entry.slug);
    const text = entry.content.variants[0].explanation;
    if (entry.slug in pythonStructureExplanations) assert.equal(text, pythonStructureExplanations[entry.slug], entry.slug);
    assert.doesNotMatch(text, /\bmapa\b|En Python\n|Paso a paso\n|Coste\n/, entry.slug);
  }
  const reviewed = new Set([...pythonLessons.keys(), ...Object.keys(pythonSolutionExplanations), ...common.slice(0, 120).map(entry => entry.slug)]);
  assert.equal(reviewed.size, 193);
  assert.equal(pythonCatalog.length - reviewed.size, 31);
});

test("las explicaciones siguen las referencias reales, sus costes y las claves de árbol Python", () => {
  const text = pythonStructureExplanations;
  assert.match(text["logica-pareja"], /\[0, 3\].*menor índice izquierdo.*mayor derecho/);
  assert.match(text["logica-intervalos-suma"], /\[0, 3, 2, 6\].*6 - 3 = 3.*Sin consultas/);
  assert.ok(content("logica-ventana-fija").variants[0].solution.includes("valores[:tamano]"));
  assert.match(text["logica-ventana-fija"], /10, 17 y 8.*O\(k\) auxiliar.*no es O\(1\)/);
  assert.match(text["logica-ventana-suma"], /longitud 2.*no se exige igualdad.*valores positivos/);
  assert.match(text["logica-celda"], /devuelve 6.*no se puede suponer.*cuadrada/);
  assert.match(text["logica-filas"], /\[2, 0, -2, 0\].*O\(f \+ N\).*filas vacías/);
  assert.match(text["logica-columnas"], /\[5, 7, 9\], no \[6, 15\]/);
  assert.match(text["logica-transpuesta"], /tres por dos.*cada celda se copia una vez/);
  assert.match(text["logica-vecinos"], /índice negativo no se acepta.*no en data/);
  assert.match(text["logica-pila"], /\[3, 2\].*amortizado.*no garantiza O\(1\)/);
  assert.ok(content("logica-cola").variants[0].solution.includes("cola.pop(0)"));
  assert.match(text["logica-cola"], /\[2, 3\], no \[3, 2\].*O\(o²\).*no es lo que implementa/);
  assert.match(text["logica-delimitadores"], /\(\[\)\].*mismas cantidades.*return not stack/);
  assert.match(text["logica-deshacer"], /sumar 0.*consumido el estado.*segundo deshacer restaura 0/);
  assert.match(text["logica-busqueda-recursiva"], /propagar el índice o -1.*posiciones siguen siendo originales/);
  assert.match(text["logica-une-intervalos"], /no se reduce.*\[\[1, 5\]\].*sin escribir/);
  assert.match(text["logica-segundo-maximo"], /\[5, 5, 3\].*3, no 5.*None.*null/);
  assert.match(text["logica-sin-repeticiones"], /abba.*no lo devuelve a 1.*2, no 3/);
  assert.match(text["logica-ranking"], /diccionario|conteos por clave/);
  assert.match(text["logica-ranking"], /\[2, 4, 7\].*No se convierte a texto/);
  assert.match(text["logica-altura"], /None.*null.*1 más la mayor.*hoja tiene altura 1/);
  assert.match(text["logica-preorden"], /value.*left.*right.*\[2, 1, 3\].*repetidos/);
  assert.ok(content("logica-niveles").variants[0].solution.includes("nodo = cola[inicio]"));
  assert.match(text["logica-niveles"], /No se usa pop\(0\).*nodos procesados.*no solo la anchura pendiente/);
  assert.match(content("logica-suma-recursiva").variants[0].explanation, /O\(n²\).*profundidad O\(n\)/);
});

test("el décimo lote conserva todo salvo 21 explicaciones y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...beforePythonOptimization(entry.slug, entry.content), variants: beforePythonOptimization(entry.slug, entry.content).variants.map(variant => {
    if (!(entry.slug in pythonStructureExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar; protege los tres textos conservados y campos ajenos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "66115ce9eb12f587cc6aa335813aa68992b478cfc3fda96f9291f623571ab2e9");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonStructures(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "ad20d0b9d3f6a55fe108d7d2a4bde9d828338a133248823bf39519bb7feab77d");
});

const node = (value: number, left: Json = null, right: Json = null): Json => ({ value, left, right });
const tree = node(2, node(1, node(0)), node(3));
// Solo referencias fijas; los casos no certifican técnica interna ni límites de
// memoria/tiempo/recursión de programas enviados por estudiantes.
const examples: Record<string, [Json, Json][]> = {
  "logica-pareja": [[{ numbers: [1, 1, 2, 2], target: 3 }, [0, 3]], [{ numbers: [1, 2, 3, 4], target: 5 }, [0, 3]], [{ numbers: [], target: 0 }, []], [{ numbers: [1], target: 2 }, []]],
  "logica-intervalos-suma": [[{ numbers: [3, -1, 4], consultas: [[1, 2], [0, 0], [0, 2]] }, [3, 3, 6]], [{ numbers: [], consultas: [] }, []]],
  "logica-ventana-fija": [[{ numbers: [1, 9, 8, 0], k: 2 }, 17], [{ numbers: [-5, -2, -3], k: 2 }, -5], [{ numbers: [-3], k: 1 }, -3]],
  "logica-ventana-suma": [[{ numbers: [2, 3, 1], target: 4 }, 2], [{ numbers: [], target: 1 }, 0], [{ numbers: [1, 1], target: 3 }, 0]],
  "logica-celda": [[{ matriz: [[1, 2, 3], [4, 5, 6]], fila: 1, columna: 2 }, 6]],
  "logica-filas": [[[[2], [], [-3, 1], []], [2, 0, -2, 0]], [[[]], [0]]],
  "logica-columnas": [[[[1, 2, 3], [4, 5, 6]], [5, 7, 9]], [[], []]],
  "logica-diagonales": [[[[1, 2, 3], [4, 5, 6], [7, 8, 9]], { principal: [1, 5, 9], secundaria: [3, 5, 7] }], [[[4]], { principal: [4], secundaria: [4] }]],
  "logica-transpuesta": [[[[1, 2, 3], [4, 5, 6]], [[1, 4], [2, 5], [3, 6]]]],
  "logica-vecinos": [[[[1, 0], [0, 1]], [[0, 2], [2, 0]]], [[], []], [[[1]], [[0]]]],
  "logica-pila": [[{ operaciones: [["pop"], ["push", 2], ["push", 3], ["pop"], ["pop"], ["pop"]] }, [3, 2]], [{ operaciones: [["push", 2]] }, []]],
  "logica-cola": [[{ operaciones: [["pop"], ["push", 2], ["push", 3], ["pop"], ["pop"], ["pop"]] }, [2, 3]], [{ operaciones: [["push", 2]] }, []]],
  "logica-delimitadores": [["([])", true], ["([)]", false], ["(", false], ["", true]],
  "logica-deshacer": [[{ operaciones: [["sumar", 3], ["sumar", 0], ["deshacer"]] }, 3], [{ operaciones: [["sumar", 3], ["sumar", 0], ["deshacer"], ["deshacer"]] }, 0], [{ operaciones: [["deshacer"]] }, 0]],
  "logica-suma-recursiva": [[[1, -3, 2], 0], [[], 0]],
  "logica-busqueda-recursiva": [[{ numbers: [1, 3, 5], target: 3 }, 1], [{ numbers: [], target: 1 }, -1], [{ numbers: [1, 3, 5], target: 4 }, -1]],
  "logica-une-intervalos": [[[[3, 5], [1, 3], [2, 2]], [[1, 5]]], [[], []]],
  "logica-segundo-maximo": [[[5, 5, 3], 3], [[-2, 0, -2], -2], [[0, 0], null], [[], null]],
  "logica-sin-repeticiones": [["abba", 2], ["a a", 2], ["", 0]],
  "logica-ranking": [[[4, 2, 4, 2, 7], [2, 4, 7]], [[-1, -2, -1, -2, 0], [-2, -1, 0]], [[], []]],
  "logica-altura": [[tree, 3], [null, 0], [node(0), 1]],
  "logica-preorden": [[tree, [2, 1, 0, 3]], [node(7, node(7), node(7)), [7, 7, 7]], [null, []]],
  "logica-niveles": [[tree, [2, 1, 3, 0]], [node(7, node(7), node(7)), [7, 7, 7]], [null, []]],
  "logica-arbol-busqueda": [[null, true], [node(2, node(1), node(3)), true], [node(10, node(5), node(15, node(6))), false]],
};

test("las 24 referencias fijas confirman ventanas, matrices y estructuras sin modificar la entrada", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set([...Object.keys(pythonStructureExplanations), ...retained]));
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
