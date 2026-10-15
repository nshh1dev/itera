import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { ExerciseNotes } from "../src/components/practice/exercise-notes";

test("las notas no ocupan espacio cuando no hay coste ni errores", () => {
  assert.equal(renderToStaticMarkup(ExerciseNotes({ complexity: "   ", commonErrors: [] })), "");
});

test("las notas muestran el coste y los errores comunes", () => {
  const html = renderToStaticMarkup(ExerciseNotes({ complexity: "Tiempo O(n), espacio O(1).", commonErrors: ["Olvidar el caso vacío.", "Recorrer dos veces la lista."] }));
  assert.match(html, /Coste/);
  assert.match(html, /Tiempo O\(n\), espacio O\(1\)\./);
  assert.match(html, /Errores comunes/);
  assert.match(html, /Olvidar el caso vacío\./);
  assert.match(html, /Recorrer dos veces la lista\./);
});

test("las notas escapan el HTML del contenido", () => {
  const html = renderToStaticMarkup(ExerciseNotes({ complexity: "<b>O(n)</b>", commonErrors: ["Ejecutar <script>alert(1)</script>"] }));
  assert.doesNotMatch(html, /<b>O\(n\)<\/b>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;b&gt;/);
});
