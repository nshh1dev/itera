import { test } from "node:test";
import assert from "node:assert/strict";
import { exerciseState, nextPractice, relatedExercise, sortExercises, type PracticeEntry } from "../src/lib/practice-navigation";
import type { ExerciseCard } from "../src/lib/types";

const exercise = (id: string, order: number, extra: Partial<ExerciseCard> = {}): ExerciseCard => ({ id, slug: id, title: id, description: "", category: "Fundamentos", level: "INITIATION", order, minutes: 5, runtimeMode: "FUNCTION", solved: false, started: false, solvedOther: false, ...extra });
test("los estados distinguen borradores e intentos de la finalización", () => {
  assert.equal(exerciseState(exercise("a", 0)), "Sin empezar");
  assert.equal(exerciseState(exercise("a", 0, { started: true })), "En progreso");
  assert.equal(exerciseState(exercise("a", 0, { started: true, solved: true })), "Resuelto");
});
test("retomar considera todos los pendientes y prioriza la actividad, no la preferencia", () => {
  const entries: PracticeEntry[] = [
    { exercise: exercise("a", 0, { started: true }), language: "python", date: "2026-10-19" },
    { exercise: exercise("b", 1, { started: true }), language: "javascript", date: "2026-10-20", pathSlug: "ruta" },
    { exercise: exercise("c", 2, { started: true, solved: true }), language: "python", date: "2026-10-21" },
  ];
  const next = nextPractice(entries, "python");
  assert.equal(next?.exercise.id, "b");
  assert.equal(next?.language, "javascript");
  assert.equal(next?.pathSlug, "ruta");
  assert.equal(next?.resume, true);
});
test("una visita sin código ni intentos no cuenta como ejercicio iniciado", () => {
  const next = nextPractice([{ exercise: exercise("a", 0), language: "python", date: "2026-10-20" }], "python");
  assert.equal(next?.resume, false);
});
test("al completar se continúa dentro de la ruta, sin saltar a otra", () => {
  const entries: PracticeEntry[] = [
    { exercise: exercise("libre", 0), language: "python", routes: [] },
    { exercise: exercise("a", 1, { solved: true }), language: "python", routes: ["ruta"], pathSlug: "ruta", date: "2026-10-20" },
    { exercise: exercise("b", 2), language: "python", routes: ["ruta"] },
  ];
  assert.equal(nextPractice(entries, "python")?.exercise.id, "b");
  assert.equal(nextPractice(entries, "python")?.pathSlug, "ruta");
});
test("una cuenta nueva comienza por el primer ejercicio en su lenguaje", () => {
  const entries: PracticeEntry[] = [{ exercise: exercise("a", 0), language: "python" }, { exercise: exercise("a", 0), language: "typescript" }];
  assert.equal(nextPractice(entries, "typescript")?.exercise.id, "a");
  assert.equal(nextPractice(entries, "typescript")?.language, "typescript");
  assert.equal(nextPractice([], "python"), undefined);
});
test("práctica libre recomienda por categoría y nivel sin repetir resueltos", () => {
  const current = exercise("a", 0);
  const items = [current, exercise("b", 1, { solved: true }), exercise("c", 2, { category: "Grafos" }), exercise("d", 3)];
  assert.equal(relatedExercise(items, current)?.id, "d");
  assert.equal(relatedExercise([current], current), undefined);
});
test("los órdenes son estables y no modifican el catálogo compartido", () => {
  const items = [exercise("a", 0, { level: "ADVANCED", minutes: 20 }), exercise("b", 1), exercise("c", 2)];
  assert.deepEqual(sortExercises(items, "curricular").map(item => item.id), ["a", "b", "c"]);
  assert.deepEqual(sortExercises(items, "dificultad").map(item => item.id), ["b", "c", "a"]);
  assert.deepEqual(sortExercises(items, "duracion").map(item => item.id), ["b", "c", "a"]);
  assert.equal(items[0].id, "a");
});
