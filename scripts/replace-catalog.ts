import "dotenv/config";
import { isDeepStrictEqual } from "node:util";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logicExercises } from "../prisma/logic-content";
import { prepareLogicCatalog, logicSnapshot, activateLogicCatalog, validateLogicCatalog } from "../prisma/logic-install";
import { availableRuntime, runCode } from "../src/server/execution/piston";
import { judge, judgeProgram, judgeProject } from "../src/server/execution/judge";
import { languages, levelNames, type Json } from "../src/lib/types";
import { functionBatch } from "../prisma/logic-validation";
import { checkConcept } from "../src/server/execution/concepts";
import { validateExpectedProjectFiles, validateProjectDefinition, validateProjectPersistence, validateProjectSolution } from "../src/lib/project";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some(arg => !["--prepare", "--apply"].includes(arg))) throw new Error("Uso: npm run content:replace -- [--prepare | --apply]");
  validateLogicCatalog();
  for (const level of Object.keys(levelNames) as (keyof typeof levelNames)[]) console.log(`${levelNames[level]}: ${logicExercises.filter(e => e.level === level).length} ejercicios × 3 lenguajes`);
  if (!args.length) {
    console.log("Vista previa, sin escrituras. --prepare crea borradores; --apply valida en Piston y sustituye atómicamente el catálogo activo. Conserva intentos, borradores y progreso históricos, sin trasladarlos.");
    return;
  }
  if (args[0] === "--prepare") {
    console.log(`${await prepareLogicCatalog(db)} borradores creados. El catálogo activo no cambia.`);
    return;
  }
  // Fallar pronto si falta cualquier runtime, antes de escribir o retirar nada.
  const runtimes = Object.fromEntries(await Promise.all(languages.map(async language => [language, await availableRuntime(language)] as const)));
  await prepareLogicCatalog(db);
  const snapshot = await logicSnapshot(db);
  const entries = logicExercises.map(source => ({ slug: source.slug, version: snapshot.find(e => e.slug === source.slug)!.versions[0] }));
  for (const language of languages) {
    const projects = entries.flatMap(entry => {
      const variant = entry.version.variants.find(v => v.language === language)!;
      return variant.project ? [{ ...entry, variant }] : [];
    });
    for (const entry of projects) {
      const project = validateProjectDefinition(entry.variant.project);
      const solutionFiles = validateProjectSolution(project, entry.variant.solutionFiles);
      if (entry.version.conceptRule) throw new Error(`${entry.slug} (${language}): los proyectos no admiten reglas conceptuales de un solo archivo.`);
      for (const test of entry.variant.tests) {
        const expectedPersistence = project.verifyPersistence ? test.expectedPersistence as unknown as Json : undefined;
        validateProjectPersistence(project, entry.version.runtimeMode, test.input, expectedPersistence);
        const expectedFiles = test.expectedFiles ? validateExpectedProjectFiles(project, test.expectedFiles) : undefined;
        const fixture = { ...test, input: test.input as Json, expected: test.expected as Json, expectedFiles, expectedPersistence, visible: true };
        const solution = await runCode(language, runtimes[language], "", fixture.input, entry.version.runtimeMode, entry.variant.typeContract, { definition: project, files: solutionFiles });
        if (!judgeProject(solution, fixture, entry.version.runtimeMode).passed) throw new Error(`${entry.slug} (${language}): solución de proyecto inválida. El catálogo activo se conserva.`);
        const starter = await runCode(language, runtimes[language], "", fixture.input, entry.version.runtimeMode, entry.variant.typeContract, { definition: project, files: project.files });
        const initial = judgeProject(starter, fixture, entry.version.runtimeMode);
        if (["runtime", "timeout"].includes(initial.status) || initial.error) throw new Error(`${entry.slug} (${language}): la plantilla del proyecto no se ejecuta.`);
        if (initial.passed) throw new Error(`${entry.slug} (${language}): la plantilla ya resuelve todos sus casos.`);
      }
    }
    const functions = entries.filter(entry => entry.version.runtimeMode === "FUNCTION" && !entry.version.variants.some(variant => variant.project));
    for (let offset = 0; offset < functions.length; offset += 6) {
      const batch = functions.slice(offset, offset + 6).map(entry => ({ ...entry, variant: entry.version.variants.find(v => v.language === language)! }));
      const input = batch.map(entry => entry.variant.tests.map(test => test.input)) as Json;
      const expected = batch.map(entry => entry.variant.tests.map(test => test.expected)) as Json;
      const fixture = { input, expected, visible: true, order: 0 };
      const code = (kind: "solution" | "starter") => functionBatch(language, batch.map(entry => ({ code: entry.variant[kind], typeContract: entry.variant.typeContract })));
      const result = judge(await runCode(language, runtimes[language], code("solution"), input), fixture);
      if (!result.passed) throw new Error(`${language}: referencia inválida (${result.status}) en el lote ${batch.map(entry => entry.slug).join(", ")}. El catálogo activo se conserva.`);
      const initial = judge(await runCode(language, runtimes[language], code("starter"), input), fixture);
      if (["runtime", "timeout"].includes(initial.status) || initial.error || !Array.isArray(initial.actual) || initial.actual.length !== batch.length) throw new Error(`${language}: una plantilla del lote no se ejecuta correctamente. El catálogo activo se conserva.`);
      for (const [index, entry] of batch.entries()) {
        const actual = initial.actual[index];
        if (!Array.isArray(actual) || actual.length !== entry.variant.tests.length) throw new Error(`${entry.slug}: plantilla sin resultados JSON válidos.`);
        if (isDeepStrictEqual(actual, entry.variant.tests.map(test => test.expected))) throw new Error(`${entry.slug} (${language}): la plantilla ya resuelve todos sus casos.`);
      }
      console.log(`Funciones validadas en ${language}: ${Math.min(offset + 6, functions.length)}/${functions.length}.`);
    }
    for (const entry of entries.filter(entry => entry.version.runtimeMode === "PROGRAM" && !entry.version.variants.some(variant => variant.project))) {
      const variant = entry.version.variants.find(v => v.language === language)!;
      let starterSolved = true;
      if (await checkConcept(language, variant.solution, entry.version.conceptRule)) throw new Error(`${entry.slug} (${language}): la referencia no satisface el concepto.`);
      // Los casos de salida fija repetidos verifican el mismo comportamiento.
      const cases = [...new Map(variant.tests.map(test => [JSON.stringify([test.input, test.expected]), test])).values()];
      for (const test of cases) {
        const fixture = { input: test.input as Json, expected: test.expected as Json, visible: true, order: test.order };
        const result = judgeProgram(await runCode(language, runtimes[language], variant.solution, fixture.input, "PROGRAM", variant.typeContract), fixture);
        if (!result.passed) throw new Error(`${entry.slug} (${language}): referencia inválida (${result.status}). El catálogo activo se conserva.`);
        const initial = judgeProgram(await runCode(language, runtimes[language], variant.starter, fixture.input, "PROGRAM", variant.typeContract), fixture);
        if (["runtime", "timeout"].includes(initial.status) || initial.error) throw new Error(`${entry.slug} (${language}): plantilla inválida.`);
        starterSolved &&= initial.passed;
      }
      if (starterSolved && entry.version.conceptRule) starterSolved = !(await checkConcept(language, variant.starter, entry.version.conceptRule));
      if (starterSolved) throw new Error(`${entry.slug} (${language}): la plantilla ya resuelve todos sus casos.`);
      console.log(`Programa validado en ${language}: ${entry.slug}.`);
    }
  }
  await activateLogicCatalog(db, snapshot);
  console.log("Catálogo nuevo activado: 136 ejercicios y cuatro rutas de acceso libre. Historial conservado; progreso nuevo independiente por lenguaje.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => db.$disconnect());
