import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import ts from "typescript";
import { logicExercises } from "../prisma/logic-content";
import { exercises as historicalExercises } from "../prisma/content";
import { seedVersionContent } from "../prisma/editorial-revision";
import { curriculumUnits } from "../src/lib/curriculum-v2";
import { learningPaths, exerciseHref, nextExerciseSlug } from "../src/lib/learning-paths";
import { learningModules } from "../src/lib/learning-modules";
import { levels, languages } from "../src/lib/types";
import { editorialSchema, publicationMetadataSchema } from "../src/lib/editorial";
import { prerequisiteIssue } from "../src/lib/curriculum";
import { functionBatch } from "../prisma/logic-validation";

test("136 identidades nuevas cubren cuatro etapas sin heredar progreso histórico", () => {
  assert.equal(logicExercises.length, 136);
  assert.deepEqual(levels.map(level => logicExercises.filter(e => e.level === level).length), [28, 36, 36, 36]);
  assert.equal(new Set(logicExercises.map(e => e.slug)).size, 136);
  assert.ok(logicExercises.every(e => !historicalExercises.some(old => old.slug === e.slug)));
  assert.deepEqual(learningPaths.flatMap(p => p.slugs!), logicExercises.map(e => e.slug));
  for (const path of learningPaths) {
    assert.equal(logicExercises.find(e => e.slug === path.slugs!.at(-1))?.activityType, "INTEGRATION");
    assert.ok(path.slugs!.every(slug => logicExercises.find(e => e.slug === slug)?.level === path.level));
  }
  for (const unit of learningModules) {
    assert.ok(unit.theory.length > 150, unit.slug);
    assert.equal(unit.readiness.length, 2);
    for (const language of languages) assert.ok(unit.examples[language].length > 20);
  }
  assert.equal(curriculumUnits.length, 25);
});

test("las tres variantes comparten casos, contrato conceptual, orden y navegación", () => {
  const entries = logicExercises.map((e, order) => ({ slug: e.slug, order }));
  for (const exercise of logicExercises) {
    const version = seedVersionContent(exercise);
    const variants = Object.fromEntries(version.variants.map(v => [v.language, v]));
    const result = editorialSchema.safeParse({ ...exercise, ...version, ...variants, tests: version.variants[0].tests });
    assert.equal(result.success, true, `${exercise.slug}: ${result.success ? "" : result.error.message}`);
    assert.equal(publicationMetadataSchema.safeParse(version).success, true, exercise.slug);
    assert.equal(prerequisiteIssue(exercise.slug, exercise.prerequisiteSlugs!, entries), undefined, exercise.slug);
    assert.deepEqual(version.variants.map(v => v.language), [...languages]);
    for (const variant of version.variants) assert.deepEqual(variant.tests, version.variants[0].tests, exercise.slug);
    for (const language of languages) {
      const path = learningPaths.find(p => p.slugs!.includes(exercise.slug))!;
      assert.ok(exerciseHref(exercise.slug, language, path.slug).startsWith(`/ejercicios/${exercise.slug}?`));
      assert.equal(nextExerciseSlug(exercise.slug, path.slugs!), path.slugs![path.slugs!.indexOf(exercise.slug) + 1]);
    }
  }
});

test("las referencias y plantillas TypeScript nuevas compilan con strict sin ocultar errores", () => {
  const sources = new Map<string, string>();
  for (const exercise of logicExercises) for (const [kind, code] of [["solution", exercise.typescript], ["starter", exercise.starters!.typescript]]) {
    assert.ok(code, exercise.slug);
    assert.doesNotMatch(code!, /@ts-(?:nocheck|ignore)|\bany\b/, exercise.slug);
    sources.set(`/logica-${exercise.slug}-${kind}.ts`, `export {};\ndeclare function require(name: "fs"): { readFileSync(fd: number, encoding: "utf8"): string };\n${code}\n${exercise.typescriptContract ?? ""}`);
  }
  const functions = logicExercises.filter(e => e.runtimeMode !== "PROGRAM");
  for (let offset = 0; offset < functions.length; offset += 6) for (const kind of ["solution", "starter"] as const) {
    const batch = functionBatch("typescript", functions.slice(offset, offset + 6).map(e => ({ code: kind === "solution" ? e.typescript! : e.starters!.typescript!, typeContract: e.typescriptContract ?? "" })));
    sources.set(`/logica-batch-${offset}-${kind}.ts`, `export {};\n${batch}`);
  }
  const options: ts.CompilerOptions = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, types: [], skipLibCheck: true };
  const host = ts.createCompilerHost(options);
  const get = host.getSourceFile.bind(host);
  host.getSourceFile = (file, version, error, fresh) => sources.has(file) ? ts.createSourceFile(file, sources.get(file)!, version, true) : get(file, version, error, fresh);
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([...sources.keys()], options, host));
  assert.deepEqual(diagnostics.map(d => `${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`), []);
});

