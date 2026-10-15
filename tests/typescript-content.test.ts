import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import ts from "typescript";
import { exercises } from "../prisma/content";
import { executionFiles, executionInput } from "../src/server/execution/harness";

// Solo referencias fijas del repositorio. Esta compilación NO se importa desde
// el servidor y nunca acepta código enviado por alumnos.
function diagnostics(sources: Map<string, string>) {
  const options: ts.CompilerOptions = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, types: [], skipLibCheck: true };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (file, version, onError, fresh) => sources.has(file) ? ts.createSourceFile(file, sources.get(file)!, version, true) : original(file, version, onError, fresh);
  const program = ts.createProgram([...sources.keys()], options, host);
  return ts.getPreEmitDiagnostics(program).map(d => `${d.file?.fileName}:${d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : ""} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
}

test("todas las referencias y plantillas TypeScript cumplen el contrato estricto", () => {
  const sources = new Map<string, string>();
  for (const exercise of exercises) {
    assert.ok(exercise.typescript, exercise.slug);
    assert.ok(exercise.starters?.typescript, exercise.slug);
    for (const [kind, code] of [["solution", exercise.typescript], ["starter", exercise.starters!.typescript]] as const) {
      assert.doesNotMatch(code!, /@ts-(?:nocheck|ignore)|\bany\b/, `${exercise.slug}: no ocultar errores de tipos`);
      sources.set(`/itera-${exercise.slug}-${kind}.ts`, `export {};\ndeclare function require(name: "fs"): { readFileSync(fd: number, encoding: "utf8"): string };\n${code}\n${exercise.typescriptContract ?? ""}`);
    }
  }
  assert.deepEqual(diagnostics(sources), []);
});

test("las referencias TypeScript producen los mismos resultados y las plantillas retiran ayuda", () => {
  for (const exercise of exercises) {
    let starterSolved = true;
    for (const kind of ["solution", "starter"] as const) {
      const source = kind === "solution" ? exercise.typescript! : exercise.starters!.typescript!;
      const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
      for (const fixture of exercise.tests) {
        const lines: string[] = [];
        const context = vm.createContext({ data: structuredClone(fixture.input), console: { log: (...args: unknown[]) => lines.push(args.map(String).join(" ")) }, require: (name: string) => {
          assert.equal(name, "fs");
          return { readFileSync: () => String(fixture.input) };
        } });
        const actual = new vm.Script(`${code}\n${exercise.runtimeMode === "PROGRAM" ? "" : "solve(data)"}`).runInContext(context, { timeout: 1000 });
        const normalized = exercise.runtimeMode === "PROGRAM" ? `${lines.join("\n")}${lines.length ? "\n" : ""}` : JSON.parse(JSON.stringify(actual));
        if (kind === "solution") assert.deepEqual(normalized, fixture.expected, exercise.slug);
        else if (JSON.stringify(normalized) !== JSON.stringify(fixture.expected)) starterSolved = false;
      }
    }
    assert.equal(starterSolved, exercise.activityType === "OBSERVATION", exercise.slug);
  }
});

test("TypeScript rechaza asignaciones incorrectas aunque la salida pudiera coincidir", () => {
  assert.ok(diagnostics(new Map([["/itera-invalid.ts", 'const valor: number = "12"; console.log(valor);']])).some(d => d.includes("not assignable")));
  const exercise = exercises.find(exercise => exercise.slug === "suma-uno")!;
  assert.ok(diagnostics(new Map([["/itera-wrong-contract.ts", `function solve(data: number): string { return String(data + 1); }\n${exercise.typescriptContract}`]])).some(d => d.includes("not assignable")));
});

test("el conductor TypeScript compila estrictamente dentro del sandbox antes de ejecutar", () => {
  const injected = 'console.log("texto");\n// ` ${process.exit()}';
  const files = executionFiles("typescript", injected, "PROGRAM");
  assert.equal(files[0].name, "main"); // Piston añade .ts al compilar.
  assert.ok(files[0].content.includes(JSON.stringify(injected).slice(1, -1)));
  assert.match(files[0].content, /'--strict', '--noEmitOnError'/);
  assert.ok(files[0].content.indexOf("compiled.status !== 0") < files[0].content.indexOf("const executed"));
  assert.equal(executionInput("Ana\n", "PROGRAM"), "Ana\n");
  assert.equal(executionInput({ a: 2 }, "FUNCTION"), '{"a":2}');
});

test("un diagnóstico del compilador detiene el conductor aunque pudiera imprimirse la respuesta", () => {
  const driver = executionFiles("typescript", 'console.log("3");', "PROGRAM")[0].content;
  const javascript = ts.transpileModule(driver, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const calls: unknown[][] = [];
  let stderr = "", stdout = "";
  const exit = new Error("salida controlada");
  const context = vm.createContext({ require: (name: string) => name === "fs" ? { writeFileSync: () => {}, readFileSync: () => "" } : { spawnSync: (...args: unknown[]) => { calls.push(args); return { status: 2, stdout: "TS2322: tipo incompatible", stderr: "" }; } }, process: { execPath: "node", stdout: { write: (text: string) => { stdout += text; } }, stderr: { write: (text: string) => { stderr += text; } }, exit: (code: number) => { assert.equal(code, 1); throw exit; } } });
  assert.throws(() => new vm.Script(javascript).runInContext(context), error => error === exit);
  assert.equal(calls.length, 1, "no se llega a ejecutar el archivo emitido");
  assert.equal(calls[0][0], "tsc");
  assert.equal(stdout, "");
  assert.match(stderr, /TS2322/);
});
