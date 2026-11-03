import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { exerciseConditions, learningHelp, uniqueHelp } from "../src/lib/learning-help";
import { pythonCatalog } from "../prisma/python-content";
import { LearningGuide } from "../src/components/practice/learning-guide";
import { ModuleLesson } from "../src/components/practice/module-lesson";
import { ExerciseNotes } from "../src/components/practice/exercise-notes";

test("la ayuda elimina objetivos repetidos y relleno sin confundir conceptos diferentes", () => {
  assert.deepEqual(learningHelp({ title: "Suma dos números", statement: "Entrega su suma.\n\nEntrada\nDos enteros.", objective: "Entrega su suma.", practiceGoals: ["Suma dos números.", "Sumar enteros.", " sumar enteros ", "Suma dos números utilizando los datos y reglas del problema."], prerequisites: ["Usar return.", "Usar return", "Distinguir imprimir de devolver."] }), {
    goals: ["Sumar enteros."], prerequisites: ["Usar return.", "Distinguir imprimir de devolver."],
  });
  assert.deepEqual(uniqueHelp(["No olvides cero.", "Conservar negativos."], ["No olvides cero"]), ["Conservar negativos."]);
  assert.deepEqual(uniqueHelp(["Usar a != b.", "Usar a = b."]), ["Usar a != b.", "Usar a = b."]);
  assert.deepEqual(learningHelp({ objective: "Combinar datos y devolver una suma.", practiceGoals: ["Leer dos propiedades.", "Sumar sus valores."], prerequisites: [] }).goals, ["Leer dos propiedades.", "Sumar sus valores."]);
});

test("la guía muestra los conceptos directamente y reserva el desplegable para el repaso", () => {
  const html = renderToStaticMarkup(createElement(LearningGuide, {
    objective: "Usar una variable.", practiceGoals: ["Usar una variable."], prerequisites: ["Mostrar texto."],
  }, createElement(ModuleLesson, { lesson: { title: "Variables", objective: "Usar una variable.", theory: "Una variable conserva un valor.", example: "nombre = 'Ada'" }, language: "python" })));
  assert.doesNotMatch(html, /Comprender la idea/);
  assert.match(html, /Qué vas a practicar/);
  assert.match(html, /Antes de empezar/);
  assert.match(html, /No es la solución del reto/);
  assert.equal((html.match(/Usar una variable\./g) ?? []).length, 1);
  assert.equal((html.match(/<button/g) ?? []).length, 1);
  assert.doesNotMatch(renderToStaticMarkup(createElement(ExerciseNotes, { complexity: "", commonErrors: ["Revisar cero."] })), /<button/);
});

test("una guía sin contenido no deja un desplegable vacío aunque reciba hijos nulos", () => {
  assert.equal(renderToStaticMarkup(createElement(LearningGuide, { objective: "", prerequisites: [] }, null, false, "")), "");
  assert.equal(renderToStaticMarkup(createElement(LearningGuide, { objective: "", prerequisites: [], collapsibleTheory: true }, null, false, "")), "");
});

test("la teoría opcional se conserva cerrada e inerte sin duplicar objetivos ni plegar el repaso con ella", () => {
  const html = renderToStaticMarkup(createElement(LearningGuide, {
    objective: "Consultar una clave.", practiceGoals: ["Consultar una clave."], prerequisites: ["Usar return."], collapsibleTheory: true,
  }, createElement(ModuleLesson, { lesson: { title: "Diccionarios", objective: "Consultar una clave.", theory: "Una clave identifica un valor <seguro>.", example: "dato = {'a': 2}" }, language: "python" }),
  createElement(ExerciseNotes, { complexity: "Tiempo O(1) en esta referencia.", commonErrors: [] })));
  assert.equal((html.match(/<button/g) ?? []).length, 2);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 2);
  assert.equal((html.match(/inert=""/g) ?? []).length, 2);
  assert.equal((html.match(/Consultar una clave\./g) ?? []).length, 1);
  assert.ok(html.indexOf("Antes de empezar") < html.indexOf("Teoría y objetivos"));
  assert.match(html, /Una clave identifica un valor &lt;seguro&gt;/);
  assert.match(html, /No es la solución del reto/);
  assert.match(html, /Tiempo O\(1\) en esta referencia/);
});

test("el modo plegable no añade una sección de teoría cuando solo hay prerrequisitos", () => {
  const html = renderToStaticMarkup(createElement(LearningGuide, { objective: "", prerequisites: ["Usar return."], collapsibleTheory: true }));
  assert.match(html, /Antes de empezar/);
  assert.doesNotMatch(html, /Teoría y objetivos/);
});

test("las condiciones Python omiten solo el respaldo genérico y conservan reglas específicas", () => {
  const generic = "Usa únicamente los datos y límites descritos en el enunciado.";
  const constraints = [generic, "Hasta 50 nodos.", "Devuelve None si falta.", "Conserva solve(data).", "No modifiques la entrada."];
  assert.deepEqual(exerciseConditions(constraints, "", "python"), constraints.slice(1));
  for (const language of ["javascript", "typescript"] as const) assert.deepEqual(exerciseConditions(constraints, "", language), constraints);
  assert.deepEqual(exerciseConditions([generic], "", "python"), []);
  assert.deepEqual(exerciseConditions(["Hasta 50 nodos.", "Hasta 50 nodos.", "Hasta 100 nodos."], "Hasta 50 nodos.", "python"), ["Hasta 100 nodos."]);
  assert.deepEqual(exerciseConditions([`${generic} No uses entrada estándar.`], "", "python"), [`${generic} No uses entrada estándar.`]);
});

test("las 224 actividades conservan todas las condiciones salvo 52 respaldos sin regla propia", () => {
  let omitted = 0;
  for (const { content } of pythonCatalog) {
    const statement = content.variants[0].statement || content.statement;
    const previous = uniqueHelp(content.constraints, statement.split(/\n+/));
    const current = exerciseConditions(content.constraints, statement, "python");
    omitted += previous.length - current.length;
    assert.deepEqual(current, previous.filter(item => item !== "Usa únicamente los datos y límites descritos en el enunciado."));
  }
  assert.equal(omitted, 52);
});
