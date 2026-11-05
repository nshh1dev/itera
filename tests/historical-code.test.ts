import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { historicalCode } from "../src/lib/historical-code";

test("el histórico Python muestra la instantánea completa, en su orden, sin convertirla al manifiesto actual", () => {
  const files = [{ path: "anterior.py", content: "# Código anterior\n" }, { path: "estado.json", content: '{"dato":7}', readOnly: true }];
  const before = structuredClone(files);
  assert.equal(historicalCode("python", "", files), 'anterior.py\n# Código anterior\n\n\nestado.json · lectura\n{"dato":7}');
  assert.deepEqual(files, before);
});

test("el histórico conserva código simple, estructuras desconocidas y otros lenguajes sin reinterpretación", () => {
  for (const files of [null, [], {}, [{ path: "main.py" }], [{ content: "código" }], [null]]) assert.equal(historicalCode("python", "código simple", files), "código simple");
  for (const language of ["javascript", "typescript"] as const) assert.equal(historicalCode(language, "código anterior", [{ path: "main.js", content: "otro" }]), "código anterior");
});

test("nombres y contenidos históricos se representan como texto escapado, no como HTML", () => {
  const text = historicalCode("python", "", [{ path: "<img>", content: '<script>alert("x")</script>' }]);
  const html = renderToStaticMarkup(createElement("pre", null, createElement("code", null, text)));
  assert.ok(html.includes("&lt;img&gt;"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
});
