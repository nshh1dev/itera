import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { exercises } from "../prisma/content";
import { seedVersionContent, catalogRevisionDecision } from "../prisma/editorial-revision";
import { editorialSchema } from "../src/lib/editorial";
import { prerequisiteIssue } from "../src/lib/curriculum";
import type { Json } from "../src/lib/types";

// Importación explícita y conservadora. Nunca publica, modifica una versión
// existente ni sobrepasa un borrador distinto. El administrador valida en Piston.
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes("--apply");
const json = (value: Json) => value === null ? Prisma.JsonNull : value;

async function main() {
  if (process.argv.slice(2).some(arg => arg !== "--apply")) throw new Error("Uso: npm run content:revisions -- [--apply]");
  const entries = await db.exercise.findMany({ where: { published: true, versions: { some: { published: true } } }, select: { slug: true, order: true } });
  let created = 0, unchanged = 0, conflicts = 0;
  for (const source of exercises) {
    const content = seedVersionContent(source);
    const variants = Object.fromEntries(content.variants.map(variant => [variant.language, variant]));
    const validated = editorialSchema.safeParse({ ...source, ...content, ...variants, tests: content.variants[0].tests });
    if (!validated.success) throw new Error(`${source.slug}: ${validated.error.message}`);
    const issue = prerequisiteIssue(source.slug, content.prerequisiteSlugs, entries);
    if (issue) throw new Error(`${source.slug}: ${issue}`);
    await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
      const exercise = await tx.exercise.findUnique({ where: { slug: source.slug }, include: { versions: { orderBy: { number: "desc" }, take: 1, include: { variants: { include: { tests: true } } } } } });
      const current = exercise?.versions[0];
      if (!exercise || !current) throw new Error(`Falta ${source.slug}. Ejecuta primero npm run db:seed.`);
      const decision = catalogRevisionDecision(current, content, current.id);
      if (decision === "unchanged") { unchanged++; return; }
      if (decision !== "create") { console.log(`${source.slug}: se conserva el borrador editorial existente.`); conflicts++; return; }
      console.log(`${source.slug}: ${apply ? "creando" : "se prepararía"} borrador v${current.number + 1} con tres lenguajes.`);
      if (!apply) return;
      const { variants: sourceVariants, ...version } = content;
      await tx.exerciseVersion.create({ data: {
        ...version, exerciseId: exercise.id, number: current.number + 1, published: false,
        variants: { create: sourceVariants.map(variant => ({
          language: variant.language, statement: variant.statement ?? "", typeContract: variant.typeContract ?? "", starter: variant.starter, solution: variant.solution, explanation: variant.explanation,
          tests: { create: variant.tests.map(test => ({ order: test.order, visible: test.visible, explanation: test.explanation ?? "", input: json(test.input as Json), expected: json(test.expected as Json) })) },
        })) },
      } });
      created++;
    }, { timeout: 15000 });
  }
  console.log(`${apply ? `${created} borradores creados` : "Vista previa, sin escrituras"}; ${unchanged} sin cambios; ${conflicts} borradores ajenos conservados. No se ha publicado contenido ni modificado progreso.`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : "No se pudieron preparar las revisiones."); process.exitCode = 1; }).finally(() => db.$disconnect());
