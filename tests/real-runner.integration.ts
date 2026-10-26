// Verificación contra el Piston real. No usa el doble HTTP de las pruebas de navegador:
// ejecuta código dentro del sandbox de verdad. Se salta si el ejecutor no está levantado,
// y por eso vive fuera del patrón `tests/*.test.ts` que usa `npm test`.
//
// Necesita la condición `react-server` porque el adaptador marca `import "server-only"`.
// Ejecutar con: npm run test:runner   (subconjunto)   ·   ITERA_RUNNER_ALL=1 npm run test:runner (catálogo completo)
import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { availableRuntime, runCode, RunnerUnavailable } from "../src/server/execution/piston";
import { judge, judgeOwnTests, judgeProgram, judgeProject } from "../src/server/execution/judge";
import { exercises } from "../prisma/content";
import { logicExercises } from "../prisma/logic-content";
import type { Json } from "../src/lib/types";
import type { ProjectDefinition, ProjectFile } from "../src/lib/project";

const subset = ["suma-de-dos-numeros", "par-o-impar", "el-mayor-de-tres", "contar-vocales", "invertir-cadena"];

async function executorReady() {
  try {
    await availableRuntime("python");
    await availableRuntime("javascript");
    return true;
  } catch {
    return false;
  }
}

const ready = await executorReady();
const only = { skip: ready ? false : "Piston no responde; ejecuta docker compose up -d y npm run runner:setup" };
const base = { input: { a: 1, b: 2 } as Json, expected: 3 as Json, visible: true, order: 0 };
const detail = (output: { stdout: string; stderr: string }) => `stdout=${JSON.stringify(output.stdout)} stderr=${output.stderr.slice(0, 400)}`;
let typescriptReady = false;
try { await availableRuntime("typescript"); typescriptReady = true; } catch {}
const typescriptOnly = { skip: typescriptReady ? false : "Falta el runtime TypeScript real de Piston; ejecuta npm run runner:setup" };

test("el sandbox real expone los runtimes originales de Python y JavaScript", only, async () => {
  const python = await availableRuntime("python");
  const javascript = await availableRuntime("javascript");
  assert.equal(python.language, "python");
  assert.match(python.version, /^\d+\.\d+/);
  assert.match(javascript.language, /javascript|^js$|^node$/);
});

test("TypeScript conserva los veredictos y no expone diagnósticos de casos ocultos", typescriptOnly, async () => {
  const runtime = await availableRuntime("typescript");
  const contract = "const __iteraContract: (data: number) => number = solve;";
  const visible = { input: 2, expected: 3, visible: true, order: 0 };
  const incorrect = await runCode("typescript", runtime, "function solve(data: number): number { return 99; }", 2, "FUNCTION", contract);
  assert.equal(judge(incorrect, visible).status, "wrong");
  const crashed = await runCode("typescript", runtime, 'function solve(data: number): number { throw new Error("diagnóstico privado"); }', 2, "FUNCTION", contract);
  assert.equal(judge(crashed, visible).status, "runtime");
  assert.match(judge(crashed, visible).error ?? "", /diagnóstico privado/);
  assert.deepEqual(judge(crashed, { ...visible, visible: false }), { index: 1, visible: false, passed: false, status: "runtime" });
  const looped = await runCode("typescript", runtime, "function solve(data: number): number { while (true) {} }", 2, "FUNCTION", contract);
  assert.equal(judge(looped, visible).status, "timeout", detail(looped));
  const printedThenLooped = await runCode("typescript", runtime, 'console.log("3"); while (true) {}', "", "PROGRAM");
  assert.equal(judgeProgram(printedThenLooped, { ...visible, expected: "3\n" }).status, "timeout", detail(printedThenLooped));
});

test("las soluciones de referencia del catálogo pasan sus casos dentro del sandbox", only, async () => {
  const selected = process.env.ITERA_RUNNER_ALL ? [...exercises, ...logicExercises] : exercises.filter((exercise) => subset.includes(exercise.slug));
  assert.ok(selected.length >= 5);
  for (const language of ["python", "javascript"] as const) {
    const runtime = await availableRuntime(language);
    for (const exercise of selected) {
      for (const [order, testCase] of exercise.tests.entries()) {
        const mode = exercise.runtimeMode ?? "FUNCTION";
        const output = await runCode(language, runtime, exercise[language], testCase.input, mode);
        const result = (mode === "PROGRAM" ? judgeProgram : judge)(output, { ...testCase, visible: true, order });
        assert.equal(result.passed, true, `${exercise.slug} (${language}) caso ${order + 1} — ${detail(output)}`);
      }
    }
  }
});

