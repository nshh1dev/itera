import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";
import { fundamentalsLessons } from "../prisma/fundamentals-lessons";
import { fundamentalsProjectLessons } from "../prisma/fundamentals-project-lessons";
import { logicExercises } from "../prisma/logic-content";
import { curriculumSlug, curriculumUnits } from "../src/lib/curriculum-v2";
import { languages } from "../src/lib/types";

const originalKeys = `saludo dos-lineas orden-mensaje texto-calculo guarda-nombre guarda-cantidad actualiza-puntos intercambia suma-cantidades cambio precio-unidades parentesis lee-nombre lee-doble lee-suma mensaje-resultado numero-texto booleano igualdad alcanza retorno parametro dos-parametros imprimir-devolver minutos-segundos perimetro repara-presupuesto merienda elige-mensaje signo mayor-tres dos-requisitos alternativas tarifa uno-n cuenta-atras suma-uno-n tabla multiplos bucle-roto posicion indices suma-lista maximo cuenta-condicion filtra-lista longitud-texto minusculas vocales invierte elimina-caracter palabras ficha-producto ficha-resultado opcional ausencia auxiliares variable-local factorial fizzbuzz mediciones carrito notas saldo repetido deduplica frecuencias primer-unico anagramas agrupa-registros busqueda-lineal busqueda-binaria insercion-posicion ordena-insercion ordena-registros combina palindromo pareja prefijos intervalos-suma ventana-fija ventana-suma celda filas columnas diagonales transpuesta vecinos pila cola delimitadores deshacer suma-recursiva busqueda-recursiva une-intervalos segundo-maximo suma-maxima sin-repeticiones ranking inventario cuenta-nodos altura preorden niveles arbol-busqueda ancestro monticulo-inserta monticulo-extrae prioridad k-mayores actividades combina-archivos potencia mezcla subconjuntos permutaciones combinaciones reinas fibonacci escalera caminos-obstaculos monedas mochila subsecuencia-comun adyacencia alcanzables distancias ciclo-dirigido dependencias dijkstra islas laberinto capacidad edicion subsecuencia-creciente planifica-tareas`.split(" ");

test("se conservan las 136 identidades y se añaden exactamente 40 sin recrear variable-local", () => {
  assert.equal(originalKeys.length, 136);
  const original = new Set(originalKeys.map(curriculumSlug));
  const additions = new Set([...fundamentalsLessons.keys(), ...fundamentalsProjectLessons.keys()].map(curriculumSlug));
  assert.equal(fundamentalsLessons.size, 22);
  assert.equal(fundamentalsProjectLessons.size, 18);
  assert.equal(additions.size, 40);
  assert.deepEqual(new Set(logicExercises.map(e => e.slug)), new Set([...original, ...additions]));
  assert.equal(curriculumUnits.find(u => u.slug === "alcance")!.steps[0].key, "variable-local");
  assert.ok(!curriculumUnits.find(u => u.slug === "funciones-datos")!.steps.some(s => s.key === "variable-local"));
  const position = (key: string) => logicExercises.findIndex(e => e.slug === curriculumSlug(key));
  for (const [before, after] of [["auxiliares", "variable-local"], ["variable-local", "dos-nombres-lista"], ["registro-compartido", "valida-divisor"], ["recupera-elementos", "asercion-normal"], ["saldo", "gastos-registro"], ["agrupa-registros", "importa-preparado"], ["actualiza-persistidos", "inventario-modular"], ["vecinos", "copia-anidada"], ["inventario", "agenda-operaciones"]]) assert.ok(position(before) < position(after), `${before} antes de ${after}`);
  // Los algoritmos conservan su secuencia relativa, incluso al insertar bloques.
  assert.deepEqual(logicExercises.filter(e => original.has(e.slug) && e.slug !== "logica-variable-local").map(e => e.slug), originalKeys.filter(k => k !== "variable-local").map(curriculumSlug));
});

