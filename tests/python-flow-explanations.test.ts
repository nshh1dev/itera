import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonFlowExplanations } from "../prisma/python-flow-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonFlow } from "./python-flow-baseline";
import { beforePythonState } from "./python-state-baseline";

test("las siguientes 24 explicaciones comunes revisan flujo y listas: 23 ajustes y máximo conservado", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug) && !(entry.slug in pythonSolutionExplanations));
  const block = common.slice(24, 48);
  assert.equal(Object.keys(pythonFlowExplanations).length, 23);
  assert.deepEqual(new Set(block.map(entry => entry.slug)), new Set([...Object.keys(pythonFlowExplanations), "logica-maximo"]));
  for (const entry of block) {
    assert.equal(entry.content.runtimeMode, "FUNCTION", entry.slug);
    const text = entry.content.variants[0].explanation;
    assert.equal(text, pythonFlowExplanations[entry.slug] ?? entry.baseline!.variants[0].explanation, entry.slug);
    assert.doesNotMatch(text, /En Python\n|Razonamiento\n|Paso a paso\n|Coste\n|FizzBuzz|\breduce\b/, entry.slug);
  }
  const reviewed = new Set([...pythonLessons.keys(), ...Object.keys(pythonSolutionExplanations), ...common.slice(0, 48).map(entry => entry.slug)]);
  assert.equal(reviewed.size, 121);
  assert.equal(pythonCatalog.length - reviewed.size, 103);
});

test("las lecturas distinguen acumulador, contador, índice y fronteras sin adelantar técnicas", () => {
  const text = pythonFlowExplanations;
  assert.match(text["logica-tabla-valores"], /2, 4 y 12.*str.*sin imprimir.*-2, 0 y 0/);
  assert.match(text["logica-minutos-segundos"], /2 minutos devuelve 120.*para 0, devuelve 0/);
  assert.match(text["logica-perimetro"], /devuelve 10.*daría 6.*área/);
  assert.match(text["logica-repara-presupuesto"], /devuelve 10.*daría 14.*cero unidades/);
  assert.match(text["logica-merienda"], /str\(total\).*Total: 12.*no.*impresión/);
  assert.match(text["logica-elige-mensaje"], /0 o un negativo.*al nivel del if.*>= 0/);
  assert.match(text["logica-signo"], /elif.*else.*único entero.*else no necesita/);
  assert.match(text["logica-mayor-tres"], /candidato ya actualizado.*-2.*inventaría.*if son independientes/);
  assert.match(text["logica-dos-requisitos"], /and.*con 3.*con 5.*Cero.*no un texto/);
  assert.match(text["logica-alternativas"], /bloqueado igual a True.*False.*solo a entrada/);
  assert.match(text["logica-tarifa"], /5 paga 0.*6 y 17 pagan 5.*18 paga 10/);
  assert.match(text["logica-uno-n"], /data \+ 1.*range\(1, 1\).*return está después del for/);
  assert.match(text["logica-cuenta-atras"], /-1.*entrada 0.*\[0\].*> 0.*omitir la resta/);
  assert.match(text["logica-suma-uno-n"], /totales son 1, 3 y 6.*numero vale 4.*se devuelve total/);
  assert.match(text["logica-tabla"], /1 a 10.*diez ceros/);
  assert.match(text["logica-multiplos"], /una unidad.*se devuelve 2.*cero no se recorre/);
  assert.match(text["logica-bucle-roto"], /1, 2, 3 y 4.*avance de 2.*no terminaría/);
  assert.match(text["logica-posicion"], /devuelve 3.*no devuelve 1 ni \[3\].*índice válido/);
  assert.match(text["logica-indices"], /\[8, 3, 8\].*no una longitud fija.*O\(n\).*O\(1\)/);
  assert.match(text["logica-suma-lista"], /totales son 3, -2 y 0.*no el contador/);
  assert.match(text["logica-cuenta-condicion"], /se devuelve 2.*Sumar n produciría 4/);
  assert.match(text["logica-filtra-lista"], /\[3, 3, 2\].*igualdad, el orden y las repeticiones/);
  assert.match(text["logica-busqueda-lineal"], /enumerate.*empezando en 0.*devuelve 0.*return -1 fuera del for/);
});

