import { test } from "node:test";
import assert from "node:assert/strict";
import { submissionBudgetMs, executionRequestTimeoutMs, runtimeLookupTimeoutMs } from "../src/lib/execution-limits";

const base = { language: "typescript", totalCount: 10, mode: "submit", conceptRule: "" };

test("el presupuesto cubre todos los límites HTTP secuenciales y margen de finalización", () => {
  for (const language of ["python", "javascript", "typescript"] as const) {
    for (let totalCount = 1; totalCount <= 10; totalCount++) {
      const budget = submissionBudgetMs({ ...base, language, totalCount });
      assert.ok(budget >= runtimeLookupTimeoutMs + totalCount * executionRequestTimeoutMs(language) + 30000);
      assert.ok(budget >= 120000);
    }
  }
  assert.equal(submissionBudgetMs(base), 282500);
});

test("la validación conceptual incluye su consulta y parser, también TypeScript para JavaScript", () => {
  assert.equal(submissionBudgetMs({ ...base, conceptRule: "regla" }), 310000);
  assert.equal(submissionBudgetMs({ ...base, language: "javascript", conceptRule: "regla" }), 180000);
  assert.equal(submissionBudgetMs({ ...base, language: "python", conceptRule: "regla" }), 167000);
  assert.equal(submissionBudgetMs({ ...base, mode: "examples", conceptRule: "regla" }), submissionBudgetMs(base));
});

test("las evaluaciones cortas mantienen dos minutos y las históricas no se truncan a diez casos", () => {
  assert.equal(submissionBudgetMs({ ...base, totalCount: 1 }), 120000);
  assert.equal(submissionBudgetMs({ ...base, language: "python", totalCount: 3 }), 120000);
  assert.equal(submissionBudgetMs({ ...base, totalCount: 15 }), 407500);
  for (const totalCount of [0, -1, NaN, Infinity, 1.5]) assert.equal(submissionBudgetMs({ ...base, totalCount }), submissionBudgetMs(base));
});
