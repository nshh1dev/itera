import "dotenv/config";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { learningPaths } from "../src/lib/learning-paths";
import { devProfiles, profileSlugs, assertDevelopmentDatabase, DevSeedError } from "./dev-users-data";

const manifestPath = ".local/dev-users.json";
const manifestSchema = z.strictObject({
  version: z.literal(1), database: z.string(), createdAt: z.iso.datetime(),
  accounts: z.array(z.strictObject({ key: z.string(), id: z.string(), email: z.email(), password: z.string().min(24).max(128) })).length(devProfiles.length),
});

async function main() {
  const identity = assertDevelopmentDatabase(process.env);
  if (!process.argv.includes("--apply")) throw new DevSeedError("Uso: npm run db:seed:users -- --apply. Requiere ITERA_DEV_USERS=1; no modifica el catálogo.");
  const database = createHash("sha256").update(identity).digest("hex");
  await mkdir(".local", { recursive: true });
  let manifest: z.infer<typeof manifestSchema>;
  let freshManifest = false;
  try {
    manifest = manifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw new DevSeedError("El archivo local de credenciales no es válido. No se sobrescribirá.");
    manifest = { version: 1, database, createdAt: new Date().toISOString(), accounts: devProfiles.map(profile => ({ key: profile.key, id: `itera-dev-v1-${profile.key}`, email: `${profile.key}@itera.example.test`, password: randomBytes(24).toString("base64url") })) };
    freshManifest = true;
  }
  if (manifest.database !== database || devProfiles.some(profile => !manifest.accounts.some(account => account.key === profile.key && account.id === `itera-dev-v1-${profile.key}` && account.email === `${profile.key}@itera.example.test`))) throw new DevSeedError("Las credenciales locales pertenecen a otro catálogo de cuentas o base de datos. No se modificó ninguna cuenta.");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const hashes = new Map(await Promise.all(manifest.accounts.map(async account => [account.key, await hashPassword(account.password)] as const)));
    const summary = await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('itera:dev-users:v1'))`;
      // Todas las colisiones se validan ANTES de crear cuentas; nunca adoptamos una cuenta ajena.
      const existing = await tx.user.findMany({ where: { OR: [{ id: { in: manifest.accounts.map(account => account.id) } }, { email: { in: manifest.accounts.map(account => account.email) } }] }, select: { id: true, email: true } });
      const markers = await tx.auditLog.findMany({ where: { id: { in: manifest.accounts.map(account => `${account.id}:seed`) }, action: "dev.seed.v1" }, select: { id: true, userId: true, resource: true } });
      for (const user of existing) {
        const owner = manifest.accounts.find(account => account.id === user.id);
        if (!owner || !markers.some(marker => marker.id === `${owner.id}:seed` && marker.userId === owner.id && marker.resource === owner.email)) throw new DevSeedError("Hay una cuenta que colisiona con los perfiles de prueba sin marca de propiedad. Operación cancelada.");
        if (manifest.accounts.some(account => account.email === user.email && account.id !== user.id)) throw new DevSeedError("Hay un correo de prueba ocupado por otra identidad. Operación cancelada.");
      }
      if (freshManifest && existing.length) throw new DevSeedError("Ya existen perfiles, pero falta su archivo original de credenciales. No se crearán claves que no corresponden a sus contraseñas. Usa la recuperación local de cuenta.");
      const exercises = await tx.exercise.findMany({ where: { published: true }, select: { id: true, slug: true, versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: { variants: { select: { id: true, language: true, starter: true, solution: true, tests: { orderBy: { order: "asc" }, select: { visible: true } } } } } } } });
      const catalog = new Map(exercises.filter(exercise => exercise.versions.length).map(exercise => [exercise.slug, exercise]));
      const paths = await tx.learningPath.findMany({ select: { slug: true, items: { select: { exerciseId: true } } } });
      for (const path of learningPaths) {
        const stored = paths.find(item => item.slug === path.slug);
        if (!stored || path.slugs?.some(slug => !catalog.has(slug) || !stored.items.some(item => item.exerciseId === catalog.get(slug)?.id))) throw new DevSeedError("Falta el currículo publicado y sus rutas. Prepara Piston y ejecuta content:replace -- --apply antes del seed de usuarios.");
      }
      // Escritura exclusiva antes de insertar: un fallo permite repetir sin perder las claves.
      if (freshManifest) await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", { flag: "wx", mode: 0o600 });
      const anchor = new Date(manifest.createdAt).getTime();
      let created = 0;
      for (const profile of devProfiles) {
        const account = manifest.accounts.find(item => item.key === profile.key)!;
        if (existing.some(user => user.id === account.id)) continue;
        const latest = anchor - (profile.inactive ? 90 : profile.disabled ? 10 : 0) * 86400_000 - 1800_000;
        await tx.user.create({ data: { id: account.id, email: account.email, name: profile.name, role: profile.admin ? "ADMIN" : "USER", disabledAt: profile.disabled ? new Date(anchor - 86400_000) : null, createdAt: new Date(anchor - 120 * 86400_000), preference: { create: { language: profile.languages[0], level: profile.level } }, accounts: { create: { id: `${account.id}:credential`, providerId: "credential", accountId: account.id, password: hashes.get(account.key) } } } });
        for (const language of profile.languages) {
          const solved = profileSlugs(profile, language);
          const pending = profile.key === "nuevo" ? [] : learningPaths.flatMap(path => path.slugs ?? []).filter(slug => !solved.includes(slug)).slice(0, 2);
          const selected = [...solved, ...pending];
          for (const [index, slug] of selected.entries()) {
            const exercise = catalog.get(slug)!;
            const variant = exercise.versions[0].variants.find(item => item.language === language);
            if (!variant || !variant.tests.length) throw new DevSeedError("Falta una variante publicada con pruebas para los perfiles.");
            const solvedHere = solved.includes(slug);
            const startedAt = new Date(latest - (selected.length - index) * 3600_000);
            const finishedAt = new Date(startedAt.getTime() + 240_000);
            // El código incorrecto falla deliberadamente en todos los casos, también en PROGRAM.
            const wrongCode = language === "python" ? 'raise RuntimeError("Intento ficticio de desarrollo")' : 'throw new Error("Intento ficticio de desarrollo");';
            const attempts = solvedHere ? ["failed", "examples", "passed"] as const : ["failed"] as const;
            for (const [attempt, outcome] of attempts.entries()) {
              const tests = outcome === "examples" ? variant.tests.filter(test => test.visible) : variant.tests;
              if (!tests.length) continue;
              const passed = outcome !== "failed";
              const at = new Date(startedAt.getTime() + attempt * 60_000);
              const results: Prisma.InputJsonArray = tests.map((test, testIndex) => ({ index: testIndex, visible: test.visible, passed, status: passed ? "passed" : "runtime" }));
              await tx.submission.create({ data: { id: `${account.id}:${variant.id}:${outcome}`, userId: account.id, variantId: variant.id, code: passed ? variant.solution : wrongCode, mode: outcome === "examples" ? "examples" : "submit", status: passed ? "PASSED" : "FAILED", idempotencyKey: `dev-v1:${variant.id}:${outcome}`, passedCount: passed ? tests.length : 0, totalCount: tests.length, results, message: "Historial sintético de desarrollo; no ejecutado en Piston.", createdAt: at, finishedAt: outcome === "passed" ? finishedAt : new Date(at.getTime() + 1000) } });
            }
            await tx.progress.create({ data: { userId: account.id, exerciseId: exercise.id, language, attempts: solvedHere ? 2 : 1, firstPassedAt: solvedHere ? finishedAt : null, lastAttemptAt: solvedHere ? finishedAt : new Date(startedAt.getTime() + 1000) } });
            if (!solvedHere) await tx.draft.create({ data: { userId: account.id, variantId: variant.id, code: variant.starter, revision: 1, updatedAt: new Date(latest - 60_000) } });
            await tx.practiceContext.create({ data: { userId: account.id, exerciseId: exercise.id, language, pathSlug: learningPaths.find(path => path.slugs?.includes(slug))?.slug, visitedAt: solvedHere ? startedAt : new Date(latest) } });
          }
        }
        await tx.auditLog.create({ data: { id: `${account.id}:seed`, userId: account.id, action: "dev.seed.v1", resource: account.email } });
        created++;
      }
      return { created, preserved: devProfiles.length - created };
    }, { timeout: 60_000 });
    console.log(`Perfiles creados: ${summary.created}. Perfiles conservados sin cambios: ${summary.preserved}.`);
    console.log(`Credenciales únicamente en ${manifestPath} (archivo local excluido de Git). No se han mostrado contraseñas.`);
  } finally { await db.$disconnect(); }
}

main().catch(error => { console.error(error instanceof DevSeedError ? error.message : "No se pudo preparar el seed de desarrollo. Revisa PostgreSQL, las migraciones y los permisos del archivo local; no se muestran detalles que puedan contener credenciales."); process.exitCode = 1; });
