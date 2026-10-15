import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { exercises } from "../prisma/content";

// Completa la guía de aprendizaje de las versiones publicadas anteriores a la
// ampliación del currículo. Solo rellena campos editoriales que quedaron vacíos
// (objetivo, conocimientos previos, objetivos de práctica, enlaces a ejercicios
// previos, coste y errores comunes) tomándolos del catálogo. No toca enunciados,
// pistas, referencias, pruebas, borradores, envíos, progreso ni versiones no
// publicadas.
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes("--apply");

async function main() {
  if (process.argv.slice(2).some(arg => arg !== "--apply")) throw new Error("Uso: npm run content:metadata -- [--apply]");
  const source = new Map(exercises.map(exercise => [exercise.slug, exercise]));
  let changed = 0;
  await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742903)`;
    const rows = await tx.exercise.findMany({
      where: { published: true },
      select: { slug: true, versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: { id: true, objective: true, prerequisites: true, practiceGoals: true, prerequisiteSlugs: true, complexity: true, commonErrors: true } } },
    });
    for (const row of rows) {
      const version = row.versions[0];
      const exercise = source.get(row.slug);
      if (!version || !exercise) continue;
      const data: { objective?: string; prerequisites?: string[]; practiceGoals?: string[]; prerequisiteSlugs?: string[]; complexity?: string; commonErrors?: string[] } = {};
      if (!version.objective.trim() && (exercise.objective ?? "").trim()) data.objective = exercise.objective!;
      if (!version.prerequisites.length && (exercise.prerequisites ?? []).length) data.prerequisites = exercise.prerequisites!;
      if (!version.practiceGoals.length && (exercise.practiceGoals ?? []).length) data.practiceGoals = exercise.practiceGoals!;
      if (!version.prerequisiteSlugs.length && (exercise.prerequisiteSlugs ?? []).length) data.prerequisiteSlugs = exercise.prerequisiteSlugs!;
      if (!version.complexity.trim() && (exercise.complexity ?? "").trim()) data.complexity = exercise.complexity!;
      if (!version.commonErrors.length && (exercise.commonErrors ?? []).length) data.commonErrors = exercise.commonErrors!;
      if (!Object.keys(data).length) continue;
      changed++;
      console.log(`${row.slug}: completa ${Object.keys(data).join(", ")}`);
      if (apply) await tx.exerciseVersion.update({ where: { id: version.id }, data });
    }
  }, { timeout: 30000 });
  console.log(apply ? `${changed} versiones completadas sin alterar otros campos.` : `Vista previa: ${changed} versiones por completar. Añade --apply para actualizar.`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : "No se pudieron completar los metadatos."); process.exitCode = 1; }).finally(() => db.$disconnect());
