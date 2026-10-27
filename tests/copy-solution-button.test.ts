import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CopySolutionButton } from "../src/components/practice/copy-solution-button";

test("copiar una solución ofrece un botón explícito sin duplicar su código en el HTML", () => {
  const html = renderToStaticMarkup(createElement(CopySolutionButton, { code: "print('solución privada')" }));
  assert.match(html, /aria-label="Copiar solución"/);
  assert.doesNotMatch(html, /solución privada/);
  assert.doesNotMatch(html, /Solución copiada/);
});

test("copiar archivos de una solución distingue sus botones por la ruta", () => {
  const html = renderToStaticMarkup(createElement(CopySolutionButton, { code: "", filename: "lib/calculo.py" }));
  assert.match(html, /aria-label="Copiar solución de lib\/calculo.py"/);
});
