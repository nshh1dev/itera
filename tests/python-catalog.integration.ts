// Validación de fuentes sin Prisma ni escrituras: no preparar ni activar catálogo.
// Solo código editorial fijo, siempre en Piston mediante el adaptador real.
import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { pythonCatalog, validatePythonCatalog } from "../prisma/python-content";
import type { Json } from "../src/lib/types";
import { validateProjectDefinition, validateProjectSolution, validateExpectedProjectFiles, validateProjectPersistence } from "../src/lib/project";
import { availableRuntime, runCode } from "../src/server/execution/piston";
import { checkConcept } from "../src/server/execution/concepts";
import { judge, judgeProgram, judgeProject } from "../src/server/execution/judge";

const enabled = process.env.ITERA_PYTHON_CATALOG === "1";
test("catálogo Python completo en Piston, sin base de datos", {
  skip: enabled ? false : "Requiere ITERA_PYTHON_CATALOG=1 y Piston real preparado",
  timeout: 1200000,
}, async t => {
  validatePythonCatalog();
  assert.equal(pythonCatalog.length, 224);
  assert.equal(new Set(pythonCatalog.map(entry => entry.slug)).size, 224);
  const runtime = await availableRuntime("python"); // Sin infraestructura falla.
  let cases = 0, projects = 0, programs = 0, concepts = 0;
  for (const entry of pythonCatalog) await t.test(entry.slug, { timeout: 120000 }, async () => {
    const version = entry.content;
    const variant = version.variants[0];
    assert.equal(variant.language, "python");
    const mode = version.runtimeMode ?? "FUNCTION";
    const project = variant.project ? validateProjectDefinition(variant.project) : undefined;
    const files = project ? validateProjectSolution(project, variant.solutionFiles) : undefined;
    if (project) projects++;
    if (mode === "PROGRAM") programs++;
    if (version.conceptRule) concepts++;
    assert.equal(await checkConcept("python", variant.solution, version.conceptRule ?? ""), null, `${entry.slug}: concepto de referencia`);
    let solved = true;
    for (const fixture of variant.tests) {
      const input = fixture.input as Json;
      const expectedPersistence = project?.verifyPersistence ? fixture.expectedPersistence as Json : undefined;
      if (project) validateProjectPersistence(project, mode, input, expectedPersistence);
      const expected = { ...fixture, input, expected: fixture.expected as Json, visible: false,
        expectedPersistence, expectedFiles: project && fixture.expectedFiles ? validateExpectedProjectFiles(project, fixture.expectedFiles) : undefined };
      const evaluate = (output: Awaited<ReturnType<typeof runCode>>) => project ? judgeProject(output, expected, mode)
        : mode === "PROGRAM" ? judgeProgram(output, expected) : judge(output, expected);
      const reference = evaluate(await runCode("python", runtime, variant.solution, input, mode, "", project ? { definition: project, files: files! } : undefined));
      assert.ok(reference.passed, `${entry.slug}: referencia, caso ${fixture.order + 1} (${reference.status})`);
      const starter = evaluate(await runCode("python", runtime, variant.starter, input, mode, "", project ? { definition: project, files: project.files } : undefined));
      assert.ok(!["runtime", "timeout", "assertion"].includes(starter.status) && (project || !starter.error), `${entry.slug}: plantilla ejecutable, caso ${fixture.order + 1} (${starter.status})`);
      solved &&= starter.passed;
      cases++;
    }
    if (solved && version.conceptRule) solved = !(await checkConcept("python", variant.starter, version.conceptRule));
    assert.equal(solved, false, `${entry.slug}: la plantilla no debe resolver la actividad`);
  });
  t.diagnostic(JSON.stringify({ runtime: runtime.version, activities: pythonCatalog.length, cases, projects, programs, concepts }));
});
