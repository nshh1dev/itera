import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonStateExplanations } from "../prisma/python-state-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonState } from "./python-state-baseline";

const retained = ["logica-minusculas", "logica-vocales", "logica-invierte", "logica-ficha-producto", "logica-opcional", "logica-ausencia", "logica-captura-conversion"];

test("se revisan 24 explicaciones de textos, auxiliares, referencias y validación: 17 ajustes y siete conservadas", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug) && !(entry.slug in pythonSolutionExplanations));
  const block = common.slice(48, 72);
  assert.equal(Object.keys(pythonStateExplanations).length, 17);
  assert.deepEqual(new Set(block.map(entry => entry.slug)), new Set([...Object.keys(pythonStateExplanations), ...retained]));
  for (const entry of block) {
    assert.equal(entry.content.runtimeMode, "FUNCTION", entry.slug);
    const text = entry.content.variants[0].explanation;
    if (entry.slug in pythonStateExplanations) assert.equal(text, pythonStateExplanations[entry.slug], entry.slug);
    else if (entry.slug !== "logica-captura-conversion") assert.equal(text, entry.baseline!.variants[0].explanation, entry.slug);
    assert.doesNotMatch(text, /Sigue los valores en orden y contrasta|En Python\n|Paso a paso\n|Coste\n|serialización JSON como copia/, entry.slug);
  }
  const reviewed = new Set([...pythonLessons.keys(), ...Object.keys(pythonSolutionExplanations), ...common.slice(0, 72).map(entry => entry.slug)]);
  assert.equal(reviewed.size, 145);
  assert.equal(pythonCatalog.length - reviewed.size, 79);
});

test("las explicaciones precisan None, claves, copia superficial y mutación intencional", () => {
  const text = pythonStateExplanations;
  assert.match(text["logica-longitud-texto"], /A b!.*4.*espacio y el signo/);
  assert.match(text["logica-elimina-caracter"], /AaA!.*a!.*no la a minúscula/);
  assert.match(text["logica-palabras"], /en_palabra.*s inicia.*l la segunda.*no cualquier carácter en blanco/);
  assert.match(text["logica-auxiliares"], /no el precio unitario.*2000.*2299.*total 300/);
  assert.match(text["logica-variable-local"], /valor = 10.*numero \+ 1.*no ese valor fijo/);
  assert.match(text["logica-parametro-exterior"], /\[6, 10\].*\[20, 10\].*No hay nombres coincidentes/);
  assert.match(text["logica-llamadas-independientes"], /contador = 0.*2 y 3, no 2 y 5/);
  assert.match(text["logica-sin-estado-global"], /\[11, 8, 10\].*\[11, 9, 9\].*no se acumulan/);
  assert.match(text["logica-encadena-retornos"], /12.*14.*cero unidades.*resultado es 2/);
  assert.match(text["logica-dos-nombres-lista"], /data\['valores'\] refleja.*mutación es intencional/);
  assert.match(text["logica-reasigna-o-muta"], /cambia únicamente el vínculo.*no llama a append/);
  assert.match(text["logica-copia-plana"], /copia superficial.*enteros, no contenedores interiores/);
  assert.match(text["logica-conserva-entrada"], /\[4, 1, 4\].*toda mutación intermedia/);
  assert.match(text["logica-registro-compartido"], /\[-1, -1\].*mutación es intencional/);
  assert.match(text["logica-valida-divisor"], /None.*null.*0.0.*\/ devuelve float.*3.0/);
  assert.match(text["logica-valido-cero-ausente"], /siempre existe.*None, no una clave que falta/);
  assert.match(text["logica-localiza-error"], /-1 y 2.*1 devuelve 3.*contrato lo rechaza/);
});

test("el octavo lote conserva todo salvo 17 explicaciones y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: entry.content.variants.map(variant => {
    if (!(entry.slug in pythonStateExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar; protege también las siete explicaciones conservadas.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "a556c3c6a668b6e60099d5602b4d3e0f748cb03dcd4d95654b26047ff2941673");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonState(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "9f937492dd05d9c9b454c0a4ed74f0e33f6b322f3d7bf1e022d4f8449b61ab31");
});

