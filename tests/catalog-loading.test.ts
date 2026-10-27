import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { languages, type Language } from "../src/lib/types";

test("Inicio comparte metadatos sin compartir actividad o progreso entre lenguajes y cuentas", async t => {
  let catalogReads = 0;
  let activityReads: Language[] = [];
  let pythonRevision = false;
  const reset = () => { catalogReads = 0; activityReads = []; };
  const date = (day: number) => new Date(`2026-10-${day}T00:00:00.000Z`);
  const version = { title: "Título publicado", description: "Descripción", level: "INITIATION", minutes: 5, runtimeMode: "FUNCTION", practiceGoals: ["Practicar"], activityType: "PRACTICE", variants: languages.map(language => ({ language })) };
  const path = { slug: "desde-cero", title: "Desde cero", items: [{ exerciseId: "saludo" }, { exerciseId: "signo" }] };
  const key = Symbol.for("itera:test:catalog-loading");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = { db: {
    exercise: { findMany: async (query: {
      where: unknown; orderBy: unknown;
      select: { versions: { where: unknown; orderBy: unknown; take: number }; progress: { where: { userId: string; language: { in: string[] } } } };
    }) => {
      catalogReads++;
      assert.deepEqual(query.where, { published: true, versions: { some: { published: true } } });
      assert.deepEqual(query.orderBy, { order: "asc" });
      assert.deepEqual(query.select.versions.where, { published: true });
      assert.deepEqual(query.select.versions.orderBy, { number: "desc" });
      assert.equal(query.select.versions.take, undefined); // Puede haber revisiones publicadas exclusivas de un lenguaje.
      assert.deepEqual(query.select.progress.where.language.in, languages);
      const own = query.select.progress.where.userId === "cuenta";
      return [
        { id: "personalizado", slug: "personalizado", category: "Fundamentos", order: 0, versions: [version], progress: [] },
        { id: "signo", slug: "logica-signo", category: "Fundamentos", order: 1, versions: [version], progress: own ? [{ language: "typescript", firstPassedAt: null, attempts: 1 }] : [] },
        { id: "saludo", slug: "logica-saludo", category: "Fundamentos", order: 2, versions: [...(pythonRevision ? [{ ...version, title: "Revisión Python", variants: [{ language: "python" }] }] : []), version], progress: own ? [{ language: "python", firstPassedAt: date(20), attempts: 1 }] : [] },
        { id: "sin-version", slug: "sin-version", category: "Fundamentos", order: 3, versions: [], progress: [] },
      ];
    } },
    exerciseVariant: { findMany: async (query: {
      where: { language: Language; version: unknown; OR: unknown };
      select: { drafts: { where: { userId: string } }; submissions: { where: { userId: string; diagnosticItemId: null }; take: number; orderBy: unknown } };
    }) => {
      const { language } = query.where;
      activityReads.push(language);
      const userId = query.select.drafts.where.userId;
      assert.deepEqual(query.where.version, { exercise: { published: true } });
      assert.deepEqual(query.where.OR, [{ drafts: { some: { userId } } }, { submissions: { some: { userId, diagnosticItemId: null } } }]);
      assert.deepEqual(query.select.submissions.where, { userId, diagnosticItemId: null });
      assert.equal(query.select.submissions.take, 1);
      if (userId !== "cuenta") return [];
      return language === "python" ? [{ version: { exerciseId: "saludo" }, drafts: [], submissions: [{ createdAt: date(21) }] }]
        : language === "javascript" ? [
          { version: { exerciseId: "signo" }, drafts: [{ updatedAt: date(22) }], submissions: [] },
          // Una versión anterior puede contener actividad más reciente que la publicada.
          { version: { exerciseId: "signo" }, drafts: [], submissions: [{ createdAt: date(25) }] },
        ] : [];
    } },
    practiceContext: { findMany: async () => [] },
    learningPath: { findMany: async () => [path] },
  }, getLearningSummary: async () => ({ path: { slug: "desde-cero" } }) };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (/\/src\/server\/(catalog|practice-navigation)\.ts$/.test(decodeURI(context.parentURL ?? "").replaceAll("\\", "/"))) {
        const target = specifier === "server-only" ? "empty" : specifier === "./db" ? "db" : specifier === "./learning" ? "learning" : null;
        if (target) return { url: `itera-catalog-loading:${target}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-catalog-loading:")) return next(url, context);
      const name = url.endsWith(":db") ? "db" : "getLearningSummary";
      return { format: "module", source: url.endsWith(":empty") ? "" : `export const {${name}} = globalThis[Symbol.for("itera:test:catalog-loading")];`, shortCircuit: true };
    },
  });
  try {
    const { getPracticeNavigation } = await import("../src/server/practice-navigation");
    const { getCatalog } = await import("../src/server/catalog");
    await t.test("Inicio lee una vez el catálogo común y una actividad por lenguaje", async () => {
      reset();
      const result = await getPracticeNavigation("cuenta", "javascript");
      assert.equal(catalogReads, 1);
      assert.deepEqual(activityReads, languages);
      assert.equal(result.recommendation?.exercise.id, "signo");
      assert.equal(result.recommendation?.resume, true);
      assert.equal(result.language, "javascript");
    });
    await t.test("cada lenguaje conserva sus completados, intentos y fecha máxima entre versiones", async () => {
      const python = await getCatalog("cuenta", "python");
      const javascript = await getCatalog("cuenta", "javascript");
      const typescript = await getCatalog("cuenta", "typescript");
      assert.deepEqual(python.map(entry => entry.id), ["saludo", "signo", "personalizado"]);
      assert.deepEqual(python.map(entry => entry.order), [0, 1, 2]);
      assert.equal(python[0].solved, true); assert.equal(python[0].started, true);
      assert.equal(javascript[0].solved, false); assert.equal(javascript[0].started, false); assert.equal(javascript[0].solvedOther, true);
      assert.equal(javascript[1].lastActivityAt, date(25).toISOString());
      assert.equal(typescript[1].started, true); assert.equal(typescript[1].solved, false); assert.equal(typescript[1].lastActivityAt, undefined);
      assert.equal(python[1].started, false); assert.equal(python[1].lastActivityAt, undefined);
    });
    await t.test("la carga de un catálogo individual no consulta la actividad de otros lenguajes", async () => {
      reset(); await getCatalog("cuenta", "typescript");
      assert.equal(catalogReads, 1); assert.deepEqual(activityReads, ["typescript"]);
    });
    await t.test("la carga compartida devuelve el mismo catálogo que la individual en cada lenguaje", async () => {
      for (const language of languages) {
        const result = await getPracticeNavigation("cuenta", language);
        assert.deepEqual(result.catalog, await getCatalog("cuenta", language));
      }
    });
    await t.test("otra cuenta no hereda progreso ni fechas de una lectura anterior", async () => {
      const result = await getPracticeNavigation("otra", "javascript");
      for (const entry of result.catalog) {
        assert.equal(entry.solved, false); assert.equal(entry.started, false); assert.equal(entry.solvedOther, false); assert.equal(entry.lastActivityAt, undefined);
      }
      assert.equal(result.recommendation?.exercise.id, "saludo");
      assert.equal(result.recommendation?.resume, false);
    });
    await t.test("un invitado lee una vez metadatos y no consulta borradores ni envíos", async () => {
      reset(); const result = await getPracticeNavigation(undefined, "python");
      assert.equal(catalogReads, 1); assert.deepEqual(activityReads, []);
      assert.equal(result.catalog.some(entry => entry.started || entry.solved), false);
    });
    await t.test("una revisión Python no oculta ni cambia los metadatos publicados de otros lenguajes", async () => {
      pythonRevision = true;
      assert.equal((await getCatalog("cuenta", "python"))[0].title, "Revisión Python");
      for (const language of ["javascript", "typescript"] as const) {
        const catalog = await getCatalog("cuenta", language);
        assert.equal(catalog[0].title, "Título publicado");
        assert.equal("variants" in catalog[0], false);
      }
    });
  } finally { hooks.deregister(); delete globals[key]; }
});
