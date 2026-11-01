import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonSearchExplanations } from "../prisma/python-search-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonSearch } from "./python-search-baseline";

const retained = ["logica-error-dominio", "logica-recupera-elementos", "logica-asercion-normal", "logica-pruebas-limites", "logica-reproduce-fallo", "logica-factorial", "logica-fizzbuzz", "logica-deduplica", "logica-frecuencias", "logica-anagramas", "logica-agrupa-registros", "logica-busqueda-binaria", "logica-ordena-insercion", "logica-ordena-registros"];

test("se revisan 24 explicaciones de pruebas, colecciones y búsquedas: diez ajustes y catorce conservadas", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug) && !(entry.slug in pythonSolutionExplanations));
  const block = common.slice(72, 96);
  assert.equal(Object.keys(pythonSearchExplanations).length, 10);
  assert.deepEqual(new Set(block.map(entry => entry.slug)), new Set([...Object.keys(pythonSearchExplanations), ...retained]));
  for (const entry of block) {
    assert.equal(entry.content.runtimeMode, "FUNCTION", entry.slug);
    const text = entry.content.variants[0].explanation;
    if (entry.slug in pythonSearchExplanations) assert.equal(text, pythonSearchExplanations[entry.slug], entry.slug);
    assert.doesNotMatch(text, /Math\.max|\bpropiedades?\b|\bmapa\b|Sigue los valores en orden y contrasta|En Python\n|Paso a paso\n|Coste\n/, entry.slug);
  }
  const reviewed = new Set([...pythonLessons.keys(), ...Object.keys(pythonSolutionExplanations), ...common.slice(0, 96).map(entry => entry.slug)]);
  assert.equal(reviewed.size, 169);
  assert.equal(pythonCatalog.length - reviewed.size, 55);
});

test("los ajustes distinguen prueba declarada, estado aceptado, orden y memoria de la referencia", () => {
  const text = pythonSearchExplanations;
  assert.match(text["logica-conserva-regresion"], /max\(0, total - 2\).*1 y limite 1.*0, no -1.*no certifican/);
  assert.match(text["logica-mediciones"], /mayor is None or.*sin compararlo con None.*máximo sigue siendo -2/);
  assert.match(text["logica-carrito"], /15 pasa a 13.5.*no se descuentan 10 unidades.*float/);
  assert.match(text["logica-saldo"], /\[-3, 1, -3\].*saldo 0 y rechazados 1.*No se arrastra.*permite negativos/);
  assert.match(text["logica-repetido"], /Antes de añadir.*primera aparición parecería repetida/);
  assert.match(text["logica-primer-unico"], /cbba.*c.*Python conserva el orden de inserción/);
  assert.match(text["logica-inventario"], /diccionario.*'pan': 0, 'agua': -1.*no rechaza/);
  assert.match(text["logica-insercion-posicion"], /\[izquierda, derecha\).*derecha = medio.*devuelve 1.*0 con lista vacía/);
  assert.match(text["logica-combina"], /avanza solo su índice.*falta el 4.*listas temporales.*no usa O\(1\) auxiliar/);
  assert.match(text["logica-palindromo"], /a!a\?.*no se quitan signos.*vacío o un solo carácter.*no la técnica interna/);
});

test("el noveno lote conserva todo salvo diez explicaciones y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: entry.content.variants.map(variant => {
    if (!(entry.slug in pythonSearchExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar; las catorce explicaciones conservadas no se excluyen.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "2bd03c75ce803bffd8a5f7e61a906c629c316ba818d5f688ca43e94cc1320fd0");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonSearch(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "c4cd4da58348831070914d063a99d848544f4c075f9268992b8e059f80214bf0");
});