test("el sandbox real distingue aprobado, incorrecto, error y tiempo agotado", only, async () => {
  const runtime = await availableRuntime("python");
  const approved = judge(await runCode("python", runtime, "def solve(data):\n    return data['a'] + data['b']", base.input), base);
  assert.equal(approved.status, "passed");
  const wrong = judge(await runCode("python", runtime, "def solve(data):\n    return 0", base.input), base);
  assert.equal(wrong.passed, false);
  assert.equal(wrong.status, "wrong");
  const crashed = judge(await runCode("python", runtime, "def solve(data):\n    return data['nope']", base.input), base);
  assert.equal(crashed.status, "runtime");
  assert.match(crashed.error ?? "", /KeyError/);
  const looped = judge(await runCode("python", runtime, "def solve(data):\n    while True:\n        pass", base.input), base);
  assert.equal(looped.status, "timeout");
  assert.equal(looped.passed, false);
});

test("el mismo veredicto funciona igual en JavaScript", only, async () => {
  const runtime = await availableRuntime("javascript");
  const approved = judge(await runCode("javascript", runtime, "function solve(data) { return data.a + data.b; }", base.input), base);
  assert.equal(approved.status, "passed");
  const crashed = judge(await runCode("javascript", runtime, "function solve(data) { return data.nope; }", base.input), base);
  assert.equal(crashed.status, "runtime");
  const looped = judge(await runCode("javascript", runtime, "function solve(data) { while (true) {} }", base.input), base);
  assert.equal(looped.status, "timeout");
});

test("un ejecutor ausente se distingue de una respuesta incorrecta", async () => {
  const original = process.env.PISTON_URL;
  try {
    process.env.PISTON_URL = "http://127.0.0.1:2999";
    await assert.rejects(() => availableRuntime("python"), RunnerUnavailable);
    process.env.PISTON_URL = "https://piston.example.com";
    await assert.rejects(() => availableRuntime("python"), /PISTON_URL debe apuntar al ejecutor HTTP/);
  } finally {
    if (original === undefined) delete process.env.PISTON_URL;
    else process.env.PISTON_URL = original;
  }
});

test("TypeScript compila estrictamente antes de evaluar funciones y programas", typescriptOnly, async () => {
  const runtime = await availableRuntime("typescript");
  const contract = "const __iteraContract: (data: { a: number; b: number }) => number = solve;";
  const correct = await runCode("typescript", runtime, "function solve(data: {a: number; b: number}): number { return data.a + data.b; }", base.input, "FUNCTION", contract);
  assert.equal(judge(correct, base).passed, true, detail(correct));
  const invalid = await runCode("typescript", runtime, 'function solve(data: {a: number; b: number}): number { const texto: number = "incorrecto"; return data.a + data.b; }', base.input, "FUNCTION", contract);
  assert.equal(judge(invalid, base).status, "runtime");
  assert.match(invalid.stderr, /TypeScript|TS2322/);
  const incompatible = await runCode("typescript", runtime, 'function solve(data: {a: number; b: number}): string { return String(data.a + data.b); }', base.input, "FUNCTION", contract);
  assert.notEqual(incompatible.code, 0, detail(incompatible));
  const program = await runCode("typescript", runtime, 'const nombre: string = require("fs").readFileSync(0, "utf8").trim(); console.log("Hola, " + nombre);', "Ana\n", "PROGRAM");
  assert.equal(judgeProgram(program, { input: "Ana\n", expected: "Hola, Ana\n", visible: true, order: 0 }).passed, true, detail(program));
});

