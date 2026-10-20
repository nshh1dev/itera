import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { exercises } from "../prisma/content";
import { programExercises } from "../prisma/program-content";
import { introductoryExercises } from "../prisma/introductory-content";
import { foundationExercises } from "../prisma/foundation-content";
import { collectionsExercises } from "../prisma/collections-content";
import { exerciseHref, exercisePosition, foundationSteps, introductorySteps, intermediateSteps, learningPaths, nextExerciseSlug, previousExerciseSlug, modulesForPath } from "./historical-curriculum";

// Solo se ejecutan las soluciones de referencia escritas en este repositorio.
// Este código de verificación editorial no forma parte del servidor ni acepta programas de usuarios.
test("el catálogo cubre tres niveles y no duplica slugs", () => {
  assert.equal(new Set(exercises.map(e=>e.slug)).size,exercises.length);
  for (const level of ["BEGINNER","INTERMEDIATE","ADVANCED"]) assert.ok(exercises.some(e=>e.level===level));
  for (const exercise of exercises) {
    assert.ok(exercise.tests.length>=3, exercise.slug);
    assert.ok(exercise.hints.length>=1, exercise.slug);
    assert.ok(exercise.statement.length>20, exercise.slug);
    assert.ok(exercise.constraints.length>0, exercise.slug);
    assert.ok(exercise.explanation.length>20, exercise.slug);
  }
});

test("la ruta desde cero abre con un programa completo y después observa", () => {
  assert.equal(exercises[0].slug, "imprime-un-saludo");
  assert.equal(exercises[0].runtimeMode, "PROGRAM");
  assert.equal(learningPaths[0].slug, "desde-cero");
  assert.equal(learningPaths[0].level, "BEGINNER");
  for (const exercise of programExercises) assert.equal(exercise.runtimeMode, "PROGRAM", exercise.slug);
  for (const exercise of introductoryExercises) {
    assert.equal(exercise.level, "BEGINNER");
    for (const language of ["python", "javascript"] as const) {
      assert.ok(exercise.starters?.[language].includes("return"), exercise.slug);
    }
  }
  assert.ok(exercises.findIndex(e => e.slug === "suma-de-dos-numeros") > exercises.findIndex(e => e.slug === "lee-un-dato-con-nombre"));
});

test("las rutas editoriales cubren fundamentos sin duplicados ni referencias inexistentes", () => {
  assert.deepEqual(introductorySteps, modulesForPath("desde-cero").flatMap(module => module.slugs));
  for (const exercise of [...programExercises, ...introductoryExercises]) assert.ok(introductorySteps.includes(exercise.slug));
  for (const path of learningPaths.filter(p => p.slugs)) {
    assert.equal(new Set(path.slugs).size, path.slugs!.length);
    for (const slug of path.slugs!) assert.ok(exercises.some(e => e.slug === slug), slug);
  }
  for (const lesson of foundationExercises) {
    assert.ok(foundationSteps.includes(lesson.slug), lesson.slug);
    for (const language of ["python", "javascript"] as const) assert.ok(lesson.starters?.[language].includes("return"), lesson.slug);
  }
  const before = (a: string, b: string) => {
    assert.ok(foundationSteps.includes(a), `Falta ${a}`);
    assert.ok(foundationSteps.includes(b), `Falta ${b}`);
    assert.ok(foundationSteps.indexOf(a) < foundationSteps.indexOf(b), `${a} antes de ${b}`);
  };
  before("compara-con-cero", "par-o-impar");
  before("resto-entre-dos", "par-o-impar");
  before("cuenta-los-elementos", "suma-del-arreglo");
  before("suma-del-arreglo", "factorial");
  before("construye-una-lista", "fizzbuzz");
  before("compara-igualdad", "par-o-impar");
  before("tres-caminos", "fizzbuzz");
  before("repite-cada-letra", "invertir-cadena");
  before("texto-en-minusculas", "contar-vocales");
  before("reconoce-una-vocal", "contar-vocales");
  before("numeros-del-uno-al-n", "factorial");
  before("producto-de-una-lista", "factorial");
  before("dos-condiciones-a-la-vez", "fizzbuzz");
});

