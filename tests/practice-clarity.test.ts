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
import { fundamentalsLessons } from "../prisma/fundamentals-lessons";
import { uniqueHelp } from "../src/lib/learning-help";
import { runInNewContext } from "node:vm";
import ts from "typescript";
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
    assert.doesNotMatch(version.objective, /utilizando los datos y reglas del problema/, exercise.slug);
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

test("los fundamentos explican los datos y la tarea sin exigir anotaciones de otro lenguaje", () => {
  assert.equal(fundamentalsLessons.size, 22);
  for (const exercise of fundamentalsLessons.values()) {
    const version = seedVersionContent(exercise);
    assert.ok(version.objective.endsWith("."), exercise.slug);
    assert.deepEqual(version.practiceGoals, [version.objective]);
    for (const variant of version.variants) {
      assert.match(variant.statement!, /Entrada y resultado: data contiene/);
      assert.match(variant.statement!, /La plantilla (solo prepara|contiene)/);
      assert.match(variant.statement!, /return/);
      if (variant.language !== "typescript") assert.doesNotMatch(variant.statement!, /\bnumber\b|\bstring\b|function solve\(data:/, `${exercise.slug}:${variant.language}`);
      else assert.match(variant.statement!, /Firma de la plantilla: function solve\(data:/);
    }
  }
  assert.match(fundamentalsLessons.get("llamadas-independientes")!.statement, /exactamente dos enteros no negativos/);
  const repair = fundamentalsLessons.get("reproduce-fallo")!;
  assert.match(repair.statement, /La plantilla contiene el cálculo que debes corregir/);
  const empty = fundamentalsLessons.get("sin-estado-global")!;
  assert.match(empty.statement, /La plantilla solo prepara solve\(data\)/);
});

test("los contratos avanzados aclaran la representación, el orden y los límites efectivos", () => {
  const find = (key: string) => logicExercises.find(exercise => exercise.slug === `logica-${key}`)!;
  for (const key of ["altura", "preorden", "niveles", "arbol-busqueda"]) {
    for (const variant of seedVersionContent(find(key)).variants) assert.match(variant.statement!, /v, su valor, e izq y der/);
  }
  assert.match(find("permutaciones").statement, /valores numéricos/);
  assert.match(find("permutaciones").statement, /\[2, 10\] va antes de \[10, 2\]/);
  for (const key of ["distancias", "dijkstra"]) assert.match(find(key).statement, /no dirigido/);
  assert.match(find("laberinto").statement, /no vacía/);
  assert.match(find("laberinto").statement, /inicial cuenta como cero/);
  assert.match(find("guarda-cantidad").explanations!.python, /comprueba el concepto/);
  assert.doesNotMatch(find("factorial").statement, /Un producto que crece|Del uno al número recibido/);
  assert.doesNotMatch(find("arbol-busqueda").explanations!.python, /mayor que su padre/);
  assert.match(find("dijkstra").explanations!.python, /float\('inf'\)/);
  assert.doesNotMatch(find("dijkstra").explanations!.python, /Infinity/);
  assert.match(find("alcanzables").complexity!, /r log r/);
  assert.match(find("permutaciones").complexity!, /O\(n²\)/);
  for (const key of ["gastos-validacion", "inventario-persistente", "agenda-almacenamiento", "agenda-regresion"]) {
    for (const variant of seedVersionContent(find(key)).variants) assert.match(variant.statement!, /Recibes una lista/);
  }
  const power = find("potencia");
  assert.deepEqual(power.constraints, ["0 ≤ base ≤ 10; 0 ≤ exponente ≤ 100; enteros con resultado ≤ 9007199254740991."]);
  for (const test of power.tests) {
    const { base, exponente } = test.input as { base: number; exponente: number };
    assert.ok(base >= 0 && base <= 10 && exponente >= 0 && exponente <= 100);
    assert.ok(Number.isSafeInteger(test.expected));
  }
});

test("la primera práctica conserva una condición visible que el enunciado no repite", () => {
  const saludo = seedVersionContent(logicExercises[0]);
  assert.equal(logicExercises[0].slug, "logica-saludo");
  assert.equal(saludo.constraints.length, 1);
  for (const variant of saludo.variants) {
    // La sección «Condiciones» solo aparece cuando queda algo que el enunciado no dice ya.
    assert.deepEqual(uniqueHelp(saludo.constraints, variant.statement!.split(/\n+/)), saludo.constraints);
  }
});

test("el ejemplo de copias anidadas copia filas y conserva la matriz original", () => {
  const lesson = learningModules.find(module => module.slug === "copias-anidadas")!;
  assert.match(lesson.examples.python, /for fila in original:\n\s+copia.append\(list\(fila\)\)/);
  assert.match(lesson.examples.python, /copia\[0\]\[1\] = 11/);
  for (const language of ["javascript", "typescript"] as const) {
    // Solo ejemplos editoriales fijos; nunca contenido de estudiantes.
    const source = ts.transpileModule(lesson.examples[language], { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
    const actual = runInNewContext(`${source}\nJSON.stringify({ original, copia });`, { console: { log() {} } }, { timeout: 1000 });
    assert.deepEqual(JSON.parse(actual), { original: [[7, 9], [2, 4]], copia: [[7, 11], [2, 4]] });
  }
});