test("FUNCTION real importa módulos, reabre recursos y compara artefactos fuera del sandbox", only, async () => {
  const projects: Record<"python" | "javascript" | "typescript", { definition: ProjectDefinition; files: ProjectFile[]; contract: string }> = {
    python: {
      definition: { version: 1, entrypoint: "main.py", files: [] },
      files: [
        { path: "main.py", content: "import json\nfrom helper import duplicar\ndef solve(data):\n    with open('seed.json', encoding='utf-8') as archivo: seed = json.load(archivo)\n    valor = duplicar(data['value']) + seed['offset']\n    with open('result.json', 'w', encoding='utf-8') as archivo: json.dump({'result': valor}, archivo)\n    with open('result.json', encoding='utf-8') as archivo: return json.load(archivo)['result']" },
        { path: "helper.py", content: "def duplicar(valor): return valor * 2" },
        { path: "seed.json", content: "{\"offset\":1}", readOnly: true },
        { path: "pruebas.py", content: "from main import solve\nassert solve({'value': 3}) == 7" },
      ], contract: "",
    },
    javascript: {
      definition: { version: 1, entrypoint: "main.js", files: [] },
      files: [
        { path: "main.js", content: "const fs = require('fs');\nconst { duplicar } = require('./helper.js');\nfunction solve(data) { const seed = JSON.parse(fs.readFileSync('seed.json', 'utf8')); const valor = duplicar(data.value) + seed.offset; fs.writeFileSync('result.json', JSON.stringify({result:valor}), 'utf8'); return JSON.parse(fs.readFileSync('result.json', 'utf8')).result; }\nmodule.exports = solve;" },
        { path: "helper.js", content: "function duplicar(valor) { return valor * 2; }\nmodule.exports = { duplicar };" },
        { path: "seed.json", content: "{\"offset\":1}", readOnly: true },
        { path: "pruebas.js", content: "const assert = require('node:assert/strict');\nconst solve = require('./main.js');\nassert.equal(solve({value:3}), 7);" },
      ], contract: "",
    },
    typescript: {
      definition: { version: 1, entrypoint: "main.ts", files: [] },
      files: [
        { path: "main.ts", content: "import { duplicar } from './helper';\nconst fs = require('fs') as {readFileSync:(path:string,encoding:string)=>string;writeFileSync:(path:string,content:string,encoding:string)=>void};\nexport function solve(data: {value:number}): number { const seed: {offset:number} = JSON.parse(fs.readFileSync('seed.json','utf8')); const valor=duplicar(data.value)+seed.offset; fs.writeFileSync('result.json',JSON.stringify({result:valor}),'utf8'); return JSON.parse(fs.readFileSync('result.json','utf8')).result as number; }" },
        { path: "helper.ts", content: "export function duplicar(valor: number): number { return valor * 2; }" },
        { path: "seed.json", content: "{\"offset\":1}", readOnly: true },
        { path: "pruebas.ts", content: "import { solve } from './main';\nconst assert = require('node:assert/strict');\nassert.equal(solve({value:3}), 7);" },
      ], contract: "const __iteraContract: (data: {value:number}) => number = solve;",
    },
  };
  for (const language of ["python", "javascript"] as const) {
    const runtime = await availableRuntime(language);
    const project = projects[language];
    const definition = { ...project.definition, files: project.files, testEntrypoint: language === "python" ? "pruebas.py" : "pruebas.js" };
    const fixture = { input: { value: 3 }, expected: 7, expectedFiles: [{ path: "result.json", content: "{\"result\":7}" }], visible: true, order: 0 };
    const result = await runCode(language, runtime, "", fixture.input, "FUNCTION", project.contract, { definition, files: project.files });
    assert.equal(judgeProject(result, fixture, "FUNCTION").passed, true, detail(result));
    const ownTests = await runCode(language, runtime, "", "", "FUNCTION", "", { definition, files: project.files, purpose: "tests" });
    assert.equal(judgeOwnTests(ownTests).passed, true, detail(ownTests));
  }
});

test("el runner real TypeScript resuelve imports del proyecto y aserciones de Node", typescriptOnly, async () => {
  const runtime = await availableRuntime("typescript");
  const project: ProjectDefinition = { version: 1, entrypoint: "main.ts", testEntrypoint: "pruebas.ts", files: [
    { path: "main.ts", content: "import { duplicar } from './helper';\nexport function solve(data: number): number { return duplicar(data); }" },
    { path: "helper.ts", content: "export function duplicar(valor: number): number { return valor * 2; }" },
    { path: "pruebas.ts", content: "import { solve } from './main';\nconst assert = require('node:assert/strict');\nassert.equal(solve(3), 6);" },
  ] };
  const contract = "const __iteraContract: (data: number) => number = solve;";
  const output = await runCode("typescript", runtime, "", 3, "FUNCTION", contract, { definition: project, files: project.files });
  assert.equal(judgeProject(output, { input: 3, expected: 6, visible: true, order: 0 }, "FUNCTION").passed, true, detail(output));
  const ownTests = await runCode("typescript", runtime, "", "", "FUNCTION", contract, { definition: project, files: project.files, purpose: "tests" });
  assert.equal(judgeOwnTests(ownTests).passed, true, detail(ownTests));
});

