import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { ActivityList, type Activity } from "../src/components/activity-list";

test("los intentos retirados enlazan al historial y no a un ejercicio inexistente", () => {
  const item: Activity = { id: "old", status: "PASSED", mode: "submit", createdAt: new Date("2026-10-20T12:00:00Z"), passedCount: 3, totalCount: 3,
    variant: { language: "python", version: { title: "Mi reto anterior", exercise: { slug: "reto-anterior", published: false } } } };
  const html = renderToStaticMarkup(ActivityList({ entries: [item] }));
  assert.match(html, /href="\/progreso#historial-anterior"/);
  assert.match(html, /Catálogo anterior/);
  assert.doesNotMatch(html, /\/ejercicios\/reto-anterior/);
  item.variant.version.exercise.published = true;
  assert.match(renderToStaticMarkup(ActivityList({ entries: [item] })), /\/ejercicios\/reto-anterior\?lenguaje=python/);
});
