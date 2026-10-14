// Verificación contra el Piston real. No usa el doble HTTP de las pruebas de navegador:
// ejecuta código dentro del sandbox de verdad. Se salta si el ejecutor no está levantado,
// y por eso vive fuera del patrón `tests/*.test.ts` que usa `npm test`.
//
// Necesita la condición `react-server` porque el adaptador marca `import "server-only"`.
// Ejecutar con: npm run test:runner   (subconjunto)   ·   ITERA_RUNNER_ALL=1 npm run test:runner (catálogo completo)
import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { availableRuntime, runCode, RunnerUnavailable } from "../src/server/execution/piston";
import { judge } from "../src/server/execution/judge";
import { exercises } from "../prisma/content";
import type { Json } from "../src/lib/types";

const subset = ["suma-de-dos-numeros", "par-o-impar", "el-mayor-de-tres", "contar-vocales", "invertir-cadena"];

async function executorReady() {
  try {
    await availableRuntime("python");
    await availableRuntime("javascript");
    return true;
  } catch {
    return false;
  }
}

const ready = await executorReady();
const only = { skip: ready ? false : "Piston no responde; ejecuta docker compose up -d y npm run runner:setup" };
const base = { input: { a: 1, b: 2 } as Json, expected: 3 as Json, visible: true, order: 0 };
const detail = (output: { stdout: string; stderr: string }) => `stdout=${JSON.stringify(output.stdout)} stderr=${output.stderr.slice(0, 400)}`;

test("el sandbox real expone los dos runtimes que usa la aplicación", only, async () => {
  const python = await availableRuntime("python");
  const javascript = await availableRuntime("javascript");
  assert.equal(python.language, "python");
  assert.match(python.version, /^\d+\.\d+/);
  assert.match(javascript.language, /javascript|^js$|^node$/);
});

test("las soluciones de referencia del catálogo pasan sus casos dentro del sandbox", only, async () => {
  const selected = process.env.ITERA_RUNNER_ALL ? exercises : exercises.filter((exercise) => subset.includes(exercise.slug));
  assert.ok(selected.length >= 5);
  for (const language of ["python", "javascript"] as const) {
    const runtime = await availableRuntime(language);
    for (const exercise of selected) {
      for (const [order, testCase] of exercise.tests.entries()) {
        const output = await runCode(language, runtime, exercise[language], testCase.input);
        const result = judge(output, { ...testCase, visible: true, order });
        assert.equal(result.passed, true, `${exercise.slug} (${language}) caso ${order + 1} — ${detail(output)}`);
      }
    }
  }
});

test("el sandbox real distingue aprobado, incorrecto, error y tiempo agotado", only, async () => {
  const runtime = await availableRuntime("python");
  const approved = judge(await runCode("python", runtime, "def solve(data):\n    return data['a'] + data['b']", base.input), base);
  assert.equal(approved.status, "passed");
  const wrong = judge(await runCode("python", runtime, "def solve(data):\n    return 0", base.input), base);
  assert.equal(wrong.passed, false);
  assert.equal(wrong.status, "wrong");
  const crashed = judge(await runCode("python", runtime, "def solve(data):\n    return data['nope']", base.input), base);
  assert.equal(crashed.status, "runtime");
  assert.match(crashed.error ?? "", /KeyError/);
  const looped = judge(await runCode("python", runtime, "def solve(data):\n    while True:\n        pass", base.input), base);
  assert.equal(looped.status, "timeout");
  assert.equal(looped.passed, false);
});

test("el mismo veredicto funciona igual en JavaScript", only, async () => {
  const runtime = await availableRuntime("javascript");
  const approved = judge(await runCode("javascript", runtime, "function solve(data) { return data.a + data.b; }", base.input), base);
  assert.equal(approved.status, "passed");
  const crashed = judge(await runCode("javascript", runtime, "function solve(data) { return data.nope; }", base.input), base);
  assert.equal(crashed.status, "runtime");
  const looped = judge(await runCode("javascript", runtime, "function solve(data) { while (true) {} }", base.input), base);
  assert.equal(looped.status, "timeout");
});

test("un ejecutor ausente se distingue de una respuesta incorrecta", async () => {
  const original = process.env.PISTON_URL;
  try {
    process.env.PISTON_URL = "http://127.0.0.1:2999";
    await assert.rejects(() => availableRuntime("python"), RunnerUnavailable);
    process.env.PISTON_URL = "https://piston.example.com";
    await assert.rejects(() => availableRuntime("python"), /PISTON_URL debe apuntar al ejecutor HTTP/);
  } finally {
    if (original === undefined) delete process.env.PISTON_URL;
    else process.env.PISTON_URL = original;
  }
});