test("continuar respeta el orden y el final de cada ruta", () => {
  assert.equal(nextExerciseSlug("cuenta-valores-distintos", intermediateSteps), "sin-duplicados");
  assert.equal(nextExerciseSlug("incrementa-contadores", intermediateSteps), "frecuencia-caracteres");
  assert.equal(nextExerciseSlug("parentesis-equilibrados", intermediateSteps), "ranking-de-frecuencias");
  assert.equal(nextExerciseSlug("ranking-de-frecuencias", intermediateSteps), undefined);
  assert.equal(nextExerciseSlug("suma-del-arreglo", foundationSteps), "el-mayor-de-tres");
  assert.equal(nextExerciseSlug("suma-de-dos-numeros", introductorySteps), "presupuesto-de-merienda");
  assert.equal(nextExerciseSlug("presupuesto-de-merienda", introductorySteps), undefined);
  assert.equal(nextExerciseSlug("imprime-un-saludo", introductorySteps), "imprime-un-resultado");
  assert.equal(nextExerciseSlug("no-existe", introductorySteps), undefined);
  assert.equal(previousExerciseSlug("sin-duplicados", intermediateSteps), "cuenta-valores-distintos");
  assert.equal(previousExerciseSlug("tu-primer-resultado", introductorySteps), "corrige-un-calculo");
  assert.equal(previousExerciseSlug("suma-de-dos-numeros", introductorySteps), "lee-un-dato-con-nombre");
  assert.equal(previousExerciseSlug("no-existe", introductorySteps), undefined);
  assert.deepEqual(exercisePosition("tu-primer-resultado", introductorySteps), { position: 14, total: 22 });
  assert.deepEqual(exercisePosition("suma-de-dos-numeros", introductorySteps), { position: 21, total: 22 });
  assert.deepEqual(exercisePosition("sin-duplicados", intermediateSteps), { position: 3, total: 42 });
  assert.deepEqual(exercisePosition("no-existe", introductorySteps), { position: 0, total: 22 });
  assert.equal(exerciseHref("suma-del-arreglo", "python", "primeros-pasos"), "/ejercicios/suma-del-arreglo?lenguaje=python&ruta=primeros-pasos");
  assert.equal(exerciseHref("suma-del-arreglo", "javascript"), "/ejercicios/suma-del-arreglo?lenguaje=javascript");
});

test("conjuntos y mapas se presentan antes de sus retos y retiran la ayuda al integrar", () => {
  assert.deepEqual(new Set(intermediateSteps), new Set(exercises.filter(e => e.level === "INTERMEDIATE").map(e => e.slug)));
  const before = (a: string, b: string) => assert.ok(intermediateSteps.indexOf(a) >= 0 && intermediateSteps.indexOf(a) < intermediateSteps.indexOf(b), `${a} antes de ${b}`);
  before("pertenece-al-conjunto", "cuenta-valores-distintos");
  before("cuenta-valores-distintos", "sin-duplicados");
  before("guarda-con-una-clave", "incrementa-contadores");
  before("incrementa-contadores", "frecuencia-caracteres");
  for (const lesson of collectionsExercises) {
    assert.ok(intermediateSteps.includes(lesson.slug), lesson.slug);
    for (const language of ["python", "javascript"] as const) assert.ok(lesson.starters?.[language].includes("return"), lesson.slug);
  }
  for (const slug of ["sin-duplicados", "frecuencia-caracteres"]) {
    const exercise = exercises.find(e => e.slug === slug)!;
    for (const language of ["python", "javascript"] as const) {
      assert.ok(exercise[language].includes("for"), slug);
      assert.ok(exercise.starters?.[language], slug);
      assert.equal(exercise.starters![language].includes("for "), false, `${slug}: el reto pide reconstruir el recorrido`);
    }
  }
});

test("el cambio indicado en cada actividad de colecciones resuelve sus casos en ambos lenguajes", () => {
  const changes: Record<string, { python: [string, string]; javascript: [string, string] }> = {
    "pertenece-al-conjunto": { python: ["return False", "return objetivo in vistos"], javascript: ["return false", "return vistos.has(objetivo)"] },
    "cuenta-valores-distintos": { python: ["vistos.add(0)", "vistos.add(numero)"], javascript: ["vistos.add(0)", "vistos.add(numero)"] },
    "guarda-con-una-clave": { python: ["marcas[data] = 0", "marcas[data] = 1"], javascript: ["marcas[data] = 0", "marcas[data] = 1"] },
    "incrementa-contadores": { python: ["frecuencias[letra] + 0", "frecuencias[letra] + 1"], javascript: ["frecuencias[letra] + 0", "frecuencias[letra] + 1"] },
  };
  for (const exercise of collectionsExercises) for (const language of ["python", "javascript"] as const) {
    const [from, to] = changes[exercise.slug][language];
    const starter = exercise.starters![language];
    assert.equal(starter.split(from).length, 2, `${exercise.slug}: cambio inequívoco en ${language}`);
    const withoutComments = (code: string) => code.split("\n").filter(line => !/^\s*(#|\/\/)/.test(line)).join("\n");
    assert.equal(withoutComments(starter.replace(from, to)), withoutComments(exercise[language]), `${exercise.slug}: el cambio explicado coincide con la referencia ${language}`);
  }
});

test("las soluciones JavaScript superan todos los casos editoriales", () => {
  for (const exercise of exercises.filter(e => e.runtimeMode !== "PROGRAM")) for (const fixture of exercise.tests) {
    const context=vm.createContext({data:structuredClone(fixture.input)});
    const actual=new vm.Script(`${exercise.javascript}\nsolve(data)`).runInContext(context,{timeout:1000});
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),fixture.expected,`${exercise.slug}: ${JSON.stringify(fixture.input)}`);
  }
});

