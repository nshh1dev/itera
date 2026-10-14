import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { exercises } from "../prisma/content";
import { introductoryExercises } from "../prisma/introductory-content";
import { foundationExercises } from "../prisma/foundation-content";
import { exerciseHref, foundationSteps, introductorySteps, learningPaths, nextExerciseSlug } from "../src/lib/learning-paths";

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

test("la ruta desde cero empieza observando y utiliza plantillas propias", () => {
  assert.equal(exercises[0].slug, "tu-primer-resultado");
  assert.equal(learningPaths[0].slug, "desde-cero");
  assert.equal(learningPaths[0].level, "BEGINNER");
  for (const exercise of introductoryExercises) {
    assert.equal(exercise.level, "BEGINNER");
    for (const language of ["python", "javascript"] as const) {
      assert.ok(exercise.starters?.[language].includes("return"), exercise.slug);
    }
  }
  assert.ok(exercises.findIndex(e => e.slug === "suma-de-dos-numeros") > exercises.findIndex(e => e.slug === "lee-un-dato-con-nombre"));
});

test("las rutas editoriales cubren fundamentos sin duplicados ni referencias inexistentes", () => {
  assert.deepEqual(introductorySteps, [...introductoryExercises.map(e => e.slug), "suma-de-dos-numeros"]);
  for (const path of learningPaths.filter(p => p.slugs)) {
    assert.equal(new Set(path.slugs).size, path.slugs!.length);
    for (const slug of path.slugs!) assert.ok(exercises.some(e => e.slug === slug), slug);
  }
  for (const lesson of foundationExercises) {
    assert.ok(foundationSteps.includes(lesson.slug), lesson.slug);
    for (const language of ["python", "javascript"] as const) assert.ok(lesson.starters?.[language].includes("return"), lesson.slug);
  }
  const before = (a: string, b: string) => assert.ok(foundationSteps.indexOf(a) < foundationSteps.indexOf(b), `${a} antes de ${b}`);
  before("compara-con-cero", "par-o-impar");
  before("resto-entre-dos", "par-o-impar");
  before("cuenta-los-elementos", "suma-del-arreglo");
  before("suma-del-arreglo", "factorial");
  before("construye-una-lista", "fizzbuzz");
});

test("continuar respeta el orden y el final de cada ruta", () => {
  assert.equal(nextExerciseSlug("suma-del-arreglo", foundationSteps), "el-mayor-de-tres");
  assert.equal(nextExerciseSlug("suma-de-dos-numeros", introductorySteps), undefined);
  assert.equal(nextExerciseSlug("no-existe", introductorySteps), undefined);
  assert.equal(exerciseHref("suma-del-arreglo", "python", "primeros-pasos"), "/ejercicios/suma-del-arreglo?lenguaje=python&ruta=primeros-pasos");
  assert.equal(exerciseHref("suma-del-arreglo", "javascript"), "/ejercicios/suma-del-arreglo?lenguaje=javascript");
});

test("las soluciones JavaScript superan todos los casos editoriales", () => {
  for (const exercise of exercises) for (const fixture of exercise.tests) {
    const context=vm.createContext({data:structuredClone(fixture.input)});
    const actual=new vm.Script(`${exercise.javascript}\nsolve(data)`).runInContext(context,{timeout:1000});
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),fixture.expected,`${exercise.slug}: ${JSON.stringify(fixture.input)}`);
  }
  for (const exercise of exercises.filter(e => e.starters)) {
    const context = vm.createContext({ data: structuredClone(exercise.tests[0].input) });
    new vm.Script(`${exercise.starters!.javascript}\nsolve(data)`).runInContext(context, { timeout: 1000 });
  }
});

test("las soluciones Python superan los mismos casos editoriales", () => {
  const driver="import json,sys\nitems=json.load(sys.stdin)\nfor item in items:\n if item.get('starters'):\n  compile(item['starters']['python'], item['slug'], 'exec')\n scope={}\n exec(item['python'],scope)\n for case in item['tests']:\n  actual=scope['solve'](case['input'])\n  assert actual == case['expected'], item['slug'] + ': ' + repr(case['input']) + ' -> ' + repr(actual)\nprint('Casos Python correctos')\n";
  const result=spawnSync(process.env.PYTHON_BIN || "python",["-c",driver],{input:JSON.stringify(exercises),encoding:"utf8",timeout:15000});
  assert.equal(result.status,0,result.error?.message || result.stderr);
  assert.match(result.stdout,/Casos Python correctos/);
});
