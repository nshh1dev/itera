import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ExerciseRow } from "../src/components/exercise-row";
import { Results } from "../src/components/practice/results";
import type { ExerciseCard, ExecutionResult } from "../src/lib/types";

const exercise: ExerciseCard = { id: "example", slug: "ejemplo", title: "Un ejercicio", description: "Descripción", category: "Fundamentos", order: 6, level: "BEGINNER", minutes: 5, runtimeMode: "FUNCTION", solved: false, started: false, solvedOther: false };

test("el catálogo no implica una secuencia y las rutas conservan su numeración", () => {
  const catalog = renderToStaticMarkup(createElement(ExerciseRow, { exercise }));
  const path = renderToStaticMarkup(createElement(ExerciseRow, { exercise, pathSlug: "desde-cero" }));
  assert.doesNotMatch(catalog, />07</);
  assert.match(path, />07</);
  assert.match(path, /ruta=desde-cero/);
  for (const state of [{ solved: true, text: "Resuelto" }, { started: true, text: "En progreso" }]) {
    const html = renderToStaticMarkup(createElement(ExerciseRow, { exercise: { ...exercise, ...state } }));
    assert.match(html, new RegExp(`>${state.text}</span>`));
  }
});

for (const runtimeMode of ["FUNCTION", "PROGRAM"] as const) {
  test(`la comparación ${runtimeMode} conserva resultados visibles y no muestra datos ocultos`, () => {
    const result: ExecutionResult = {
      id: "result", mode: "examples", status: "FAILED", passedCount: 0, totalCount: 2,
      results: [
        { index: 1, visible: true, passed: false, status: "wrong", input: "entrada", expected: "esperado", actual: "obtenido" },
        { index: 2, visible: false, passed: false, status: "wrong", input: "entrada-secreta", expected: "esperado-secreto", actual: "obtenido-secreto", error: "error-secreto" },
      ],
    };
    const html = renderToStaticMarkup(createElement(Results, { result, busy: false, error: "", runtimeMode }));
    assert.match(html, /result-comparison/);
    assert.match(html, /esperado/);
    assert.match(html, /obtenido/);
    assert.match(html, /pruebas ocultas superadas/);
    assert.doesNotMatch(html, /entrada-secreta|esperado-secreto|obtenido-secreto|error-secreto/);
  });
}
