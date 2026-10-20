import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { learningHelp, uniqueHelp } from "../src/lib/learning-help";
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

test("la comprensión reúne teoría, ejemplo y requisitos sin desplegables anidados", () => {
  const html = renderToStaticMarkup(createElement(LearningGuide, {
    objective: "Usar una variable.", practiceGoals: ["Usar una variable."], prerequisites: ["Mostrar texto."],
  }, createElement(ModuleLesson, { lesson: { title: "Variables", objective: "Usar una variable.", theory: "Una variable conserva un valor.", example: "nombre = 'Ada'" }, language: "python" })));
  assert.match(html, /Comprender la idea/);
  assert.match(html, /Antes de empezar/);
  assert.match(html, /No es la solución del reto/);
  assert.equal((html.match(/Usar una variable\./g) ?? []).length, 1);
  assert.equal((html.match(/<button/g) ?? []).length, 1);
  assert.doesNotMatch(renderToStaticMarkup(createElement(ExerciseNotes, { complexity: "", commonErrors: ["Revisar cero."] })), /<button/);
});

test("una guía sin contenido no deja un desplegable vacío aunque reciba hijos nulos", () => {
  assert.equal(renderToStaticMarkup(createElement(LearningGuide, { objective: "", prerequisites: [] }, null, false, "")), "");
});
