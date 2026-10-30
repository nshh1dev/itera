import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { diagnosticExercises, diagnosticRecommendation, effectiveLevel } from "../src/lib/learning-profile";
import { personalizedPractice, type PracticeEntry } from "../src/lib/practice-navigation";
import { levels, languages, type ExerciseCard } from "../src/lib/types";
import { logicExercises } from "../prisma/logic-content";
import { Results } from "../src/components/practice/results";
import { executionSchema } from "../src/lib/validation";
import { randomUUID } from "node:crypto";
import { OnboardingProgress } from "../src/components/onboarding-progress";
import { StartingPoint } from "../src/components/starting-point";
import { learningPaths } from "../src/lib/learning-paths";

test("cada diagnóstico reutiliza tres ejercicios reales con variantes en los tres lenguajes", () => {
  for (const level of levels) {
    const slugs = diagnosticExercises[level];
    assert.equal(new Set(slugs).size, 3);
    for (const [index, slug] of slugs.entries()) {
      const exercise = logicExercises.find(item => item.slug === slug);
      assert.ok(exercise, slug);
      if (index < 2) assert.equal(exercise.level, level);
      for (const language of languages) {
        assert.ok(exercise[language], `${slug}: referencia ${language}`);
        assert.ok(exercise.tests.length);
      }
    }
  }
});

test("omitir o interrumpir no se interpreta como un nivel bajo", () => {
  for (const level of levels) {
    for (const outcomes of [[], [null, null], ["PASSED", "ERROR"], ["RUNNING", "FAILED"], ["ERROR", "ERROR"]] as const) {
      assert.equal(diagnosticRecommendation(level, outcomes).level, null);
    }
  }
});

test("las recomendaciones son conservadoras y solo avanzan con el tercer reto superado", () => {
  assert.equal(diagnosticRecommendation("INITIATION", ["FAILED", "FAILED"]).level, "INITIATION");
  assert.equal(diagnosticRecommendation("INTERMEDIATE", ["FAILED", "FAILED"]).level, "BEGINNER");
  assert.equal(diagnosticRecommendation("BEGINNER", ["PASSED", "FAILED"]).level, "BEGINNER");
  assert.equal(diagnosticRecommendation("BEGINNER", ["PASSED", "PASSED"]).level, "BEGINNER");
  assert.equal(diagnosticRecommendation("BEGINNER", ["PASSED", "PASSED", "ERROR"]).level, "BEGINNER");
  assert.equal(diagnosticRecommendation("BEGINNER", ["PASSED", "PASSED", "PASSED"]).level, "INTERMEDIATE");
  assert.equal(diagnosticRecommendation("ADVANCED", ["PASSED", "PASSED", "PASSED"]).level, "ADVANCED");
});

test("cambiar el nivel declarado deja de aplicar un diagnóstico de otra declaración", () => {
  assert.equal(effectiveLevel(undefined), "INITIATION");
  assert.equal(effectiveLevel("BEGINNER", { declaredLevel: "BEGINNER", suggestedLevel: "INTERMEDIATE" }), "INTERMEDIATE");
  assert.equal(effectiveLevel("INITIATION", { declaredLevel: "BEGINNER", suggestedLevel: "INTERMEDIATE" }), "INITIATION");
});

test("el punto de partida distingue un diagnóstico inconcluso de no haberlo hecho", () => {
  const summary = { language: "python" as const, declaredLevel: "BEGINNER" as const, suggestedLevel: null, reason: "Conservamos tu nivel declarado.", path: learningPaths[1], diagnosticDate: "2026-10-26T00:00:00.000Z" };
  const inconclusive = renderToStaticMarkup(createElement(StartingPoint, { summary }));
  assert.match(inconclusive, /Sin resultado concluyente/); assert.doesNotMatch(inconclusive, /Sin diagnóstico/);
  assert.match(renderToStaticMarkup(createElement(StartingPoint, { summary: { ...summary, diagnosticDate: null } })), /Sin diagnóstico/);
});

const exercise = (id: string, extra: Partial<ExerciseCard> = {}): ExerciseCard => ({ id, slug: id, title: id, description: "", category: "Fundamentos", level: "INITIATION", order: 0, minutes: 5, runtimeMode: "FUNCTION", solved: false, started: false, solvedOther: false, ...extra });
test("la recomendación respeta el lenguaje preferido, el punto de partida y la práctica pendiente", () => {
  const entries: PracticeEntry[] = [
    { exercise: exercise("bases"), language: "python", routes: ["desde-cero"] },
    { exercise: exercise("intermedio"), language: "python", routes: ["pensar-en-soluciones"] },
    { exercise: exercise("otro", { started: true }), language: "typescript", date: "2026-10-23" },
  ];
  assert.equal(personalizedPractice(entries, "python", "pensar-en-soluciones")?.exercise.id, "intermedio");
  entries[0] = { ...entries[0], exercise: exercise("bases", { started: true }), date: "2026-10-20" };
  assert.equal(personalizedPractice(entries, "python", "pensar-en-soluciones")?.exercise.id, "bases");
  assert.equal(personalizedPractice(entries, "python")?.language, "python");
  assert.equal(personalizedPractice([], "python"), undefined);
});

test("el resultado diagnóstico nunca promete progreso guardado", () => {
  const html = renderToStaticMarkup(createElement(Results, { diagnostic: true, busy: false, error: "", result: { id: "diagnostic", mode: "submit", status: "PASSED", passedCount: 1, totalCount: 1, results: [] } }));
  assert.match(html, /Reto de diagnóstico superado/);
  assert.doesNotMatch(html, /Progreso guardado|Tu progreso está guardado|Ejercicio resuelto/);
});

test("la ejecución valida el identificador diagnóstico sin aceptar cambios de usuario", () => {
  const base = { variantId: "variant", code: "print(1)", mode: "submit", idempotencyKey: randomUUID() };
  assert.ok(executionSchema.safeParse(base).success);
  assert.ok(executionSchema.safeParse({ ...base, diagnosticItemId: "item" }).success);
  assert.equal(executionSchema.safeParse({ ...base, diagnosticItemId: "" }).success, false);
  assert.equal(executionSchema.safeParse({ ...base, diagnosticItemId: "x".repeat(101) }).success, false);
  assert.equal("userId" in executionSchema.parse({ ...base, userId: "otro" }), false);
});

test("la bienvenida tiene dos pasos y deja el diagnóstico fuera de la secuencia obligatoria", () => {
  const html = renderToStaticMarkup(createElement(OnboardingProgress, { step: 3 }));
  assert.equal((html.match(/<li /g) ?? []).length, 2);
  assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1);
  assert.match(html, /Diagnóstico opcional/);
  assert.doesNotMatch(html, /Paso 3 de/);
  assert.match(html, /Punto de partida/);
  const initial = renderToStaticMarkup(createElement(OnboardingProgress, { step: 1 }));
  assert.match(initial, /Paso 1 de 2/);
  const final = renderToStaticMarkup(createElement(OnboardingProgress, { step: 4 }));
  assert.match(final, /Paso 2 de 2/);
});