// Solo referencias fijas, nunca código de estudiantes. Estas expectativas no
// conceden progreso ni certifican técnicas internas, identidad o rendimiento real.
const examples: Record<string, [Json, Json][]> = {
  "logica-error-dominio": [[-1, "edad negativa"], [0, "aceptada"]],
  "logica-recupera-elementos": [[["2", "x", "-3", "1_000", "0", "３"], { validos: [2, -3, 0], rechazados: 3 }], [[], { validos: [], rechazados: 0 }]],
  "logica-asercion-normal": [[4, 12], [0, 0]],
  "logica-pruebas-limites": [[[-8, -2], -2], [[], null]],
  "logica-reproduce-fallo": [[[0], 0], [[1, 0, 2], 2]],
  "logica-conserva-regresion": [[{ total: 10, limite: 10 }, 8], [{ total: 0, limite: 0 }, 0], [{ total: 1, limite: 1 }, 0], [{ total: 2, limite: 3 }, 2]],
  "logica-factorial": [[0, 1], [4, 24]],
  "logica-fizzbuzz": [[0, []], [15, [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"]]],
  "logica-mediciones": [[[-4, -2, 0], { total: -6, positivos: 0, mayor: 0 }], [[-4, -2], { total: -6, positivos: 0, mayor: -2 }], [[], { total: 0, positivos: 0, mayor: null }]],
  "logica-carrito": [[{ items: [{ precio: 3, cantidad: 5 }], descuento: 10 }, 13.5], [{ items: [{ precio: 3, cantidad: 5 }], descuento: 100 }, 0], [{ items: [], descuento: 0 }, 0]],
  "logica-saldo": [[{ inicial: 2, movimientos: [-3, 1, -3] }, { saldo: 0, rechazados: 1 }], [{ inicial: 5, movimientos: [] }, { saldo: 5, rechazados: 0 }]],
  "logica-repetido": [[[3, 1, 3], true], [[], false]],
  "logica-deduplica": [[[3, 1, 3], [3, 1]], [[], []]],
  "logica-frecuencias": [["banana", { b: 1, a: 3, n: 2 }], ["", {}]],
  "logica-primer-unico": [["cbba", "c"], ["aab", "b"], ["aa", null], ["", null]],
  "logica-anagramas": [[{ a: "aa", b: "a" }, false], [{ a: "ab", b: "ba" }, true], [{ a: "a", b: "z" }, false], [{ a: "", b: "   " }, true]],
  "logica-agrupa-registros": [[[{ categoria: "a", nombre: "ana" }, { categoria: "b", nombre: "bea" }, { categoria: "a", nombre: "ana" }], { a: ["ana", "ana"], b: ["bea"] }], [[], {}]],
  "logica-inventario": [[[{ producto: "pan", cambio: -2 }, { producto: "pan", cambio: 2 }, { producto: "agua", cambio: -1 }], { pan: 0, agua: -1 }], [[], {}]],
  "logica-busqueda-binaria": [[{ numbers: [1, 3, 5], target: 3 }, 1], [{ numbers: [], target: 1 }, -1], [{ numbers: [1], target: 1 }, 0], [{ numbers: [1], target: 0 }, -1]],
  "logica-insercion-posicion": [[{ numbers: [1, 2, 2, 4], target: 2 }, 1], [{ numbers: [], target: 2 }, 0], [{ numbers: [1, 2, 2, 4], target: 5 }, 4]],
  "logica-ordena-insercion": [[[3, -1, 3, 0], [-1, 0, 3, 3]], [[], []]],
  "logica-ordena-registros": [[[{ nombre: "sol", puntos: 2 }, { nombre: "ana", puntos: 2 }, { nombre: "ana", puntos: 2 }, { nombre: "bea", puntos: 5 }], [{ nombre: "bea", puntos: 5 }, { nombre: "ana", puntos: 2 }, { nombre: "ana", puntos: 2 }, { nombre: "sol", puntos: 2 }]], [[], []]],
  "logica-combina": [[{ a: [1, 3], b: [1, 2, 4] }, [1, 1, 2, 3, 4]], [{ a: [], b: [2] }, [2]], [{ a: [], b: [] }, []]],
  "logica-palindromo": [["a!a?", false], ["", true], ["a", true], ["A a", false], ["a a", true]],
};

test("las 24 referencias fijas confirman pruebas, colecciones y búsquedas sin modificar la entrada", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set([...Object.keys(pythonSearchExplanations), ...retained]));
  const runner = `import sys,json,copy,io,contextlib
for entry in json.load(sys.stdin):
    namespace={}
    exec(entry['code'],namespace)
    for data,expected in entry['cases']:
        original=copy.deepcopy(data)
        output=io.StringIO()
        with contextlib.redirect_stdout(output):
            actual=namespace['solve'](data)
        if entry['slug']=='logica-carrito':
            assert type(actual) is float, (entry['slug'],'resultado float')
        else:
            assert type(actual) is type(expected), (entry['slug'],'tipo de retorno')
        assert actual==expected, (entry['slug'],original,actual,expected)
        assert data==original, (entry['slug'],'entrada modificada')
        assert output.getvalue()=='', (entry['slug'],'salida impresa')
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    encoding: "utf8", timeout: 30000,
    input: JSON.stringify(Object.entries(examples).map(([slug, cases]) => ({ slug, cases, code: pythonCatalog.find(entry => entry.slug === slug)!.content.variants[0].solution }))),
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
