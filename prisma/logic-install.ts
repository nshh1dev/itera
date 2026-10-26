import { Prisma, type PrismaClient } from "../src/generated/prisma/client";
import { logicExercises } from "./logic-content";
import { exercises as historicalExercises } from "./content";
import { catalogRevisionDecision, seedVersionContent } from "./editorial-revision";
import { learningPaths } from "../src/lib/learning-paths";
import { editorialSchema, publicationMetadataSchema } from "../src/lib/editorial";
import { prerequisiteIssue } from "../src/lib/curriculum";
import type { Json } from "../src/lib/types";

const json = (value: unknown) => value === null ? Prisma.JsonNull : value as Exclude<Json, null>;
const include = { versions: { orderBy: { number: "desc" as const }, take: 1, include: { variants: { include: { tests: true } } } } };

export function validateLogicCatalog() {
  const entries = logicExercises.map((exercise, order) => ({ slug: exercise.slug, order }));
  for (const exercise of logicExercises) {
    const content = seedVersionContent(exercise);
    const variants = Object.fromEntries(content.variants.map(variant => [variant.language, variant]));
    editorialSchema.parse({ ...exercise, ...content, ...variants, tests: content.variants[0].tests.map(test => ({ ...test, ...(test.expectedPersistence === Prisma.JsonNull ? { expectedPersistence: null } : {}) })) });
    publicationMetadataSchema.parse(content);
    const issue = prerequisiteIssue(exercise.slug, content.prerequisiteSlugs, entries);
    if (issue) throw new Error(`${exercise.slug}: ${issue}`);
  }
}

function versionData(source: typeof logicExercises[number], number: number) {
  const { variants, ...content } = seedVersionContent(source);
  return { ...content, number, published: false, variants: { create: variants.map(variant => ({
    language: variant.language, starter: variant.starter, solution: variant.solution, explanation: variant.explanation,
    statement: variant.statement ?? "", typeContract: variant.typeContract ?? "",
    ...(variant.project ? { project: variant.project as Prisma.InputJsonValue } : {}),
    ...(variant.solutionFiles ? { solutionFiles: variant.solutionFiles as Prisma.InputJsonValue } : {}),
     tests: { create: variant.tests.map(test => ({ order: test.order, visible: test.visible, explanation: test.explanation ?? "", input: json(test.input), expected: json(test.expected), ...(test.expectedFiles ? { expectedFiles: test.expectedFiles as Prisma.InputJsonValue } : {}), ...(test.expectedPersistence !== undefined ? { expectedPersistence: test.expectedPersistence } : {}) })) },
  })) } };
}

// Todo o nada: un borrador ajeno distinto impide preparar el lote completo.
// Ningún registro de estudiantes se modifica y ningún ejercicio se publica aquí.
export async function prepareLogicCatalog(db: PrismaClient) {
  validateLogicCatalog();
  return db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
    let created = 0;
    for (const [order, source] of logicExercises.entries()) {
      const existing = await tx.exercise.findUnique({ where: { slug: source.slug }, include });
      const current = existing?.versions[0];
      if (current) {
        const decision = catalogRevisionDecision(current, seedVersionContent(source), current.id);
        if (decision === "unchanged") continue;
        if (decision !== "create") throw new Error(`${source.slug}: hay un borrador distinto. Se conserva sin sobrepasarlo.`);
        await tx.exerciseVersion.create({ data: { exerciseId: existing!.id, ...versionData(source, current.number + 1) } });
      } else {
        if (existing) throw new Error(`${source.slug}: identidad existente sin versión; revísala antes de continuar.`);
        await tx.exercise.create({ data: { slug: source.slug, category: source.category, order, published: false, versions: { create: versionData(source, 1) } } });
      }
      created++;
    }
    return created;
  }, { timeout: 60000 });
}

export async function logicSnapshot(db: PrismaClient) {
  const snapshot = await db.exercise.findMany({ where: { slug: { in: logicExercises.map(e => e.slug) } }, include });
  for (const source of logicExercises) {
    const current = snapshot.find(e => e.slug === source.slug)?.versions[0];
    if (!current || catalogRevisionDecision(current, seedVersionContent(source), current.id) !== "unchanged") {
      throw new Error(`${source.slug}: el contenido preparado no coincide con las fuentes. No se sustituirá el catálogo.`);
    }
  }
  return snapshot;
}

// Solo se llama tras validar las referencias y plantillas de la instantánea en Piston.
// La relectura serializable impide activar otra revisión si cambió durante la validación.
export async function activateLogicCatalog(db: PrismaClient, validated: Awaited<ReturnType<typeof logicSnapshot>>) {
  await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
    for (const [order, source] of logicExercises.entries()) {
      const exercise = await tx.exercise.findUnique({ where: { slug: source.slug }, include });
      const version = exercise?.versions[0];
      const checked = validated.find(e => e.slug === source.slug)?.versions[0];
      if (!exercise || !version || !checked || version.id !== checked.id || catalogRevisionDecision(version, seedVersionContent(source), version.id) !== "unchanged") {
        throw new Error(`${source.slug}: cambió durante la validación. No se ha sustituido el catálogo.`);
      }
      await tx.exerciseVersion.update({ where: { id: version.id }, data: { published: true } });
      await tx.exercise.update({ where: { id: exercise.id }, data: { published: true, order, category: source.category } });
    }
    // Solo se retiran identidades editoriales conocidas; el contenido personalizado se conserva.
    await tx.exercise.updateMany({ where: { slug: { in: historicalExercises.map(e => e.slug) } }, data: { published: false } });
    for (const definition of learningPaths) {
      const path = await tx.learningPath.upsert({ where: { slug: definition.slug },
        create: { slug: definition.slug, title: definition.title, description: definition.description, order: definition.order },
        update: { title: definition.title, description: definition.description, order: definition.order },
      });
      await tx.learningPathItem.deleteMany({ where: { pathId: path.id } });
      await tx.learningPathItem.createMany({ data: definition.slugs!.map((slug, position) => ({ pathId: path.id, exerciseId: validated.find(e => e.slug === slug)!.id, position })) });
    }
  }, { timeout: 60000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
