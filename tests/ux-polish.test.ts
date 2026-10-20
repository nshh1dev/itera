import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { curriculumUnits, curriculumSlug } from "../src/lib/curriculum-v2";
import { exerciseSkillSummary } from "../src/lib/exercise-skills";
import { activePathExercise } from "../src/lib/practice-navigation";
import { Statement } from "../src/components/practice/statement";
import type { ExerciseCard } from "../src/lib/types";

test("los 136 pasos describen una habilidad breve sin repetir su título", () => {
  const steps = curriculumUnits.flatMap(unit => unit.steps);
  assert.equal(steps.length, 136);
  for (const step of steps) {
    const summary = exerciseSkillSummary({ slug: curriculumSlug(step.key), title: step.title, description: step.title, practiceGoals: [step.title] });
    assert.ok(summary.length > 20 && summary.length < 130, step.key);
    assert.notEqual(summary.toLowerCase(), step.title.toLowerCase(), step.key);
    assert.ok(!summary.includes("utilizando los datos y reglas del problema"), step.key);
  }
});
test("el contenido personalizado conserva sus habilidades sin duplicarlas", () => {
  const exercise = { slug: "personalizado", title: "Mi reto", description: "Una descripción propia", practiceGoals: ["Mi reto.", "Recorrer una lista", "Recorrer una lista"] };
  assert.equal(exerciseSkillSummary(exercise), "Recorrer una lista");
  assert.equal(exerciseSkillSummary({ ...exercise, practiceGoals: [] }), exercise.description);
  assert.equal(exerciseSkillSummary({ ...exercise, practiceGoals: [], description: "Mi reto" }), "");
});
test("la jerarquía del enunciado conserva el texto y no interpreta HTML", () => {
  const html = renderToStaticMarkup(createElement(Statement, { text: "Una tarea.\n\nEntrada\nUn número.\n\nResultado esperado:\n<script>alert(1)</script>" }));
  assert.match(html, /<p[^>]*>Una tarea\.<\/p>/);
  assert.match(html, /<h3[^>]*>Entrada<\/h3>/);
  assert.match(html, /<h3[^>]*>Resultado esperado<\/h3>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
test("la ruta retoma el pendiente activo sin señalar como pendiente un resuelto", () => {
  const item = (id: string, extra: Partial<ExerciseCard> = {}): ExerciseCard => ({ id, slug: id, title: id, description: "", category: "Fundamentos", level: "INITIATION", order: 0, minutes: 5, runtimeMode: "FUNCTION", started: false, solved: false, solvedOther: false, ...extra });
  const items = [item("primero"), item("activo", { started: true, lastActivityAt: "2026-10-20" }), item("resuelto", { started: true, solved: true, lastActivityAt: "2026-10-21" })];
  assert.equal(activePathExercise(items)?.id, "activo");
  assert.equal(activePathExercise([items[0], items[2]])?.id, "primero");
  assert.equal(activePathExercise([items[2]]), undefined);
});
