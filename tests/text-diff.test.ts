import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { firstTextDifference } from "../src/lib/json-diff";
import { judgeProgram } from "../src/server/execution/judge";
import { Results } from "../src/components/practice/results";
import type { ExecutionResult, TestResult } from "../src/lib/types";

test("la diferencia textual señala la primera línea y columna desde 1", () => {
  assert.deepEqual(firstTextDifference("uno\ndos\ntres", "uno\ndas\ncuatro"), {
    line: 2, column: 2, message: 'En la línea 2, columna 2: se esperaba "o" y recibiste "a".',
  });
  assert.equal(firstTextDifference("Hola", "hola")?.column, 1);
});

test("distingue espacio, tabulación, salto de línea y fin de salida", () => {
  assert.match(firstTextDifference("a b", "a\tb")!.message, /se esperaba un espacio y recibiste una tabulación/);
  assert.match(firstTextDifference("a\nb", "a b")!.message, /se esperaba un salto de línea y recibiste un espacio/);
  assert.match(firstTextDifference("a\nb", "a")!.message, /se esperaba un salto de línea y recibiste el final de la salida/);
  assert.match(firstTextDifference("a", "ab")!.message, /se esperaba el final de la salida y recibiste "b"/);
  assert.equal(firstTextDifference("", "a")?.column, 1);
  assert.equal(firstTextDifference("a", "")?.column, 1);
  assert.match(firstTextDifference("a b", "a\u00a0b")!.message, /U\+00A0/);
});

test("las columnas cuentan puntos Unicode sin partir emojis", () => {
  assert.equal(firstTextDifference("😀áx", "😀áy")?.column, 3);
  assert.match(firstTextDifference("😀", "😃")!.message, /"😀" y recibiste "😃"/);
  assert.equal(firstTextDifference("é", "e\u0301")?.column, 1);
  assert.equal(firstTextDifference("a\r\n😀x", "a\n😀y")?.line, 2);
  assert.equal(firstTextDifference("a\r\n😀x", "a\n😀y")?.column, 2);
});

test("la normalización textual coincide con judgeProgram, también con espacios Unicode", () => {
  const outputs = ["", " ", "\n\n", "a", "a\n", "a \r\n\t\n", "a\rb", "a\nb", "a\r\nb", " a", "a b", "a\tb", "a\u00a0b", "a\u00a0\n", "😀á", "😀a", "é", "e\u0301"];
  for (const expected of outputs) for (const actual of outputs) {
    const result = judgeProgram({ stdout: actual, stderr: "", code: 0 }, { input: "", expected, visible: true, order: 0 });
    assert.equal(firstTextDifference(expected, actual) === null, result.passed, JSON.stringify({ expected, actual }));
    assert.equal(firstTextDifference(expected, result.actual as string) === null, result.passed);
  }
});

test("la explicación está acotada aunque la salida tenga miles de caracteres", () => {
  const prefix = "a".repeat(65535);
  const diff = firstTextDifference(prefix + "x", prefix + "y");
  assert.equal(diff?.column, 65536);
  assert.ok(diff!.message.length < 150);
});

function render(results: TestResult[], runtimeMode: "FUNCTION" | "PROGRAM" = "PROGRAM") {
  const result: ExecutionResult = { id: "result", mode: "examples", status: "FAILED", passedCount: 0, totalCount: results.length, results };
  return renderToStaticMarkup(createElement(Results, { result, runtimeMode, busy: false, error: "" }));
}

const visible: TestResult = { index: 1, visible: true, passed: false, status: "wrong", input: "", expected: "uno\ndos\n", actual: "uno\ndas", output: "uno\ndas\n" };

test("PROGRAM muestra la primera diferencia solo de casos visibles y conserva la salida completa", () => {
  const html = render([visible, { ...visible, index: 2, visible: false, input: "entrada-secreta", expected: "esperado-secreto", actual: "obtenido-secreto", output: "salida-secreta", error: "error-secreto" }]);
  assert.match(html, /Primera diferencia/);
  assert.match(html, /línea 2, columna 2/);
  assert.match(html, /uno\ndas\n/);
  assert.match(html, /pruebas ocultas superadas/);
  assert.doesNotMatch(html, /secreta|secreto/);
  assert.equal((html.match(/Primera diferencia/g) ?? []).length, 1);
});

test("no explica diferencias de salida en aciertos, errores de proceso o resultados ausentes", () => {
  for (const change of [{ passed: true, status: "passed" as const }, { status: "runtime" as const }, { status: "timeout" as const }, { actual: undefined }]) {
    assert.doesNotMatch(render([{ ...visible, ...change }]), /Primera diferencia/);
  }
  const withoutActual = { ...visible };
  delete withoutActual.actual;
  assert.doesNotMatch(render([withoutActual]), /Primera diferencia/);
  assert.doesNotMatch(render([{ ...visible, expected: "uno\ndas \r\n\n" }]), /Primera diferencia/);
});

test("FUNCTION conserva su comparación JSON y escapa HTML en el mensaje textual", () => {
  assert.match(render([{ ...visible, expected: [1, 2], actual: [1, 9] }], "FUNCTION"), /En \[1\]/);
  const html = render([{ ...visible, expected: "<script>alert(1)</script>", actual: ">" }]);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;/);
});
