import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonCollectionExplanations } from "../prisma/python-collection-explanations";
import { pythonFoundationExplanations } from "../prisma/python-foundation-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonCollections } from "./python-collection-baseline";
import { beforePythonRecords } from "./python-record-baseline";

test("las siguientes 16 actividades propias revisan colecciones sin repetir la teoría inicial", () => {
  const entries = pythonCatalog.filter(entry => pythonLessons.has(entry.slug)).slice(16, 32);
  const revised = entries.filter(entry => entry.slug !== "python-recorre-pares");
  assert.equal(Object.keys(pythonCollectionExplanations).length, 15);
  assert.deepEqual(new Set(Object.keys(pythonCollectionExplanations)), new Set(revised.map(entry => entry.slug)));
  assert.equal(entries[0].content.variants[0].explanation, pythonSolutionExplanations["python-recorre-pares"]);
  for (const entry of revised) {
    const text = entry.content.variants[0].explanation;
    assert.equal(text, pythonCollectionExplanations[entry.slug], entry.slug);
    assert.ok(!text.includes(pythonLessons.get(entry.slug)!.theory), entry.slug);
    assert.doesNotMatch(text, /\b(?:arreglos?|propiedades?|push)\b/i, entry.slug);
  }
  assert.equal(new Set([...Object.keys(pythonCollectionExplanations), ...Object.keys(pythonFoundationExplanations), ...Object.keys(pythonSolutionExplanations)]).size, 58);
});

test("las explicaciones distinguen pertenencia, cantidades, transformación, copia y consumo", () => {
  const texts = pythonCollectionExplanations;
  assert.match(texts["python-lista-registros"], /return total queda fuera.*No se agrupan/);
  assert.match(texts["python-conjunto-seguro"], /add.*discard.*en ese orden.*mismo número/);
  assert.match(texts["python-union"], /\[1, 2, 3\].*dentro de una entrada como entre las dos/);
  assert.match(texts["python-interseccion"], /no se emparejan apariciones ni se suman cantidades/);
  assert.match(texts["python-diferencia"], /requeridos.*izquierda.*disponibles.*derecha.*sobrantes/);
  assert.match(texts["python-simetrica"], /sin contar apariciones.*exclusivos de b/);
  assert.match(texts["python-subconjunto"], /no se exigen dos unidades.*igualdad.*Sin requeridos devuelve True/);
  assert.match(texts["python-crea-grupo"], /list\(nombres\).*lista compartida.*nombres de texto.*contenedores interiores/);
  assert.match(texts["python-comprension"], /\[4, 0, 9, 4\].*No hay filtro/);
  assert.match(texts["python-comprension-filtro"], /\['a', 'e', 'a'\].*ASCII/);
  assert.match(texts["python-comprension-condicional"], /\[0, 0, 3\].*if después del for.*filtro/);
  assert.match(texts["python-comprension-dict"], /sol.*'': 0.*no se está construyendo un conjunto/);
  assert.match(texts["python-iterador"], /una sola vez.*mismo iterador ya agotado.*No se vacía data/);
  assert.match(texts["python-generador"], /no materializa.*data sí es una lista.*no significa.*memoria constante/);
  assert.match(texts["python-map"], /int\(texto\) \* 2.*\[4, -6, 0\].*sin llamarla anticipadamente/);
});

test("el cuarto lote solo cambia 15 explicaciones y conserva los 43 textos anteriores y demás campos", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: beforePythonRecords(entry.slug, entry.content).variants.map(variant => {
    if (!(entry.slug in pythonCollectionExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes del lote, sin excluir ninguna otra superficie.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "d2818a1b05e327cbe9038bcfd414ae54968b1fed30f286360fea3bd19e1d0b80");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonCollections(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "3a713639f6d74074a72e133e105598a4df11a0b0f7367ab39dc7f91aedd14e8e");
});

// Casos independientes de la prosa y casos oficiales; solo referencias fijas del
// repositorio, nunca código de alumnos. Cada entrada se conserva tras la llamada.
const examples: Record<string, [Json, Json][]> = {
  "python-lista-registros": [
    [[{ nombre: "pan", cantidad: 2 }, { nombre: "pan", cantidad: 3 }], 5],
    [[{ nombre: "pan", cantidad: 0 }], 0], [[], 0],
  ],
  "python-conjunto-seguro": [
    [{ valores: [1, 1, 2], agregar: 3, quitar: 2 }, [1, 3]],
    [{ valores: [1], agregar: 1, quitar: 1 }, []],
    [{ valores: [], agregar: -2, quitar: 3 }, [-2]],
  ],
  "python-union": [[{ a: [1, 2, 2], b: [2, 3] }, [1, 2, 3]], [{ a: [], b: [3, 1, 3] }, [1, 3]], [{ a: [], b: [] }, []]],
  "python-interseccion": [[{ a: [2, 2, 1], b: [3, 2, 2] }, [2]], [{ a: [], b: [2] }, []]],
  "python-diferencia": [
    [{ requeridos: ["oro", "mapa", "mapa"], disponibles: ["oro", "agua"] }, ["mapa"]],
    [{ requeridos: ["oro", "mapa", "mapa"], disponibles: [] }, ["mapa", "oro"]],
    [{ requeridos: [], disponibles: ["oro"] }, []],
  ],
  "python-simetrica": [[{ a: [1, 2, 2], b: [2, 3] }, [1, 3]], [{ a: [2, 2], b: [2] }, []], [{ a: [], b: [3, 1, 3] }, [1, 3]]],
  "python-subconjunto": [
    [{ disponibles: ["a"], requeridos: ["a", "a"] }, true],
    [{ disponibles: [], requeridos: [] }, true],
    [{ disponibles: ["a"], requeridos: ["a", "b"] }, false],
  ],
  "python-crea-grupo": [
    [{ grupos: { a: ["ana"], b: ["luz"] }, categoria: "a", nombre: "ana" }, { a: ["ana", "ana"], b: ["luz"] }],
    [{ grupos: { b: ["luz"] }, categoria: "a", nombre: "ana" }, { b: ["luz"], a: ["ana"] }],
  ],
  "python-comprension": [[[-2, 0, 3, -2], [4, 0, 9, 4]], [[], []]],
  "python-comprension-filtro": [["A!eA", ["a", "e", "a"]], ["xyz", []]],
  "python-comprension-condicional": [[[-2, 0, 3], [0, 0, 3]], [[], []]],
  "python-comprension-dict": [[["sol", "", "sol"], { sol: 3, "": 0 }], [[], {}]],
  "python-iterador": [[[1, 2], [[1, 2], []]], [[], [[], []]]],
  "python-generador": [[[-2, 3], 13], [[], 0]],
  "python-map": [[["2", "-3", "0"], [4, -6, 0]], [[], []]],
};

test("las referencias fijas confirman los ejemplos editoriales y conservan sus entradas al retornar", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set(Object.keys(pythonCollectionExplanations)));
  const runner = `import sys,json,copy,io,contextlib
for entry in json.load(sys.stdin):
    namespace={}
    exec(entry['code'],namespace)
    for data,expected in entry['cases']:
        original=copy.deepcopy(data)
        output=io.StringIO()
        with contextlib.redirect_stdout(output):
            actual=namespace['solve'](data)
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
