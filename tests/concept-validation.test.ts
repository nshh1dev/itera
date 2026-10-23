import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { satisfiesConcept, type ConceptRule } from "../src/lib/concept-validation";
import { pythonConceptParser, typescriptConceptParser } from "../src/server/execution/concept-parsers";
import { logicExercises } from "../prisma/logic-content";

// Solo analiza referencias FIJAS del repositorio. No se evalúa su contenido.
const require = createRequire(import.meta.url);
const parser = ts.transpileModule(typescriptConceptParser, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
function jsProgram(source: string): unknown {
  let result = "";
  const realRequire = require;
  const context = vm.createContext({ console: { log: (line: string) => { result = line; } }, require: (name: string) => {
    if (name === "fs") return { readFileSync: () => JSON.stringify(source), realpathSync: () => require.resolve("typescript/bin/tsc") };
    if (name === "child_process") return { execFileSync: () => "tsc" };
    return realRequire(name);
  } });
  new vm.Script(parser).runInContext(context, { timeout: 2000 });
  return JSON.parse(result);
}
function pythonPrograms(sources: string[]): unknown[] {
  const driver = `import json, sys, io, contextlib\nsources=json.load(sys.stdin)\nresults=[]\nfor source in sources:\n sys.stdin=io.StringIO(json.dumps(source))\n output=io.StringIO()\n with contextlib.redirect_stdout(output): exec(${JSON.stringify(pythonConceptParser)}, {})\n results.append(json.loads(output.getvalue()))\nprint(json.dumps(results))`;
  const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { input: JSON.stringify(sources), encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("las referencias de las once prácticas conceptuales satisfacen su regla en los tres lenguajes", () => {
  const exercises = logicExercises.filter(exercise => exercise.conceptRule);
  assert.equal(exercises.length, 11);
  const python = pythonPrograms(exercises.map(exercise => exercise.python));
  for (const [index, exercise] of exercises.entries()) {
    const rule = exercise.conceptRule as ConceptRule;
    assert.equal(satisfiesConcept(python[index], rule), true, `${exercise.slug}: Python`);
    assert.equal(satisfiesConcept(jsProgram(exercise.javascript), rule), true, `${exercise.slug}: JavaScript`);
    assert.equal(satisfiesConcept(jsProgram(exercise.typescript!), rule), true, `${exercise.slug}: TypeScript`);
  }
});

test("una respuesta fija, una operación decorativa y una operación nunca mostrada no bastan", () => {
  const sources = ["print(7)", "precio = 13\npago = 20\ncambio = pago - precio\nprint(7)", "print('7 - 0')", "print(7) # pago - precio", "precio = 13\npago = 20\npago - precio\nprint(7)"];
  for (const program of pythonPrograms(sources)) assert.equal(satisfiesConcept(program, "subtraction"), false);
  for (const source of ["console.log(7)", "const a=13,b=20; const c=b-a; console.log(7)", "console.log(7); // pago - precio", "if (true) console.log(7)"]) assert.equal(satisfiesConcept(jsProgram(source), "subtraction"), false);
  assert.equal(satisfiesConcept(jsProgram("const a=13,b=20; console.log(7+(b-a)*0)"), "subtraction"), false);
  assert.equal(satisfiesConcept(jsProgram("const a=13,b=7; console.log(a-a+b)"), "subtraction"), false);
});

test("se aceptan nombres distintos, variables intermedias, anotaciones y actualizaciones equivalentes", () => {
  const python = pythonPrograms(["coste=13\nentregado=20\ndevolucion=entregado-coste\nprint(devolucion)", "p=8\np+=3\nprint(p)", "suma=4+3\nprint(suma*2)"]);
  for (const [index, rule] of (["subtraction", "update", "grouping"] as ConceptRule[]).entries()) assert.equal(satisfiesConcept(python[index], rule), true);
  for (const source of ["const coste=13, entregado=20; console.log(entregado - coste);", "const coste: number=13; const entregado: number=20; const resultado: number = entregado-coste; console.log(resultado);"]) assert.equal(satisfiesConcept(jsProgram(source), "subtraction"), true);
  assert.equal(satisfiesConcept(jsProgram("let puntos=8; puntos+=3; console.log(puntos)"), "update"), true);
  assert.equal(satisfiesConcept(jsProgram("const suma=4+3; console.log(suma*2)"), "grouping"), true);
});

test("una sustitución por un literal no es una actualización ni un intercambio", () => {
  const python = pythonPrograms(["puntos=8\npuntos=11\nprint(puntos)", "a=3\nb=8\na=8\nb=3\nprint(a)\nprint(b)"]);
  assert.equal(satisfiesConcept(python[0], "update"), false);
  assert.equal(satisfiesConcept(python[1], "swap"), false);
  assert.equal(satisfiesConcept(jsProgram("let a=3,b=8; a=8;b=3;console.log(a);console.log(b)"), "swap"), false);
});

test("el análisis no ejecuta llamadas, ramas, bucles ni código con efectos", () => {
  assert.equal(satisfiesConcept(jsProgram("require('fs').writeFileSync('no-crear','x'); console.log(7)"), "subtraction"), false);
  assert.equal(satisfiesConcept(jsProgram("while(true) {}"), "variable"), false);
  assert.equal(satisfiesConcept(null, "variable"), false);
  assert.equal(satisfiesConcept([], "subtraction"), false);
});
