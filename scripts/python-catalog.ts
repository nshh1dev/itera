import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pythonCatalog, validatePythonCatalog } from "../prisma/python-content";
import { preparePythonCatalog, pythonSnapshot, activatePythonCatalog } from "../prisma/python-install";
import { availableRuntime, runCode } from "../src/server/execution/piston";
import { checkConcept } from "../src/server/execution/concepts";
import { judge, judgeProgram, judgeProject } from "../src/server/execution/judge";
import { validateProjectDefinition, validateProjectSolution, validateExpectedProjectFiles, validateProjectPersistence } from "../src/lib/project";
import type { Json } from "../src/lib/types";

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => !["--prepare", "--apply"].includes(arg))) throw new Error("Uso: npm run content:python -- [--prepare | --apply]");
  validatePythonCatalog();
  console.log(`Python: ${pythonCatalog.length} actividades; ${pythonCatalog.filter(entry => !entry.baseline).length} nuevas. JavaScript y TypeScript no cambian.`);
  if (!args.length) { console.log("Vista previa sin conexión a base de datos ni escrituras. --prepare crea borradores; --apply valida en Piston y activa el lote Python."); return; }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const runtime = args[0] === "--apply" ? await availableRuntime("python") : undefined;
    console.log(`${await preparePythonCatalog(db)} borradores creados.`);
    if (!runtime) return;
    const snapshot = await pythonSnapshot(db);
    for (const entry of snapshot) {
      const version = entry.version;
      const variant = version.variants[0];
      const project = variant.project ? validateProjectDefinition(variant.project) : undefined;
      const files = project ? validateProjectSolution(project, variant.solutionFiles) : undefined;
      let solved = true;
      if (await checkConcept("python", variant.solution, version.conceptRule)) throw new Error(`${entry.slug}: concepto de referencia inválido.`);
      for (const test of variant.tests) {
        const expectedPersistence = project?.verifyPersistence ? test.expectedPersistence as Json : undefined;
        if (project) validateProjectPersistence(project, version.runtimeMode, test.input, expectedPersistence);
        const fixture = { ...test, visible: true, input: test.input as Json, expected: test.expected as Json, expectedPersistence,
          expectedFiles: project && test.expectedFiles ? validateExpectedProjectFiles(project, test.expectedFiles) : undefined };
        const evaluate = project ? (result: Awaited<ReturnType<typeof runCode>>) => judgeProject(result, fixture, version.runtimeMode)
          : version.runtimeMode === "PROGRAM" ? (result: Awaited<ReturnType<typeof runCode>>) => judgeProgram(result, fixture) : (result: Awaited<ReturnType<typeof runCode>>) => judge(result, fixture);
        const output = evaluate(await runCode("python", runtime, variant.solution, fixture.input, version.runtimeMode, "", project ? { definition: project, files: files! } : undefined));
        if (!output.passed) throw new Error(`${entry.slug}: referencia inválida en caso ${test.order + 1} (${output.status}).`);
        const initial = evaluate(await runCode("python", runtime, variant.starter, fixture.input, version.runtimeMode, "", project ? { definition: project, files: project.files } : undefined));
        if (["runtime", "timeout", "assertion"].includes(initial.status) || (!project && initial.error)) throw new Error(`${entry.slug}: plantilla no ejecutable en caso ${test.order + 1}.`);
        solved &&= initial.passed;
      }
      if (solved && version.conceptRule) solved = !(await checkConcept("python", variant.starter, version.conceptRule));
      if (solved) throw new Error(`${entry.slug}: la plantilla ya resuelve todos los casos.`);
      console.log(`Validado en Piston Python: ${entry.slug}`);
    }
    await activatePythonCatalog(db, snapshot);
    console.log("Recorrido Python activado atómicamente. Rutas comunes, otros lenguajes e historial conservados.");
  } finally { await db.$disconnect(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "No se pudo completar el catálogo Python."); process.exitCode = 1; });