test("verifyPersistence ejecuta solve([]) en otro proceso y comprueba recursos editados en Python y JavaScript", only, async () => {
  for (const language of ["python", "javascript"] as const) {
    const runtime = await availableRuntime(language);
    const definition: ProjectDefinition = language === "python" ? {
      version: 1, entrypoint: "main.py", verifyPersistence: true, files: [
        { path: "main.py", content: "import json\ndef solve(data):\n    with open('store.json', encoding='utf-8') as file: state = json.load(file)\n    state['items'].extend(data)\n    with open('store.json', 'w', encoding='utf-8') as file: json.dump(state, file, ensure_ascii=False, separators=(',', ':'))\n    return {'count': len(state['items'])}" },
        { path: "store.json", content: "{\"items\":[]}" },
      ],
    } : {
      version: 1, entrypoint: "main.js", verifyPersistence: true, files: [
        { path: "main.js", content: "const fs = require('fs');\nfunction solve(data) { const state = JSON.parse(fs.readFileSync('store.json', 'utf8')); state.items.push(...data); fs.writeFileSync('store.json', JSON.stringify(state)); return {count:state.items.length}; }\nmodule.exports = solve;" },
        { path: "store.json", content: "{\"items\":[]}" },
      ],
    };
    const expectedFiles = [{ path: "store.json", content: "{\"items\":[5]}" }];
    const fixture = { input: [5], expected: { count: 1 }, expectedPersistence: { count: 1 }, expectedFiles, visible: true, order: 0 };
    const output = await runCode(language, runtime, "", fixture.input, "FUNCTION", "", { definition, files: definition.files });
    assert.equal(judgeProject(output, fixture, "FUNCTION").passed, true, `${language}: ${detail(output)}`);
  }
});

test("verifyPersistence TypeScript compila imports y evalúa el segundo proceso sobre el archivo cambiado", typescriptOnly, async () => {
  const runtime = await availableRuntime("typescript");
  const definition: ProjectDefinition = { version: 1, entrypoint: "main.ts", verifyPersistence: true, files: [
    { path: "main.ts", content: "import { cargar, guardar } from './store';\nexport function solve(data: number[]): {count:number} { const state = cargar(); state.items.push(...data); guardar(state); return {count:state.items.length}; }" },
    { path: "store.ts", content: "import fs = require('fs');\ntype State = {items:number[]};\nexport function cargar(): State { return JSON.parse(fs.readFileSync('store.json','utf8')) as State; }\nexport function guardar(state: State): void { fs.writeFileSync('store.json',JSON.stringify(state),'utf8'); }" },
    { path: "store.json", content: "{\"items\":[]}" },
  ] };
  const fixture = { input: [5], expected: { count: 1 }, expectedPersistence: { count: 1 }, expectedFiles: [{ path: "store.json", content: "{\"items\":[5]}" }], visible: true, order: 0 };
  const output = await runCode("typescript", runtime, "", fixture.input, "FUNCTION", "const __iteraContract: (data: number[]) => {count:number} = solve;", { definition, files: definition.files });
  assert.equal(judgeProject(output, fixture, "FUNCTION").passed, true, detail(output));
});

test("las referencias TypeScript pasan en el runtime real", typescriptOnly, async () => {
  const runtime = await availableRuntime("typescript");
  const selected = process.env.ITERA_RUNNER_ALL ? [...exercises, ...logicExercises] : [...exercises.filter(exercise => ["lee-y-saluda", "valor-o-respaldo", "suma-de-dos-numeros", "presupuesto-de-merienda"].includes(exercise.slug)), ...logicExercises.filter(exercise => ["logica-lee-suma", "logica-monticulo-extrae", "logica-planifica-tareas"].includes(exercise.slug))];
  for (const exercise of selected) for (const [order, fixture] of exercise.tests.entries()) {
    const mode = exercise.runtimeMode ?? "FUNCTION";
    const output = await runCode("typescript", runtime, exercise.typescript!, fixture.input, mode, exercise.typescriptContract);
    assert.equal((mode === "PROGRAM" ? judgeProgram : judge)(output, { ...fixture, visible: true, order }).passed, true, `${exercise.slug}: ${detail(output)}`);
  }
});