test("las plantillas JavaScript son ejecutables y retiran ayuda de forma progresiva", () => {
  for (const exercise of exercises.filter(e => e.starters && e.runtimeMode !== "PROGRAM")) {
    let allPassed = true;
    for (const fixture of exercise.tests) {
      const context = vm.createContext({ data: structuredClone(fixture.input) });
      const actual = new vm.Script(`${exercise.starters!.javascript}\nsolve(data)`).runInContext(context, { timeout: 1000 });
      assert.notEqual(JSON.stringify(actual), undefined, `${exercise.slug}: plantilla sin resultado JSON`);
      if (JSON.stringify(actual) !== JSON.stringify(fixture.expected)) allPassed = false;
    }
    assert.equal(allPassed, exercise.slug === "tu-primer-resultado", `${exercise.slug}: solo la actividad de observación debe estar resuelta`);
  }
});

test("las soluciones Python superan los mismos casos editoriales", () => {
  const driver = `import json,sys
items=json.load(sys.stdin)
for item in items:
 if item.get('starters'):
  starter_scope={}
  exec(item['starters']['python'],starter_scope)
  starter_passes=[]
  for case in item['tests']:
   actual=starter_scope['solve'](case['input'])
   encoded=json.dumps(actual,sort_keys=True,allow_nan=False)
   starter_passes.append(encoded == json.dumps(case['expected'],sort_keys=True))
  assert all(starter_passes) == (item['slug'] == 'tu-primer-resultado'), item['slug'] + ': plantilla ya resuelta'
 scope={}
 exec(item['python'],scope)
 for case in item['tests']:
  actual=scope['solve'](case['input'])
  assert json.dumps(actual,sort_keys=True,allow_nan=False) == json.dumps(case['expected'],sort_keys=True), item['slug'] + ': ' + repr(case['input']) + ' -> ' + repr(actual)
print('Casos Python correctos')
`;
  const result=spawnSync(process.env.PYTHON_BIN || "python",["-c",driver],{input:JSON.stringify(exercises.filter(e => e.runtimeMode !== "PROGRAM")),encoding:"utf8",timeout:15000});
  assert.equal(result.status,0,result.error?.message || result.stderr);
  assert.match(result.stdout,/Casos Python correctos/);
});

test("las referencias de los programas superan sus casos ejecutando el archivo completo", () => {
  const programs = exercises.filter(e => e.runtimeMode === "PROGRAM");
  assert.ok(programs.length > 0, "la ruta desde cero necesita actividades de programa");
  for (const exercise of programs) {
    let starterSolved = true;
    for (const fixture of exercise.tests) {
      assert.equal(typeof fixture.input, "string", `${exercise.slug}: la entrada de un programa es texto`);
      assert.equal(typeof fixture.expected, "string", `${exercise.slug}: la salida de un programa es texto`);
    }
    for (const fixture of exercise.tests) {
      const result = spawnSync(process.execPath, ["-e", exercise.javascript], { input: String(fixture.input), encoding: "utf8", timeout: 5000 });
      assert.equal(result.status, 0, `${exercise.slug}: ${result.stderr}`);
      assert.equal(result.stdout, fixture.expected, `${exercise.slug}: salida de JavaScript`);
      const starter = spawnSync(process.execPath, ["-e", exercise.starters!.javascript], { input: String(fixture.input), encoding: "utf8", timeout: 5000 });
      assert.equal(starter.status, 0, `${exercise.slug}: la plantilla de JavaScript debe ejecutarse`);
      if (starter.stdout !== fixture.expected) starterSolved = false;
    }
    assert.equal(starterSolved, false, `${exercise.slug}: la plantilla no debe resolver todos los casos`);
  }
  const driver = `import json,sys,io,contextlib
items=json.load(sys.stdin)
for item in items:
 starter_passes=[]
 for case in item['tests']:
  buf=io.StringIO(); saved=sys.stdin; sys.stdin=io.StringIO(case['input'])
  try:
   with contextlib.redirect_stdout(buf): exec(item['python'],{})
  finally: sys.stdin=saved
  assert buf.getvalue()==case['expected'], item['slug']+': '+repr(buf.getvalue())
  sbuf=io.StringIO(); sys.stdin=io.StringIO(case['input'])
  try:
   with contextlib.redirect_stdout(sbuf): exec(item['starters']['python'],{})
  finally: sys.stdin=saved
  starter_passes.append(sbuf.getvalue()==case['expected'])
 assert not all(starter_passes), item['slug']+': plantilla ya resuelta'
print('Programas Python correctos')`;
  const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { input: JSON.stringify(programs), encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.match(result.stdout, /Programas Python correctos/);
});
