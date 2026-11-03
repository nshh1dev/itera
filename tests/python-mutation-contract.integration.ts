// Referencias y contraejemplos fijos. Nunca ejecutar programas de alumnos en el
// host: tanto las llamadas normales como las sondas pasan por piston.ts.
import "dotenv/config";
import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";
import { test } from "node:test";
import { pythonCatalog } from "../prisma/python-content";
import type { Json } from "../src/lib/types";
import { availableRuntime, runCode } from "../src/server/execution/piston";
import { judge } from "../src/server/execution/judge";

const enabled = process.env.ITERA_PYTHON_MUTATION === "1";
const options = { skip: enabled ? false : "Requiere ITERA_PYTHON_MUTATION=1 y Piston real", timeout: 120000 };
const examples: Record<string, { candidate: string; visibleMistake?: string; intentional?: boolean }> = {
  "logica-dos-nombres-lista": {
    intentional: true,
    candidate: "return list(data['valores']) + [data['nuevo']]",
  },
  "logica-reasigna-o-muta": {
    candidate: "original = list(data['valores'])\ndata['valores'][:] = [data['nuevo']]\nreturn {'original': original, 'alias': data['valores']}",
    visibleMistake: "original = data['valores']\nalias = original\nalias[:] = [data['nuevo']]\nreturn {'original': original, 'alias': alias}",
  },
  "logica-copia-plana": {
    candidate: "original = list(data['valores'])\ndata['valores'].append(data['nuevo'])\nreturn {'original': original, 'copia': data['valores']}",
    visibleMistake: "copia = data['valores']\ncopia.append(data['nuevo'])\nreturn {'original': data['valores'], 'copia': copia}",
  },
  "logica-conserva-entrada": {
    candidate: "original = list(data['valores'])\ndata['valores'][:] = [n + data['incremento'] for n in data['valores']]\nreturn {'original': original, 'ajustados': data['valores']}",
    visibleMistake: "valores = data['valores']\nvalores[:] = [n + data['incremento'] for n in valores]\nreturn {'original': valores, 'ajustados': valores}",
  },
  "logica-registro-compartido": {
    intentional: true,
    candidate: "cantidad = data['ficha']['cantidad'] + data['cambio']\nreturn [cantidad, cantidad]",
  },
  "python-identidad": {
    candidate: "original = data['valores']\nalias = original\nantes = list(original)\ncopia = list(original)\nalias.append(data['nuevo'])\nreturn {'antes': antes, 'original': original, 'copia': copia, 'igual': original == copia, 'misma': alias is original, 'copiaMisma': copia is original}",
  },
  "python-ordena-numeros": {
    candidate: "original = list(data)\ndata.sort()\nreturn {'original': original, 'ordenados': data}",
    visibleMistake: "data.sort()\nreturn {'original': data, 'ordenados': data}",
  },
  "python-crea-grupo": {
    candidate: "copia = dict(data['grupos'])\ncopia.setdefault(data['categoria'], []).append(data['nombre'])\nreturn copia",
  },
  "logica-copia-anidada": {
    candidate: "original = [list(fila) for fila in data['matriz']]\ndata['matriz'][data['fila']][data['columna']] = data['valor']\nreturn {'original': original, 'copia': data['matriz']}",
    visibleMistake: "copia = list(data['matriz'])\ncopia[data['fila']][data['columna']] = data['valor']\nreturn {'original': data['matriz'], 'copia': copia}",
  },
};
const program = (body: string) => `def solve(data):\n${body.split("\n").map(line => `    ${line}`).join("\n")}\n`;
// Sonda editorial, no conductor nuevo del producto. Observa la entrada dentro
// del mismo proceso; comparar únicamente stdout no permite observar esa entrada.
const probe = (code: string) => `${code}\n__reference = solve\ndef solve(data):\n    import copy\n    before = copy.deepcopy(data)\n    value = __reference(data)\n    return {'value': value, 'before': before, 'after': data}\n`;

function referenceAfter(slug: string, input: Json): Json {
  const after = structuredClone(input);
  if (slug === "logica-dos-nombres-lista" || slug === "logica-registro-compartido") {
    assert.ok(after && typeof after === "object" && !Array.isArray(after));
    if (slug === "logica-dos-nombres-lista") {
      assert.ok(Array.isArray(after.valores));
      after.valores.push(after.nuevo);
    } else {
      const ficha = after.ficha;
      assert.ok(ficha && typeof ficha === "object" && !Array.isArray(ficha));
      assert.ok(typeof ficha.cantidad === "number" && typeof after.cambio === "number");
      ficha.cantidad += after.cambio;
    }
  }
  return after;
}

for (const [slug, example] of Object.entries(examples)) test(`alcance real de mutación Python: ${slug}`, options, async t => {
  const runtime = await availableRuntime("python"); // Opt-in sin infraestructura falla.
  const entry = pythonCatalog.find(item => item.slug === slug)!;
  assert.equal(entry.content.runtimeMode, "FUNCTION");
  const variant = entry.content.variants[0];
  let visibleRejections = 0, differentInputState = 0;
  for (const [order, fixture] of variant.tests.entries()) {
    const input = fixture.input as Json, expected = fixture.expected as Json;
    const reference = await runCode("python", runtime, probe(variant.solution), input);
    assert.equal(judge(reference, { input, expected: { value: expected, before: input, after: referenceAfter(slug, input) }, visible: false, order }).status, "passed", `${slug}: observación de la referencia`);

    // La respuesta coincide aunque la entrada no cumpla el efecto de referencia.
    // Es una limitación que hay que conservar explícita, no una garantía del juez.
    const candidate = program(example.candidate);
    const output = await runCode("python", runtime, candidate, input);
    assert.equal(judge(output, { input, expected, visible: false, order }).status, "passed", `${slug}: límite del contrato JSON`);
    const observed = await runCode("python", runtime, probe(candidate), input);
    assert.equal(observed.code, 0);
    assert.ok(!observed.signal && !observed.status);
    const payload: { value: Json; before: Json; after: Json } = JSON.parse(observed.stdout.trim().split(/\r?\n/).at(-1)!);
    assert.ok(isDeepStrictEqual(payload.value, expected) && isDeepStrictEqual(payload.before, input));
    if (!isDeepStrictEqual(payload.after, referenceAfter(slug, input))) differentInputState++;
    if (example.intentional) assert.ok(isDeepStrictEqual(payload.after, input), "contraejemplo sin mutación");
    if (example.visibleMistake) {
      const mistake = await runCode("python", runtime, program(example.visibleMistake), input);
      if (judge(mistake, { input, expected, visible: false, order }).status === "wrong") visibleRejections++;
    }
  }
  assert.ok(differentInputState > 0, `${slug}: el retorno no certifica el estado de entrada`);
  if (example.visibleMistake) assert.ok(visibleRejections > 0, `${slug}: el original devuelto permite distinguir el error visible`);
  t.diagnostic(JSON.stringify({ slug, runtime: runtime.version, cases: variant.tests.length,
    intentionalMutation: !!example.intentional, differentInputState, visibleRejections }));
});
