import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { exercises } from "../prisma/content";

// Solo se ejecutan las soluciones de referencia escritas en este repositorio.
// Este código de verificación editorial no forma parte del servidor ni acepta programas de usuarios.
test("el catálogo cubre tres niveles y no duplica slugs", () => {
  assert.equal(exercises.length,24);
  assert.equal(new Set(exercises.map(e=>e.slug)).size,24);
  for (const level of ["BEGINNER","INTERMEDIATE","ADVANCED"]) assert.equal(exercises.filter(e=>e.level===level).length,8);
  for (const exercise of exercises) { assert.ok(exercise.tests.length>=3);assert.equal(exercise.hints.length,3); }
});

test("las 24 soluciones JavaScript superan los 120 casos editoriales", () => {
  for (const exercise of exercises) for (const fixture of exercise.tests) {
    const context=vm.createContext({data:structuredClone(fixture.input)});
    const actual=new vm.Script(`${exercise.javascript}\nsolve(data)`).runInContext(context,{timeout:1000});
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),fixture.expected,`${exercise.slug}: ${JSON.stringify(fixture.input)}`);
  }
});

test("las 24 soluciones Python superan los mismos casos editoriales", () => {
  const driver="import json,sys\nitems=json.load(sys.stdin)\nfor item in items:\n scope={}\n exec(item['python'],scope)\n for case in item['tests']:\n  actual=scope['solve'](case['input'])\n  assert actual == case['expected'], item['slug'] + ': ' + repr(case['input']) + ' -> ' + repr(actual)\nprint('120 casos Python correctos')\n";
  const result=spawnSync(process.env.PYTHON_BIN || "python",["-c",driver],{input:JSON.stringify(exercises),encoding:"utf8",timeout:15000});
  assert.equal(result.status,0,result.error?.message || result.stderr);
  assert.match(result.stdout,/120 casos Python correctos/);
});
