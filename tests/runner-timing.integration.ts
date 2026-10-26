// Opt-in; ejecuta solo referencias fijas dentro de Piston. No importa Prisma ni
// inicia servicios. No incluir en tests/*.test.ts ni interpretar omisiones como éxito.
// PowerShell: $env:ITERA_RUNNER_TIMING="1"; npx tsx --conditions=react-server --test tests/runner-timing.integration.ts
import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { performance } from "node:perf_hooks";
import { logicExercises } from "../prisma/logic-content";
import { languages, type Language, type Json } from "../src/lib/types";
import { submissionBudgetMs, executionRequestTimeoutMs } from "../src/lib/execution-limits";
import { availableRuntime, runCode } from "../src/server/execution/piston";
import { checkConcept } from "../src/server/execution/concepts";
import { judge, judgeProgram } from "../src/server/execution/judge";

const enabled = process.env.ITERA_RUNNER_TIMING === "1";
const options = { skip: enabled ? false : "Requiere ITERA_RUNNER_TIMING=1 y Piston real preparado", timeout: 600000 };
const multi = logicExercises.filter(exercise => (exercise.runtimeMode ?? "FUNCTION") === "FUNCTION" && !exercise.conceptRule)
  .sort((a, b) => b.tests.length - a.tests.length || a.slug.localeCompare(b.slug))[0];
const guided = logicExercises.filter(exercise => exercise.runtimeMode === "PROGRAM" && exercise.conceptRule)
  .sort((a, b) => b.tests.length - a.tests.length || a.slug.localeCompare(b.slug))[0];
const loops: Record<Language, string> = {
  python: "def solve(data):\n    while True:\n        pass\n",
  javascript: "function solve(data) { while (true) {} }",
  typescript: "function solve(data: unknown): number { while (true) {} }",
};

for (const language of languages) test(`duración real secuencial en ${language}`, options, async t => {
  assert.ok(multi && multi.tests.length >= 5, "referencia con varios casos");
  assert.ok(guided?.conceptRule, "referencia PROGRAM con comprobación conceptual");
  const summaries: object[] = [];
  for (const scenario of ["function", "program-concept", "timeouts"] as const) {
    const exercise = scenario === "program-concept" ? guided : multi;
    const tests = scenario === "timeouts"
      ? Array.from({ length: 10 }, () => ({ input: null as Json, expected: 0 as Json })) : exercise.tests;
    const runtimeMode = scenario === "timeouts" ? "FUNCTION" : exercise.runtimeMode ?? "FUNCTION";
    const conceptRule: string = scenario === "program-concept" ? guided.conceptRule! : "";
    const code = scenario === "timeouts" ? loops[language] : exercise[language];
    assert.ok(code, `referencia ${language} disponible`);
    const budgetMs = submissionBudgetMs({ language, totalCount: tests.length, mode: "submit", conceptRule });
    // Tres muestras de referencias; una del peor veredicto de cada caso. Sin
    // paralelismo ni carga artificial: no extrapolar estos números a saturación.
    for (let repeat = 1; repeat <= (scenario === "timeouts" ? 1 : 3); repeat++) {
      const start = performance.now();
      const runtime = await availableRuntime(language); // Opt-in sin runtime: FALLA, no omite.
      const lookupMs = performance.now() - start;
      const caseMs: number[] = [];
      for (const [order, fixture] of tests.entries()) {
        const caseStart = performance.now();
        const output = await runCode(language, runtime, code, fixture.input, runtimeMode,
          scenario === "timeouts" ? "" : exercise.typescriptContract);
        const result = (runtimeMode === "PROGRAM" ? judgeProgram : judge)(output, { ...fixture, visible: true, order });
        caseMs.push(performance.now() - caseStart);
        assert.equal(result.status, scenario === "timeouts" ? "timeout" : "passed", `${scenario}: veredicto del caso ${order + 1}`);
      }
      const conceptStart = performance.now();
      assert.equal(await checkConcept(language, code, conceptRule), null);
      const conceptMs = performance.now() - conceptStart;
      const elapsedMs = performance.now() - start;
      assert.ok(elapsedMs < budgetMs, `${scenario}: duración inferior al presupuesto global`);
      assert.ok(caseMs.every(ms => ms < executionRequestTimeoutMs(language)), `${scenario}: casos dentro del límite HTTP`);
      const round = (ms: number) => Math.round(ms);
      summaries.push({ scenario, repeat, reference: scenario === "timeouts" ? "bucle fijo" : exercise.slug,
        runtime: runtime.version, cases: tests.length, lookupMs: round(lookupMs),
        caseMinMs: round(Math.min(...caseMs)), caseMaxMs: round(Math.max(...caseMs)),
        conceptMs: round(conceptMs), elapsedMs: round(elapsedMs), budgetMs, remainingMs: round(budgetMs - elapsedMs) });
    }
  }
  // Solo agregados y referencias del repositorio; no código, entradas, salidas,
  // errores brutos, credenciales ni datos de estudiantes.
  for (const summary of summaries) t.diagnostic(JSON.stringify({ language, ...summary }));
});
