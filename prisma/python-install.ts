import { Prisma, type PrismaClient } from "../src/generated/prisma/client";
import { catalogRevisionDecision } from "./editorial-revision";
import { pythonCatalog, validatePythonCatalog } from "./python-content";
import type { Json } from "../src/lib/types";
import { knownPythonReleases, pythonReleaseFingerprint } from "./python-releases";

const include = { versions: { orderBy: { number: "desc" as const }, include: { variants: { include: { tests: { orderBy: { order: "asc" as const } } } } } } };
const json = (value: unknown) => value === null ? Prisma.JsonNull : value as Exclude<Json, null>;
function data(entry: typeof pythonCatalog[number], number: number) {
  const { variants, ...content } = entry.content;
  return { ...content, number, published: false, variants: { create: variants.map(variant => ({
    language: "python", starter: variant.starter, solution: variant.solution, explanation: variant.explanation,
    statement: variant.statement ?? "", typeContract: "",
    ...(variant.project ? { project: variant.project, solutionFiles: variant.solutionFiles } : {}),
    tests: { create: variant.tests.map(test => ({ order: test.order, visible: test.visible, explanation: test.explanation ?? "", input: json(test.input), expected: json(test.expected), ...(test.expectedFiles ? { expectedFiles: test.expectedFiles } : {}), ...(test.expectedPersistence !== undefined ? { expectedPersistence: test.expectedPersistence } : {}) })) },
  })) } };
}
function onlyPython<T extends { variants: { language: string }[] }>(version: T): T {
  return { ...version, variants: version.variants.filter(variant => variant.language === "python") };
}

// La transacción completa se revierte ante contenido local distinto o borradores ajenos.
export async function preparePythonCatalog(db: PrismaClient) {
  validatePythonCatalog();
  return db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
    const published = await tx.exercise.findMany({ where: { slug: { in: pythonCatalog.map(entry => entry.slug) } }, include });
    const released = published.flatMap(exercise => {
      const version = exercise.versions.find(version => version.published && version.variants.some(variant => variant.language === "python"));
      return version ? [{ slug: exercise.slug, content: onlyPython(version) }] : [];
    });
    const knownRelease = knownPythonReleases.includes(pythonReleaseFingerprint(released));
    let created = 0;
    for (const [order, entry] of pythonCatalog.entries()) {
      const exercise = await tx.exercise.findUnique({ where: { slug: entry.slug }, include });
      if (!exercise) {
        await tx.exercise.create({ data: { slug: entry.slug, category: entry.category, order: 10000 + order, published: false, versions: { create: data(entry, 1) } } });
        created++;
        continue;
      }
      const current = exercise.versions.find(version => version.variants.some(variant => variant.language === "python"));
      const latest = exercise.versions[0];
      if (!current || !latest) throw new Error(`${entry.slug}: falta una versión Python; revisar manualmente.`);
      const snapshot = onlyPython(current);
      if (catalogRevisionDecision(snapshot, entry.content, current.id) === "unchanged") {
        if (latest.id !== current.id && !latest.published) throw new Error(`${entry.slug}: existe otro borrador pendiente.`);
        continue;
      }
      if (!latest.published || !current.published) throw new Error(`${entry.slug}: hay un borrador distinto. Se conserva sin sobrepasarlo.`);
      if (!knownRelease && (!entry.baseline || catalogRevisionDecision(snapshot, entry.baseline, current.id) !== "unchanged")) throw new Error(`${entry.slug}: la versión local difiere del catálogo de origen. No se sobrescribe.`);
      await tx.exerciseVersion.create({ data: { exerciseId: exercise.id, ...data(entry, latest.number + 1) } });
      created++;
    }
    return created;
  }, { timeout: 120000 });
}

export async function pythonSnapshot(db: PrismaClient) {
  const exercises = await db.exercise.findMany({ where: { slug: { in: pythonCatalog.map(entry => entry.slug) } }, include });
  return pythonCatalog.map(entry => {
    const exercise = exercises.find(exercise => exercise.slug === entry.slug);
    const version = exercise?.versions.find(version => version.variants.some(variant => variant.language === "python"));
    if (!exercise || !version || catalogRevisionDecision(onlyPython(version), entry.content, version.id) !== "unchanged") throw new Error(`${entry.slug}: la instantánea no coincide con las fuentes.`);
    return { slug: entry.slug, exerciseId: exercise.id, exercisePublished: exercise.published, version: onlyPython(version) };
  });
}

// No escribe variantes ajenas, rutas comunes, orden global, borradores ni progreso.
export async function activatePythonCatalog(db: PrismaClient, checked: Awaited<ReturnType<typeof pythonSnapshot>>) {
  await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
    const current = await pythonSnapshot(tx as PrismaClient);
    for (const entry of current) {
      const prior = checked.find(item => item.slug === entry.slug);
      if (!prior || prior.version.id !== entry.version.id) throw new Error(`${entry.slug}: cambió durante la validación.`);
      if (!entry.version.published) await tx.exerciseVersion.update({ where: { id: entry.version.id }, data: { published: true } });
      if (!entry.exercisePublished) await tx.exercise.update({ where: { id: entry.exerciseId }, data: { published: true } });
    }
  }, { timeout: 120000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