test("cada actividad nueva tiene tres contratos, entradas variables, ocultos y pistas progresivas", () => {
  for (const [key, exercise] of [...fundamentalsLessons, ...fundamentalsProjectLessons]) {
    assert.equal(exercise.hints.length, 3, key);
    assert.equal(new Set(exercise.hints).size, 3, key);
    assert.ok(exercise.explanation.length > 150, key);
    assert.ok(new Set(exercise.tests.map(t => JSON.stringify(t.input))).size >= 3, key);
    assert.ok(exercise.tests.some(t => t.visible === false), key);
    assert.ok(exercise.tests.some(t => t.visible === true), key);
    for (const language of languages) {
      assert.ok(exercise[language], `${key} ${language}`);
      assert.ok(exercise.starters?.[language], `${key} ${language}`);
      assert.notEqual(exercise[language], exercise.starters?.[language], key);
    }
  }
});

test("los manifiestos públicos no contienen soluciones ni recursos privados y la continuidad conserva identidad", () => {
  const seen = new Set<string>();
  for (const [key, exercise] of fundamentalsProjectLessons) {
    for (const language of languages) {
      const project = exercise.projects[language];
      assert.equal(project.version, 1);
      assert.equal(new Set(project.files.map(f => f.path)).size, project.files.length);
      assert.equal(new Set(project.files.map(f => f.path.toLowerCase())).size, project.files.length);
      assert.ok(project.files.length <= 20, key);
      assert.ok(project.files.every(f => Buffer.byteLength(f.content, "utf8") <= 64 * 1024 && !f.path.startsWith("__itera_")), key);
      assert.ok(project.files.reduce((total, f) => total + Buffer.byteLength(f.content, "utf8"), 0) <= 256 * 1024, key);
      assert.ok(project.files.some(f => f.path === project.entrypoint && !f.readOnly));
      assert.ok(project.files.every(f => !/\.\.|[\\/]/.test(f.path)), key);
      assert.ok(exercise.projectSolutions[language].every(f => project.files.some(p => p.path === f.path)), key);
      assert.notEqual(project.files.find(f => f.path === project.entrypoint)!.content, exercise.projectSolutions[language].find(f => f.path === project.entrypoint)!.content, key);
      assert.deepEqual(Object.keys(project).sort(), ["version", "entrypoint", "files", ...(project.previousStep ? ["previousStep"] : []), ...(project.testEntrypoint ? ["testEntrypoint"] : [])].sort());
      if (project.previousStep) assert.ok(seen.has(project.previousStep), `${key}: predecesor existente anterior`);
    }
    seen.add(curriculumSlug(key));
  }
  assert.equal([...fundamentalsProjectLessons.keys()].filter(key => /^(gastos|inventario|agenda)-/.test(key)).length, 7);
});

const temporaryRoot = () => {
  const parent = resolve(".local", "curriculum-reference-tests");
  mkdirSync(parent, { recursive: true });
  return mkdtempSync(join(parent, "fixtures-"));
};

