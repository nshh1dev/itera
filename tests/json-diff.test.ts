import { test } from "node:test";
import assert from "node:assert/strict";
import { firstDifference } from "../src/lib/json-diff";

test("sin diferencias devuelve null", () => {
  assert.equal(firstDifference({ a: [1, 2], b: "x" }, { a: [1, 2], b: "x" }), null);
});

test("distingue tipos", () => {
  const diff = firstDifference(3, "3");
  assert.equal(diff?.kind, "type");
  assert.match(diff!.message, /número/);
  assert.match(diff!.message, /texto/);
});

test("detecta una longitud distinta en una lista", () => {
  const diff = firstDifference([1, 2, 3], [1, 2]);
  assert.equal(diff?.kind, "length");
});

test("señala la posición y el valor diferente", () => {
  const diff = firstDifference([1, 9, 3], [1, 4, 3]);
  assert.equal(diff?.path, "[1]");
  assert.equal(diff?.kind, "value");
  assert.match(diff!.message, /En \[1\]/);
});

test("anida la ruta en objetos", () => {
  const diff = firstDifference({ total: 10, items: [1, 2] }, { total: 10, items: [1, 5] });
  assert.equal(diff?.path, ".items[1]");
});

test("informa de una propiedad que falta", () => {
  const diff = firstDifference({ a: 1, b: 2 }, { a: 1 });
  assert.equal(diff?.kind, "key");
  assert.match(diff!.message, /b/);
});

test("informa de una propiedad que sobra", () => {
  const diff = firstDifference({ a: 1 }, { a: 1, extra: true });
  assert.equal(diff?.kind, "key");
  assert.match(diff!.message, /extra/);
});

test("trata null como su propio tipo", () => {
  const diff = firstDifference(null, 0);
  assert.equal(diff?.kind, "type");
});
