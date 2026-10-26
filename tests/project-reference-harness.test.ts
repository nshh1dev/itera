import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";
import { logicExercises } from "../prisma/logic-content";
import { projectExecutionFiles } from "../src/server/execution/harness";
import { judgeProject } from "../src/server/execution/judge";
import { validateProjectDefinition, validateProjectSolution } from "../src/lib/project";

// Solo referencias fijas del repositorio: ejercita el conductor real y su
// comparador, pero no Piston ni aislamiento. Nunca ejecuta código de alumnos.
for (const language of ["python", "javascript", "typescript"] as const) {
  test(`el conductor de proyectos ${language} evalúa referencias y artefactos del catálogo integrado`, () => {
    const local = path.join(process.cwd(), ".local");
    mkdirSync(local, { recursive: true });
    const root = mkdtempSync(path.join(local, "harness-references-"));
    // El paquete de Itera es ESM, pero el runtime Node de los proyectos es
    // CommonJS. El límite de paquete queda fuera del directorio de cada caso.
    writeFileSync(path.join(root, "package.json"), '{"type":"commonjs"}');
    const typeRoots = path.join(root, "types");
    mkdirSync(typeRoots);
    let checked = 0;
    try {
    for (const exercise of logicExercises) {
      const manifest = exercise.projects?.[language];
      if (!manifest) continue;
      const project = validateProjectDefinition(manifest);
      const solution = validateProjectSolution(project, exercise.projectSolutions?.[language]);
      for (const [order, fixture] of exercise.tests.entries()) {
        const directory = mkdtempSync(path.join(root, `${language}-`));
        try {
          const files = projectExecutionFiles(language, solution, project, exercise.runtimeMode ?? "FUNCTION", language === "typescript" ? exercise.typescriptContract ?? "" : "");
          for (const file of files) writeFileSync(path.join(directory, file.name), file.content);
          let entrypoint = files[0].name;
          if (language === "typescript") {
            // El runtime de Piston transpila el conductor externo. Aquí se
            // reproduce ese paso SOLO para código fijo del repositorio. Node
            // invoca directamente tsc.js para evitar el wrapper .cmd de Windows.
            const compiler = path.join(process.cwd(), "node_modules", "typescript", "bin", "tsc");
            // Piston no hereda @types/node de Itera. Limitar SOLO los tipos
            // ambientales de esta simulación, sin skipLibCheck ni no-strict.
            const driver = files[0].content.replace("child.spawnSync('tsc', [...sources,", `child.spawnSync(${JSON.stringify(process.execPath)}, [${JSON.stringify(compiler)}, ...sources, '--typeRoots', ${JSON.stringify(typeRoots)},`);
            entrypoint = "__itera_runner.js";
            writeFileSync(path.join(directory, entrypoint), ts.transpileModule(driver, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText);
          }
          const processResult = spawnSync(language === "python" ? process.env.PYTHON_BIN ?? "python" : process.execPath, [entrypoint], { cwd: directory, input: JSON.stringify(fixture.input), encoding: "utf8", timeout: 20000, maxBuffer: 512 * 1024 });
          assert.ifError(processResult.error);
          const result = judgeProject({ stdout: processResult.stdout, stderr: processResult.stderr, code: processResult.status, signal: processResult.signal }, { ...fixture, visible: true, order }, exercise.runtimeMode ?? "FUNCTION");
          assert.equal(result.passed, true, `${exercise.slug}, caso ${order + 1}: ${JSON.stringify(result)}`);
          checked++;
        } finally { rmSync(directory, { recursive: true, force: true }); }
      }
    }
    assert.ok(checked >= 60, `Solo se evaluaron ${checked} casos de proyecto`);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}