test("el séptimo lote conserva todo salvo 23 explicaciones y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: beforePythonState(entry.slug, entry.content).variants.map(variant => {
    if (!(entry.slug in pythonFlowExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar; no se excluye la explicación conservada de máximo.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "45ecbe80b625dbfa8a2433f28ac61bda38e496036a093740eca63a7f20962a46");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonFlow(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "5f9896fbe69bf9cd9f7a520953c2629256fe6841fe0d8a4b5992e9a6b84632bc");
});

// Solo referencias fijas. Los casos contrastan las trazas editoriales y fronteras,
// no certifican técnicas del alumno ni ausencia de cualquier mutación intermedia.
const examples: Record<string, [Json, Json][]> = {
  "logica-tabla-valores": [[2, "2 -> 4 -> 12"], [-2, "-2 -> 0 -> 0"]],
  "logica-minutos-segundos": [[2, 120], [0, 0]],
  "logica-perimetro": [[{ base: 3, altura: 2 }, 10]],
  "logica-repara-presupuesto": [[{ precio: 3, unidades: 2, envio: 4 }, 10], [{ precio: 3, unidades: 0, envio: 4 }, 4]],
  "logica-merienda": [[{ unidades: 3, precio: 4 }, "Total: 12"], [{ unidades: 0, precio: 4 }, "Total: 0"], [{ unidades: 3, precio: 0 }, "Total: 0"]],
  "logica-elige-mensaje": [[1, "positivo"], [0, "no positivo"], [-1, "no positivo"]],
  "logica-signo": [[2, "positivo"], [-2, "negativo"], [0, "cero"]],
  "logica-mayor-tres": [[{ a: -5, b: -2, c: -3 }, -2], [{ a: 1, b: 2, c: 3 }, 3], [{ a: 2, b: 2, c: 2 }, 2]],
  "logica-dos-requisitos": [[15, true], [3, false], [5, false], [0, true]],
  "logica-alternativas": [
    [{ invitacion: false, entrada: false, bloqueado: false }, false],
    [{ invitacion: false, entrada: false, bloqueado: true }, false],
    [{ invitacion: false, entrada: true, bloqueado: false }, true],
    [{ invitacion: false, entrada: true, bloqueado: true }, false],
    [{ invitacion: true, entrada: false, bloqueado: false }, true],
    [{ invitacion: true, entrada: false, bloqueado: true }, false],
    [{ invitacion: true, entrada: true, bloqueado: false }, true],
    [{ invitacion: true, entrada: true, bloqueado: true }, false],
  ],
  "logica-tarifa": [[5, 0], [6, 5], [17, 5], [18, 10]],
  "logica-uno-n": [[3, [1, 2, 3]], [0, []]],
  "logica-cuenta-atras": [[2, [2, 1, 0]], [0, [0]]],
  "logica-suma-uno-n": [[3, 6], [0, 0]],
  "logica-tabla": [[-2, [-2, -4, -6, -8, -10, -12, -14, -16, -18, -20]], [0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]],
  "logica-multiplos": [[{ n: 7, divisor: 3 }, 2], [{ n: 0, divisor: 3 }, 0], [{ n: 3, divisor: 1 }, 3]],
  "logica-bucle-roto": [[4, 10], [0, 0]],
  "logica-posicion": [[{ numbers: [8, 3, 9], index: 1 }, 3], [{ numbers: [8], index: 0 }, 8]],
  "logica-indices": [[[8, 3, 8], [8, 3, 8]], [[], []], [[7], [7]]],
  "logica-suma-lista": [[[3, -5, 2], 0], [[], 0]],
  "logica-maximo": [[[3, 9, 2, 9], 9], [[-3, -9, -2], -2]],
  "logica-cuenta-condicion": [[[-1, 0, 2, 2], 2], [[], 0]],
  "logica-filtra-lista": [[{ values: [3, 1, 3, 2], minimo: 2 }, [3, 3, 2]], [{ values: [], minimo: 2 }, []]],
  "logica-busqueda-lineal": [[{ values: [8, 3, 8], target: 8 }, 0], [{ values: [], target: 8 }, -1], [{ values: [3], target: 8 }, -1]],
};

test("las 24 referencias fijas confirman trazas, fronteras y retorno sin imprimir", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set([...Object.keys(pythonFlowExplanations), "logica-maximo"]));
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
    input: JSON.stringify(Object.entries(examples).map(([slug, cases]) => ({ slug, cases, code: pythonCatalog.find(entry => entry.slug === slug)!.content.variants[0].solution }))),
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
