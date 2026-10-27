import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Examples } from "../src/components/practice/examples";
import { Results } from "../src/components/practice/results";
import { ExerciseRow } from "../src/components/exercise-row";
import { learningModules } from "../src/lib/learning-modules";
import { theoryForLanguage } from "../src/lib/lesson-language";
import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent } from "../prisma/editorial-revision";
import type { ExecutionResult, ExerciseCard } from "../src/lib/types";

test("los ejemplos de programa muestran líneas reales y omiten entradas inexistentes", () => {
  const html = renderToStaticMarkup(createElement(Examples, { runtimeMode: "PROGRAM", examples: [{ input: "", expected: "Hola, mundo!\nSegunda línea\n" }] }));
  assert.match(html, /Hola, mundo!\nSegunda línea\n/);
  assert.doesNotMatch(html, /Entrada|sin entrada|\\n|&quot;/);
  const variable = renderToStaticMarkup(createElement(Examples, { runtimeMode: "PROGRAM", examples: [{ input: "Ana\n", expected: "Hola, Ana\n" }] }));
  assert.match(variable, /Entrada/);
  assert.match(variable, /Ana\n/);
});

test("un programa sencillo muestra su salida una vez y distingue evaluación de ejecución", () => {
  const result: ExecutionResult = { id: "visible", mode: "submit", status: "PASSED", passedCount: 1, totalCount: 1, results: [{ index: 1, visible: true, passed: true, status: "passed", input: "", expected: "Hola, mundo!\n", actual: "Hola, mundo!", output: "Hola, mundo!\n" }] };
  const html = renderToStaticMarkup(createElement(Results, { result, busy: false, error: "", runtimeMode: "PROGRAM" }));
  assert.equal((html.match(/Hola, mundo!/g) ?? []).length, 1);
  assert.ok(html.indexOf("Salida de tu programa") < html.indexOf("Un paso más. Ejercicio resuelto."));
  assert.doesNotMatch(html, /Ejemplo 1|sin entrada|Tus intentos/);
  const examples = renderToStaticMarkup(createElement(Results, { result: { ...result, mode: "examples" }, busy: false, error: "", runtimeMode: "PROGRAM" }));
  assert.match(examples, /Los ejemplos funcionan/);
  assert.doesNotMatch(examples, /Progreso guardado|Tu progreso está guardado/);
});

test("el siguiente ejercicio tiene su acción dentro de la fila de la ruta", () => {
  const exercise: ExerciseCard = { id: "next", slug: "saludo", title: "Muestra un saludo", description: "", category: "Fundamentos", order: 0, level: "INITIATION", minutes: 5, runtimeMode: "PROGRAM", solved: false, started: false, solvedOther: false };
  for (const started of [false, true]) {
    const html = renderToStaticMarkup(createElement(ExerciseRow, { exercise: { ...exercise, started }, pathSlug: "desde-cero", recommended: true }));
    assert.match(html, /aria-current="step"/);
    assert.match(html, new RegExp(started ? "Continuar" : "Empezar"));
    assert.match(html, /Muestra un saludo/);
    assert.match(html, /ruta=desde-cero/);
  }
});

test("la teoría de los 36 bloques no introduce sintaxis de otro lenguaje", () => {
  assert.equal(learningModules.length, 36);
  for (const lesson of learningModules) {
    const python = theoryForLanguage(lesson, "python");
    assert.doesNotMatch(python, /JavaScript|TypeScript|JS\/TS|console\.log|\bconst\b|\blet\b|\bundefined\b|\bNode\b/, lesson.slug);
    for (const language of ["javascript", "typescript"] as const) assert.doesNotMatch(theoryForLanguage(lesson, language), /Python|\bNone\b|\bprint\(|\blambda\b/, `${lesson.slug}:${language}`);
  }
});

test("la revisión de apertura no mezcla lenguajes y no cambia sus referencias o casos", () => {
  const greeting = logicExercises.find(exercise => exercise.slug === "logica-saludo")!;
  const version = seedVersionContent(greeting);
  assert.doesNotMatch([...version.practiceGoals, ...version.hints, ...version.commonErrors].join(" "), /Python|JavaScript|TypeScript|console\.log/);
  for (const variant of version.variants) {
    assert.equal(variant.solution, greeting[variant.language as "python" | "javascript" | "typescript"]);
    assert.equal(variant.tests[0].expected, "Hola, mundo!\n");
    assert.doesNotMatch(variant.explanation, variant.language === "python" ? /console\.log|JavaScript|TypeScript/ : /Python|\bprint\(/);
  }
  const points = logicExercises.find(exercise => exercise.slug === "logica-actualiza-puntos")!;
  assert.match(points.statement, /variable puntos/);
  assert.match(points.statement, /debe ser 11/);
  assert.equal(points.conceptRule, "update");
  assert.match(logicExercises.find(exercise => exercise.slug === "logica-elige-mensaje")!.statement, /sea 0 o negativo/);
});

test("los proyectos generan instrucciones y soluciones explicadas del lenguaje seleccionado", () => {
  const projects = logicExercises.filter(exercise => exercise.projects);
  assert.ok(projects.length > 10);
  for (const exercise of projects) for (const variant of seedVersionContent(exercise).variants) {
    const text = `${variant.statement}\n${variant.explanation}`;
    if (variant.language === "python") {
      assert.doesNotMatch(text, /JavaScript|TypeScript|JS\/TS|CommonJS|module\.exports|JSON\.parse|JSON\.stringify|require\(/, exercise.slug);
      assert.match(text, /solve\(data\)/, exercise.slug);
    } else {
      assert.doesNotMatch(text, /Python|\bdef solve\b|json\.dump|json\.load|\bwith open\b|\bNone\b/, `${exercise.slug}:${variant.language}`);
      assert.match(text, variant.language === "typescript" ? /export function solve/ : /module\.exports = solve/, exercise.slug);
    }
  }
});

test("las 176 actividades no mezclan instrucciones sintácticas de otros lenguajes", () => {
  assert.equal(logicExercises.length, 176);
  for (const exercise of logicExercises) {
    const version = seedVersionContent(exercise);
    const shared = [version.objective, ...version.practiceGoals, ...version.hints, ...version.prerequisites, ...version.commonErrors, ...version.constraints].join("\n");
    for (const variant of version.variants) {
      const text = `${shared}\n${variant.statement}\n${variant.explanation}`;
      assert.doesNotMatch(text, variant.language === "python"
        ? /JavaScript|TypeScript|JS\/TS|console\.log|\bconst\b|\blet\b|\bundefined\b|JSON\.parse|Number\(/
        : /Python|\bNone\b|\bprint\(|\blen\(|\bValueError\b|\bdef solve\b/,
      `${exercise.slug}:${variant.language}`);
    }
  }
});