for (const language of ["javascript", "typescript"] as const) test(`las referencias ${language} superan los casos y sus plantillas funcionan sin resolverlos todos`, () => {
  for (const exercise of logicExercises) {
    let starterSolved = true;
    for (const kind of ["solution", "starter"] as const) {
      const source = kind === "solution" ? exercise[language]! : exercise.starters![language]!;
      const code = language === "typescript" ? ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText : source;
      for (const fixture of exercise.tests) {
        const lines: string[] = [];
        const context = vm.createContext({ data: structuredClone(fixture.input), console: { log: (...args: unknown[]) => lines.push(args.map(String).join(" ")) }, require: (name: string) => {
          assert.equal(name, "fs");
          return { readFileSync: () => String(fixture.input) };
        } });
        const actual = new vm.Script(`${code}\n${exercise.runtimeMode === "PROGRAM" ? "" : "solve(data)"}`).runInContext(context, { timeout: 1000 });
        const value = exercise.runtimeMode === "PROGRAM" ? `${lines.join("\n")}${lines.length ? "\n" : ""}` : JSON.parse(JSON.stringify(actual));
        if (kind === "solution") assert.deepEqual(value, fixture.expected, exercise.slug);
        else if (JSON.stringify(value) !== JSON.stringify(fixture.expected)) starterSolved = false;
      }
    }
    assert.equal(starterSolved, false, `${exercise.slug}: plantilla ya resuelta`);
  }
});

test("las referencias y plantillas Python nuevas usan los mismos casos", () => {
  // Solo referencias fijas del repositorio, nunca código de estudiantes.
  const driver = `import json, sys, io, contextlib
items = json.load(sys.stdin)
for item in items:
 solved = True
 for kind in ['solution', 'starter']:
  code = item['python'] if kind == 'solution' else item['starters']['python']
  for case in item['tests']:
   scope = {}
   capture = io.StringIO()
   sys.stdin = io.StringIO(str(case['input']))
   with contextlib.redirect_stdout(capture):
    exec(code, scope)
    actual = capture.getvalue() if item.get('runtimeMode') == 'PROGRAM' else scope['solve'](case['input'])
   if kind == 'solution':
    assert actual == case['expected'], (item['slug'], actual, case['expected'])
   elif actual != case['expected']: solved = False
 assert not solved, (item['slug'], 'plantilla resuelta')
 if item.get('runtimeMode') != 'PROGRAM':
  batch_scope = {}
  exec(item['batchedPython'], batch_scope)
  assert batch_scope['solve']([[case['input'] for case in item['tests']]]) == [[case['expected'] for case in item['tests']]], item['slug']
print('136 referencias y plantillas Python comprobadas')`;
  const data = logicExercises.map(e => ({ ...e, batchedPython: functionBatch("python", [{ code: e.python, typeContract: "" }]) }));
  const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { input: JSON.stringify(data), encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.status, 0, `${result.error ?? ""}\n${result.stdout}\n${result.stderr}`);
});

test("la validación por lotes conserva los resultados independientes y el aislamiento de nombres", () => {
  const functions = logicExercises.filter(e => e.runtimeMode !== "PROGRAM");
  for (const language of ["javascript", "typescript"] as const) for (let offset = 0; offset < functions.length; offset += 6) {
    const batch = functions.slice(offset, offset + 6);
    const source = functionBatch(language, batch.map(e => ({ code: e[language]!, typeContract: e.typescriptContract ?? "" })));
    const code = language === "typescript" ? ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText : source;
    const context = vm.createContext({ data: structuredClone(batch.map(e => e.tests.map(t => t.input))), console: { log: () => {} } });
    const actual = new vm.Script(`${code}\nsolve(data)`).runInContext(context, { timeout: 1000 });
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), batch.map(e => e.tests.map(t => t.expected)));
  }
});
