import { test } from "node:test";
import assert from "node:assert/strict";
import { dashboardOverview, type DashboardPath } from "../src/lib/dashboard";
import { personalizedPractice } from "../src/lib/practice-navigation";
import type { ExerciseCard } from "../src/lib/types";

const exercise = (id: string, extra: Partial<ExerciseCard> = {}): ExerciseCard => ({ id, slug: id, title: id, description: "", category: "Fundamentos", level: "INITIATION", order: 0, minutes: 5, runtimeMode: "FUNCTION", solved: false, started: false, solvedOther: false, ...extra });
const paths: DashboardPath[] = [
  { slug: "bases", title: "Bases", items: [{ exerciseId: "a" }, { exerciseId: "b" }, { exerciseId: "c" }] },
  { slug: "otra", title: "Otra ruta", items: [{ exerciseId: "d" }] },
];

test("el dashboard cuenta solo los ejercicios publicados y completados de la ruta actual", () => {
  const catalog = [exercise("a", { solved: true }), exercise("b", { started: true }), exercise("d", { solved: true })];
  const result = dashboardOverview({ catalog, paths, currentPathSlug: "bases" });
  assert.deepEqual(result.path, { slug: "bases", title: "Bases", completed: 1, total: 2 });
  assert.equal(dashboardOverview({ catalog: [], paths }).path?.total, 0);
  assert.equal(dashboardOverview({ catalog, paths: [] }).path, undefined);
});

test("una ruta terminada no desaparece del resumen al completarla", () => {
  const catalog = [exercise("a", { solved: true }), exercise("b", { solved: true }), exercise("c", { solved: true }), exercise("d")];
  assert.deepEqual(dashboardOverview({ catalog, paths, currentPathSlug: "bases" }).path, { slug: "bases", title: "Bases", completed: 3, total: 3 });
});

test("la ruta del ejercicio pendiente destacado tiene prioridad sobre una ruta anterior", () => {
  const catalog = [exercise("a"), exercise("d", { started: true })];
  const result = dashboardOverview({ catalog, paths, currentPathSlug: "bases", recommendation: { exercise: catalog[1], language: "python", pathSlug: "otra", resume: true } });
  assert.equal(result.path?.slug, "otra");
  assert.match(result.reason, /dejaste pendiente/);
});

test("actividad reciente es única, relevante, ordenada y no repite el siguiente paso", () => {
  const catalog = [
    exercise("a", { started: true, lastActivityAt: "2026-10-23T10:00:00Z" }),
    exercise("b", { solved: true, lastActivityAt: "2026-10-23T09:00:00Z" }),
    exercise("c", { started: true, lastActivityAt: "2026-10-23T08:00:00Z" }),
    exercise("d", { started: true, lastActivityAt: "2026-10-22T08:00:00Z" }),
    exercise("e", { started: true, lastActivityAt: "2026-10-21T08:00:00Z" }),
    exercise("solo-visita", { lastActivityAt: "2026-10-24T10:00:00Z" }),
  ];
  const result = dashboardOverview({ catalog, paths, recommendation: { exercise: catalog[0], language: "python", resume: true } });
  assert.deepEqual(result.recent.map(item => item.id), ["b", "c", "d"]);
  assert.equal(result.recent[0].solved, true);
  assert.equal(result.recent[1].solved, false);
});

test("la recomendación distingue una visita de un borrador y avanza tras resolver", () => {
  const entries = [
    { exercise: exercise("a"), language: "python" as const, routes: ["bases"], pathSlug: "bases", date: "2026-10-23" },
    { exercise: exercise("b"), language: "python" as const, routes: ["bases"] },
  ];
  assert.equal(personalizedPractice(entries, "python")?.resume, false);
  entries[0].exercise.started = true;
  assert.equal(personalizedPractice(entries, "python")?.resume, true);
  entries[0].exercise.solved = true;
  const next = personalizedPractice(entries, "python");
  assert.equal(next?.exercise.id, "b");
  assert.equal(next?.resume, false);
  assert.equal(next?.pathSlug, "bases");
  assert.match(dashboardOverview({ catalog: entries.map(item => item.exercise), paths, recommendation: next }).reason, /orden de tu ruta/);
});

test("un catálogo completado no recomienda un ejercicio resuelto como nuevo", () => {
  assert.equal(personalizedPractice([{ exercise: exercise("a", { solved: true }), language: "python", date: "2026-10-23" }], "python"), undefined);
  assert.equal(personalizedPractice([{ exercise: exercise("a", { solved: true }), language: "python" }], "python"), undefined);
});

test("práctica libre explica la relación sin inventar coincidencias de nivel o tema", () => {
  const catalog = [exercise("a", { solved: true, lastActivityAt: "2026-10-23" }), exercise("b")];
  const recommendation = { exercise: catalog[1], language: "python" as const, resume: false };
  assert.match(dashboardOverview({ catalog, paths, recommendation }).reason, /mismo tema y nivel/);
  catalog[1].level = "ADVANCED";
  assert.match(dashboardOverview({ catalog, paths, recommendation }).reason, /nuevo reto pendiente/);
  assert.doesNotMatch(dashboardOverview({ catalog, paths, recommendation }).reason, /mismo tema/);
});
