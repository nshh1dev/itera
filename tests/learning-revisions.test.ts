import { test } from "node:test";
import assert from "node:assert/strict";
import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent } from "../prisma/editorial-revision";
import { editorialSchema } from "../src/lib/editorial";
import { distinctExamples } from "../src/lib/public-examples";

test("los 136 retos no duplican casos y las entradas variables producen resultados distintos", () => {
  for (const exercise of logicExercises) {
    assert.equal(new Set(exercise.tests.map(test => JSON.stringify([test.input, test.expected]))).size, exercise.tests.length, exercise.slug);
    const fixed = exercise.runtimeMode === "PROGRAM" && exercise.tests.every(test => test.input === "");
    if (fixed) assert.equal(exercise.tests.length, 1, exercise.slug);
    else {
      assert.ok(new Set(exercise.tests.map(test => JSON.stringify(test.input))).size >= 3, exercise.slug);
      assert.ok(new Set(exercise.tests.map(test => JSON.stringify(test.expected))).size > 1, exercise.slug);
      assert.ok(exercise.tests.some(test => !test.visible), exercise.slug);
    }
  }
});

test("una salida fija no necesita pruebas ocultas artificiales; una entrada variable sí", () => {
  const source = logicExercises.find(exercise => exercise.slug === "logica-cambio")!;
  const version = seedVersionContent(source);
  const variants = Object.fromEntries(version.variants.map(variant => [variant.language, variant]));
  const input = { ...source, ...version, ...variants, tests: version.variants[0].tests };
  assert.equal(editorialSchema.safeParse(input).success, true);
  assert.equal(editorialSchema.safeParse({ ...input, runtimeMode: "FUNCTION", conceptRule: "" }).success, false);
  assert.equal(editorialSchema.safeParse({ ...input, activityType: "PRACTICE" }).success, false);
  assert.equal(editorialSchema.safeParse({ ...input, conceptRule: "arbitrary-code" }).success, false);
});

test("los ejemplos publicados idénticos se presentan una sola vez sin alterar los casos originales", () => {
  const examples = [{ input: "", expected: "7\n" }, { input: "", expected: "7\n" }];
  assert.equal(distinctExamples(examples).length, 1);
  assert.equal(examples.length, 2);
  assert.equal(distinctExamples([{ input: 1, expected: 2 }, { input: 2, expected: 2 }]).length, 2);
});

test("el reto de cambio no adelanta entrada ni funciones y declara el concepto solicitado", () => {
  const exercise = logicExercises.find(exercise => exercise.slug === "logica-cambio")!;
  assert.equal(exercise.runtimeMode, "PROGRAM");
  assert.equal(exercise.activityType, "GUIDED");
  assert.equal(exercise.conceptRule, "subtraction");
  assert.match(exercise.statement, /variables/);
  assert.match(exercise.statement, /resta/);
  assert.doesNotMatch(exercise.statement, /solve|input|JSON|se comprueba el resultado/);
});

test("sumar del uno al N no se supera devolviendo N y las plantillas guiadas se identifican como tales", () => {
  const sum = logicExercises.find(exercise => exercise.slug === "logica-suma-uno-n")!;
  assert.ok(sum.tests.some(test => test.input === 3 && test.expected === 6));
  assert.equal(sum.activityType, "GUIDED");
  for (const key of ["invierte", "dos-requisitos", "busqueda-binaria", "indices", "maximo"]) assert.equal(logicExercises.find(exercise => exercise.slug === `logica-${key}`)?.activityType, "GUIDED");
});
