import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { learningPaths } from "../src/lib/learning-paths";

// Actualización explícita de las dos rutas editoriales con secuencia definida.
// No toca ejercicios, versiones, borradores, envíos, progreso ni rutas personalizadas.
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes("--apply");

async function main() {
  if (process.argv.slice(2).some(arg => arg !== "--apply")) throw new Error("Uso: npm run content:paths -- [--apply]");
  await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
    for (const definition of learningPaths.filter(path => path.slugs)) {
      const slugs = definition.slugs!;
      const entries = await tx.exercise.findMany({ where: { slug: { in: slugs }, published: true, versions: { some: { published: true } } }, select: { id: true, slug: true } });
      const missing = slugs.filter(slug => !entries.some(entry => entry.slug === slug));
      if (missing.length) throw new Error(`Falta contenido publicado: ${missing.join(", ")}. Ejecuta primero npm run db:seed.`);
      const existing = await tx.learningPath.findUnique({ where: { slug: definition.slug }, include: { items: { orderBy: { position: "asc" }, include: { exercise: { select: { slug: true } } } } } });
      console.log(`${definition.title}: ${existing?.items.length ?? 0} → ${slugs.length} pasos`);
      console.log(`  ${slugs.join(" → ")}`);
      if (!apply) continue;
      const path = await tx.learningPath.upsert({
        where: { slug: definition.slug },
        create: { slug: definition.slug, title: definition.title, description: definition.description, order: definition.order },
        update: { title: definition.title, description: definition.description, order: definition.order },
      });
      await tx.learningPathItem.deleteMany({ where: { pathId: path.id } });
      await tx.learningPathItem.createMany({ data: slugs.map((slug, position) => ({ pathId: path.id, exerciseId: entries.find(entry => entry.slug === slug)!.id, position })) });
    }
  }, { timeout: 15000 });
  console.log(apply ? "Rutas actualizadas sin modificar el trabajo de los estudiantes." : "Vista previa: no se ha modificado nada. Añade --apply para actualizar las rutas.");
}

main().catch(error => { console.error(error instanceof Error ? error.message : "No se pudieron actualizar las rutas."); process.exitCode = 1; }).finally(() => db.$disconnect());
