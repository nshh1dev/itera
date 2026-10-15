import { test } from "node:test";
import assert from "node:assert/strict";
import { searchNormalize } from "../src/lib/utils";

test("ignora mayúsculas y acentos", () => {
  assert.equal(searchNormalize("Números"), "numeros");
  assert.equal(searchNormalize("BÚSQUEDA"), "busqueda");
});

test("permite encontrar una palabra acentuada desde su forma sin acentos", () => {
  assert.ok(searchNormalize("División entera").includes(searchNormalize("division")));
});

test("conserva el texto cuando no hay acentos", () => {
  assert.equal(searchNormalize("lista de enteros"), "lista de enteros");
});
