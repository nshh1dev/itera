import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { exampleJson } from "../src/lib/public-examples";
import type { Json } from "../src/lib/types";
import { Examples } from "../src/components/practice/examples";
import { Statement } from "../src/components/practice/statement";

test("los diccionarios y listas anidadas se sangran sin cambiar valores, orden ni escapes JSON", () => {
  const values: Json[] = [
    { alumno: { curso: 0, pendiente: null }, activa: false },
    [[1, 2], [], [-3, 0]], [{ nombre: "Ana", texto: "<script>\n\t\"&" }],
    { segunda: 2, primera: 1, vacio: [] },
  ];
  for (const value of values) {
    const before = JSON.stringify(value);
    const formatted = exampleJson(value, true);
    assert.equal(formatted, JSON.stringify(value, null, 2));
    assert.deepEqual(JSON.parse(formatted), value);
    assert.equal(JSON.stringify(value), before);
    assert.equal(exampleJson(value), before);
    assert.equal(exampleJson(value, false), before);
  }
});

test("valores simples, colecciones vacías y listas planas siguen compactos", () => {
  for (const value of [null, true, false, 0, -2.5, " a\nb ", [], {}, [1, 2, null, false, "x"]] satisfies Json[]) {
    assert.equal(exampleJson(value, true), JSON.stringify(value));
  }
});

test("el render usa JSON legible solo por opción y escapa HTML sin cambiar texto PROGRAM ni archivos", () => {
  const examples = [{ input: { a: [1, 2] }, expected: [[0]], explanation: "Texto <seguro>." }];
  const compact = renderToStaticMarkup(createElement(Examples, { examples }));
  const readable = renderToStaticMarkup(createElement(Examples, { examples, readableJson: true }));
  assert.match(compact, /\{&quot;a&quot;:\[1,2\]\}/);
  assert.match(readable, /\{\n  &quot;a&quot;: \[/);
  assert.match(readable, /\[\n  \[\n    0\n  \]\n\]/);
  assert.match(readable, /Texto &lt;seguro&gt;/);
  const programs = [{ input: "  2\n10\n", expected: "Resultado: 12\n", expectedFiles: [{ path: "salida.txt", content: "  exacto\n\n" }] }];
  const render = (readableJson: boolean) => renderToStaticMarkup(createElement(Examples, { examples: programs, runtimeMode: "PROGRAM", readableJson }));
  assert.equal(render(true), render(false));
  assert.match(render(true), />  2\n10\n<\/pre>/);
  assert.match(render(true), />Resultado: 12\n<\/pre>/);
  assert.match(render(true), />  exacto\n\n<\/pre>/);
  assert.equal(renderToStaticMarkup(createElement(Examples, { examples: [], readableJson: true })), "");
});

test("los encabezados editoriales nuevos son optativos, literales y no interpretan HTML ni sintaxis", () => {
  const text = "Antes de resolver:\nConserva <script> y `data` como texto.\n\nEntrada y resultado\nRecibe a y devuelve b.\n\nAntes de resolver no es una etiqueta\nNo debe ser un encabezado.\n\nEntrada y resultado:\n";
  const render = (editorialHeadings: boolean) => renderToStaticMarkup(createElement(Statement, { text, editorialHeadings }));
  assert.doesNotMatch(render(false), /<h3/);
  assert.equal((render(true).match(/<h3/g) ?? []).length, 2);
  assert.match(render(true), /<h3[^>]*>Antes de resolver<\/h3>/);
  assert.match(render(true), /<h3[^>]*>Entrada y resultado<\/h3>/);
  assert.match(render(true), /Conserva &lt;script&gt; y `data` como texto/);
  assert.doesNotMatch(render(true), /<script>|<code>/);
  const original = "Tu tarea\nDevuelve 1.\n\nEntrada\nSin datos.\n\nResultado esperado\nUno.";
  assert.equal(renderToStaticMarkup(createElement(Statement, { text: original })), renderToStaticMarkup(createElement(Statement, { text: original, editorialHeadings: true })));
});
