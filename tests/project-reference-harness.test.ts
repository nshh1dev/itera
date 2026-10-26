import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { logicExercises } from "../prisma/logic-content";
import { projectExecutionFiles } from "../src/server/execution/harness";
import { judgeProject } from "../src/server/execution/judge";
import { validateProjectDefinition, validateProjectSolution } from "../src/lib/project";

// Solo referencias fijas del repositorio: ejercita el conductor real y su
// comparador, pero no Piston ni aislamiento. Nunca ejecuta código de alumnos.
for (const language of ["python", "javascript"] as const) {
  test(`el conductor de proyectos ${language} evalúa referencias y artefactos del catálogo integrado`, () => {
    const root = path.join(process.cwd(), ".local", "harness-references");
    mkdirSync(root, { recursive: true });
    // El paquete de Itera es ESM, pero el runtime Node de los proyectos es
    // CommonJS. El límite de paquete queda fuera del directorio de cada caso.
    writeFileSync(path.join(root, "package.json"), '{"type":"commonjs"}');
    let checked = 0;
    for (const exercise of logicExercises) {
      const manifest = exercise.projects?.[language];
      if (!manifest) continue;
      const project = validateProjectDefinition(manifest);
      const solution = validateProjectSolution(project, exercise.projectSolutions?.[language]);
      for (const [order, fixture] of exercise.tests.entries()) {
        const directory = mkdtempSync(path.join(root, `${language}-`));
        try {
          const files = projectExecutionFiles(language, solution, project, exercise.runtimeMode ?? "FUNCTION");
          for (const file of files) writeFileSync(path.join(directory, file.name), file.content);
          const processResult = spawnSync(language === "python" ? process.env.PYTHON_BIN ?? "python" : process.execPath, [files[0].name], { cwd: directory, input: JSON.stringify(fixture.input), encoding: "utf8", timeout: 10000, maxBuffer: 128 * 1024 });
          assert.ifError(processResult.error);
          const result = judgeProject({ stdout: processResult.stdout, stderr: processResult.stderr, code: processResult.status, signal: processResult.signal }, { ...fixture, visible: true, order }, exercise.runtimeMode ?? "FUNCTION");
          assert.equal(result.passed, true, `${exercise.slug}, caso ${order + 1}: ${JSON.stringify(result)}`);
          checked++;
        } finally { rmSync(directory, { recursive: true, force: true }); }
      }
    }
    assert.ok(checked >= 60, `Solo se evaluaron ${checked} casos de proyecto`);
  });
}