// Referencias fijas del repositorio. La tercera posición declara el estado de
// entrada esperado solo cuando el contrato pide mutarlo intencionalmente.
const examples: Record<string, [Json, Json, Json?][]> = {
  "logica-longitud-texto": [["A b!", 4], ["", 0]],
  "logica-minusculas": [["A B!2", "a b!2"], ["", ""]],
  "logica-vocales": [["A!eA", 3], ["xyz 1", 0], ["", 0]],
  "logica-invierte": [["Ab !", "! bA"], ["", ""]],
  "logica-elimina-caracter": [[{ texto: "AaA!", caracter: "A" }, "a!"], [{ texto: "aa", caracter: "a" }, ""], [{ texto: "", caracter: "a" }, ""]],
  "logica-palabras": [["  sol   luna ", 2], ["   ", 0], ["", 0]],
  "logica-ficha-producto": [[{ nombre: "pan", precio: 0 }, 0]],
  "logica-opcional": [[{}, 1], [{ cantidad: 0 }, 0]],
  "logica-ausencia": [[null, -1], [0, 1], [-1, 0]],
  "logica-auxiliares": [[{ precio: 1000, cantidad: 2 }, 2000], [{ precio: 1999, cantidad: 1 }, 2299], [{ precio: 1, cantidad: 0 }, 300]],
  "logica-variable-local": [[3, 4], [-1, 0]],
  "logica-parametro-exterior": [[{ exterior: 10, argumento: 3 }, [6, 10]], [{ exterior: -5, argumento: 0 }, [0, -5]]],
  "logica-llamadas-independientes": [[[2, 3], [2, 3]], [[0, 2], [0, 2]]],
  "logica-sin-estado-global": [[{ base: 10, tasas: [1, -2, 0] }, [11, 8, 10]], [{ base: 10, tasas: [] }, []]],
  "logica-encadena-retornos": [[{ precio: 3, unidades: 4 }, 14], [{ precio: -3, unidades: 2 }, -4], [{ precio: 3, unidades: 0 }, 2]],
  "logica-dos-nombres-lista": [
    [{ valores: [1, 2], nuevo: 3 }, [1, 2, 3], { valores: [1, 2, 3], nuevo: 3 }],
    [{ valores: [], nuevo: 0 }, [0], { valores: [0], nuevo: 0 }],
  ],
  "logica-reasigna-o-muta": [[{ valores: [1, 2], nuevo: 3 }, { original: [1, 2], alias: [3] }], [{ valores: [], nuevo: 0 }, { original: [], alias: [0] }]],
  "logica-copia-plana": [[{ valores: [1, 2], nuevo: 3 }, { original: [1, 2], copia: [1, 2, 3] }], [{ valores: [], nuevo: 0 }, { original: [], copia: [0] }]],
  "logica-conserva-entrada": [[{ valores: [1, -2, 1], incremento: 3 }, { original: [1, -2, 1], ajustados: [4, 1, 4] }], [{ valores: [], incremento: 0 }, { original: [], ajustados: [] }]],
  "logica-registro-compartido": [
    [{ ficha: { cantidad: 2 }, cambio: -3 }, [-1, -1], { ficha: { cantidad: -1 }, cambio: -3 }],
    [{ ficha: { cantidad: 0 }, cambio: 0 }, [0, 0], { ficha: { cantidad: 0 }, cambio: 0 }],
  ],
  "logica-valida-divisor": [[{ total: 6, divisor: 2 }, 3], [{ total: 0, divisor: 2 }, 0], [{ total: 3, divisor: 0 }, null]],
  "logica-valido-cero-ausente": [[{ cantidad: null }, "ausente"], [{ cantidad: -1 }, "invalido"], [{ cantidad: 0 }, "valido"]],
  "logica-localiza-error": [[{ valores: [8, 3], indice: -1 }, "indice fuera de rango"], [{ valores: [8, 3], indice: 2 }, "indice fuera de rango"], [{ valores: [8, 3], indice: 1 }, 3], [{ valores: [], indice: 0 }, "indice fuera de rango"]],
  "logica-captura-conversion": [[" +007 ", 7], ["3.0", null], ["1_000", null], ["３", null], ["+", null], ["", null], ["0", 0]],
};

test("las 24 referencias fijas confirman retornos, validación y las dos mutaciones intencionales", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set([...Object.keys(pythonStateExplanations), ...retained]));
  const runner = `import sys,json,copy,io,contextlib
for entry in json.load(sys.stdin):
    namespace={}
    exec(entry['code'],namespace)
    for case in entry['cases']:
        data,expected=case[:2]
        original=copy.deepcopy(data)
        output=io.StringIO()
        with contextlib.redirect_stdout(output):
            actual=namespace['solve'](data)
        if entry['slug']=='logica-valida-divisor' and actual is not None:
            assert type(actual) is float, (entry['slug'],'cociente float')
        else:
            assert type(actual) is type(expected), (entry['slug'],'tipo de retorno')
        assert actual==expected, (entry['slug'],original,actual,expected)
        after=case[2] if len(case)>2 else original
        assert data==after, (entry['slug'],'estado de entrada',data,after)
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