test("todos los archivos TypeScript de referencia y plantilla compilan en strict", () => {
  const root = temporaryRoot();
  try {
    const names: string[] = [];
    for (const [key, exercise] of fundamentalsProjectLessons) for (const kind of ["solution", "starter"] as const) {
      const directory = join(root, `${key}-${kind}`);
      mkdirSync(directory);
      const project = exercise.projects.typescript;
      for (const file of kind === "solution" ? exercise.projectSolutions.typescript : project.files) {
        if (!file.path.endsWith(".ts")) continue;
        assert.doesNotMatch(file.content, /@ts-(?:nocheck|ignore)|\bany\b/, `${key}/${file.path}`);
        const name = join(directory, file.path);
        writeFileSync(name, file.content + (file.path === project.entrypoint ? `\n${exercise.typescriptContract}` : ""));
        names.push(name);
      }
    }
    const program = ts.createProgram(names, { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, types: ["node"], skipLibCheck: true });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.deepEqual(diagnostics.map(d => `${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`), []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

for (const language of ["javascript", "typescript"] as const) test(`proyectos ${language}: referencias completas, plantillas ejecutables y disco real aislado`, () => {
  const root = temporaryRoot();
  try {
    const manifest: { directory: string; entrypoint: string; kind: string; key: string; input: unknown; expected: unknown; ownTests?: string }[] = [];
    for (const [key, exercise] of fundamentalsProjectLessons) for (const kind of ["solution", "starter"] as const) for (const [index, fixture] of exercise.tests.entries()) {
      const directory = join(root, `${key}-${kind}-${index}`);
      mkdirSync(directory);
      writeFileSync(join(directory, "package.json"), '{"type":"commonjs"}');
      const project = exercise.projects[language];
      for (const file of kind === "solution" ? exercise.projectSolutions[language] : project.files) {
        const source = language === "typescript" && file.path.endsWith(".ts");
        const path = source ? file.path.replace(/\.ts$/, ".js") : file.path;
        const content = source ? ts.transpileModule(file.content, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText : file.content;
        writeFileSync(join(directory, path), content);
      }
      manifest.push({ directory, entrypoint: project.entrypoint.replace(/\.ts$/, ".js"), kind, key, input: fixture.input, expected: fixture.expected, ...(kind === "solution" && index === 0 && project.testEntrypoint ? { ownTests: project.testEntrypoint.replace(/\.ts$/, ".js") } : {}) });
    }
    // Exclusivamente referencias fijas del repositorio. Nunca código de alumnos.
    const driver = `const fs = require('node:fs'); const path = require('node:path'); const assert = require('node:assert/strict');
const fixtures = JSON.parse(fs.readFileSync(0, 'utf8')); const solved = new Map();
for (const item of fixtures) {
  process.chdir(item.directory);
  const loaded = require(path.join(item.directory, item.entrypoint));
  const solve = typeof loaded === 'function' ? loaded : loaded.solve;
  const actual = solve(structuredClone(item.input));
  if (item.kind === 'solution') assert.deepEqual(actual, item.expected, item.key);
  else solved.set(item.key, (solved.get(item.key) ?? true) && JSON.stringify(actual) === JSON.stringify(item.expected));
  if (item.ownTests) require(path.join(item.directory, item.ownTests));
}
for (const [key, all] of solved) assert.equal(all, false, key + ': plantilla resuelta');
console.log(fixtures.length + ' casos de proyecto comprobados');`;
    const result = spawnSync(process.execPath, ["-e", driver], { input: JSON.stringify(manifest), encoding: "utf8", timeout: 60000 });
    assert.equal(result.status, 0, `${result.error ?? ""}\n${result.stdout}\n${result.stderr}`);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("proyectos Python: referencias completas, plantillas ejecutables y disco real aislado", () => {
  const root = temporaryRoot();
  try {
    const driver = `import json, sys, os, pathlib, tempfile, importlib, copy
items = json.load(sys.stdin)
root = os.getcwd()
for item in items:
 solved = True
 for kind in ['solution', 'starter']:
  for index, case in enumerate(item['tests']):
   with tempfile.TemporaryDirectory(dir=root) as directory:
    files = item['projectSolutions']['python'] if kind == 'solution' else item['projects']['python']['files']
    for file in files: pathlib.Path(directory, file['path']).write_text(file['content'], encoding='utf-8')
    os.chdir(directory)
    sys.path.insert(0, directory)
    for name in ['main', 'reglas', 'formato', 'almacenamiento']: sys.modules.pop(name, None)
    importlib.invalidate_caches()
    module = importlib.import_module('main')
    actual = module.solve(copy.deepcopy(case['input']))
    if kind == 'solution':
     assert actual == case['expected'], (item['slug'], actual, case['expected'])
     if index == 0 and item['projects']['python'].get('testEntrypoint'):
      exec(pathlib.Path(item['projects']['python']['testEntrypoint']).read_text(encoding='utf-8'), {})
    elif actual != case['expected']: solved = False
    sys.path.pop(0)
    os.chdir(root)
 assert not solved, (item['slug'], 'plantilla ya resuelta')
print('18 proyectos Python comprobados')`;
    const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { cwd: root, input: JSON.stringify([...fundamentalsProjectLessons.values()]), encoding: "utf8", timeout: 60000 });
    assert.equal(result.status, 0, `${result.error ?? ""}\n${result.stdout}\n${result.stderr}`);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
