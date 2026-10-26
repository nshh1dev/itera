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

test("los casos conservan expectativas independientes de archivos nuevos al componer el catálogo", () => {
  const writers = ["escribe-archivo", "guarda-recupera", "actualiza-persistidos", "inventario-persistente", "agenda-almacenamiento", "agenda-regresion"];
  let cases = 0;
  for (const key of writers) {
    const exercise = fundamentalsProjectLessons.get(key)!;
    const composed = logicExercises.find(e => e.slug === curriculumSlug(key))! as typeof exercise;
    assert.equal(composed.tests.length, exercise.tests.length);
    for (const [i, fixture] of exercise.tests.entries()) {
      assert.equal(fixture.expectedFiles?.length, 1, key);
      assert.deepEqual(composed.tests[i].expectedFiles, fixture.expectedFiles, key);
      for (const language of languages) for (const file of fixture.expectedFiles!) {
        assert.ok(!exercise.projects[language].files.some(source => source.path.toLowerCase() === file.path.toLowerCase()), `${key}: ruta nueva`);
        assert.ok(!file.readOnly);
        assert.ok(Buffer.byteLength(file.content, "utf8") <= 32 * 1024);
        if (file.path.endsWith(".json")) {
          assert.equal(JSON.stringify(JSON.parse(file.content)), file.content, `${key}: JSON compacto determinista`);
          assert.notEqual(file.content, "", key);
        }
      }
      cases++;
    }
    for (const project of Object.values(exercise.projects)) {
      assert.match(project.files[0].content, /solve/);
      assert.doesNotMatch(JSON.stringify(project), /expectedFiles/);
    }
  }
  assert.equal(cases, 20);
  assert.equal([...fundamentalsProjectLessons].filter(([, e]) => e.tests.some(t => t.expectedFiles?.length)).length, writers.length);
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
    const manifest: { directory: string; entrypoint: string; kind: string; key: string; input: unknown; expected: unknown; expectedFiles?: { path: string; content: string }[]; ownTests?: string; originals: { path: string; content: string }[] }[] = [];
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
      manifest.push({ directory, entrypoint: project.entrypoint.replace(/\.ts$/, ".js"), kind, key, input: fixture.input, expected: fixture.expected, expectedFiles: fixture.expectedFiles, originals: project.files.filter(f => f.readOnly && !/\.(py|js|ts)$/.test(f.path)), ...(kind === "solution" && index === 0 && project.testEntrypoint ? { ownTests: project.testEntrypoint.replace(/\.ts$/, ".js") } : {}) });
    }
    // Exclusivamente referencias fijas del repositorio. Nunca código de alumnos.
    const driver = `const fs = require('node:fs'); const path = require('node:path'); const assert = require('node:assert/strict');
const fixtures = JSON.parse(fs.readFileSync(0, 'utf8')); const solved = new Map();
for (const item of fixtures) {
  process.chdir(item.directory);
  const filesMatch = () => (item.expectedFiles ?? []).every(file => fs.existsSync(file.path) && fs.readFileSync(file.path, 'utf8') === file.content);
  if (item.expectedFiles?.length) assert.equal(filesMatch(), false, item.key + ': los artefactos no vienen preparados');
  const loaded = require(path.join(item.directory, item.entrypoint));
  const solve = typeof loaded === 'function' ? loaded : loaded.solve;
  const actual = solve(structuredClone(item.input));
  if (item.kind === 'solution') {
    assert.deepEqual(actual, item.expected, item.key);
    assert.equal(filesMatch(), true, item.key + ': contenido real de los archivos producidos');
    for (const file of item.expectedFiles ?? []) {
      fs.unlinkSync(file.path);
      assert.equal(filesMatch(), false, item.key + ': retorno correcto sin archivo no basta');
      fs.writeFileSync(file.path, file.content + '\\n', 'utf8');
      assert.equal(filesMatch(), false, item.key + ': contenido alterado no basta');
      fs.writeFileSync(file.path, file.content, 'utf8');
    }
  } else solved.set(item.key, (solved.get(item.key) ?? true) && JSON.stringify(actual) === JSON.stringify(item.expected) && filesMatch());
  for (const file of item.originals) assert.equal(fs.readFileSync(file.path, 'utf8'), file.content, item.key + ': recurso inicial intacto');
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
def check_case(item, case, index, kind):
 with tempfile.TemporaryDirectory(dir=root) as directory:
  files = item['projectSolutions']['python'] if kind == 'solution' else item['projects']['python']['files']
  for file in files: pathlib.Path(directory, file['path']).write_bytes(file['content'].encode('utf-8'))
  os.chdir(directory)
  sys.path.insert(0, directory)
  try:
   for name in ['main', 'reglas', 'formato', 'almacenamiento']: sys.modules.pop(name, None)
   importlib.invalidate_caches()
   module = importlib.import_module('main')
   expected_files = case.get('expectedFiles', [])
   def files_match():
    return all(pathlib.Path(file['path']).exists() and pathlib.Path(file['path']).read_bytes() == file['content'].encode('utf-8') for file in expected_files)
   if expected_files: assert not files_match(), (item['slug'], 'artefactos no preparados')
   actual = module.solve(copy.deepcopy(case['input']))
   passed = actual == case['expected'] and files_match()
   if kind == 'solution':
    assert actual == case['expected'], (item['slug'], actual, case['expected'])
    assert files_match(), (item['slug'], 'archivos producidos incorrectos')
    for file in expected_files:
     path = pathlib.Path(file['path'])
     path.unlink()
     assert not files_match(), (item['slug'], 'retorno correcto sin archivo no basta')
     path.write_bytes((file['content'] + '\\n').encode('utf-8'))
     assert not files_match(), (item['slug'], 'archivo alterado no basta')
     path.write_bytes(file['content'].encode('utf-8'))
    if index == 0 and item['projects']['python'].get('testEntrypoint'):
     exec(pathlib.Path(item['projects']['python']['testEntrypoint']).read_text(encoding='utf-8'), {})
   for file in item['projects']['python']['files']:
    if file.get('readOnly') and not file['path'].endswith('.py'):
     assert pathlib.Path(file['path']).read_bytes() == file['content'].encode('utf-8'), (item['slug'], 'recurso inicial modificado')
   return passed
  finally:
   sys.path.pop(0)
   os.chdir(root)
for item in items:
 solved = True
 for kind in ['solution', 'starter']:
  for index, case in enumerate(item['tests']):
   passed = check_case(item, case, index, kind)
   if kind == 'starter' and not passed: solved = False
 assert not solved, (item['slug'], 'plantilla ya resuelta')
print('18 proyectos Python comprobados')`;
    const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { cwd: root, input: JSON.stringify([...fundamentalsProjectLessons.values()]), encoding: "utf8", timeout: 60000 });
    assert.equal(result.status, 0, `${result.error ?? ""}\n${result.stdout}\n${result.stderr}`);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
