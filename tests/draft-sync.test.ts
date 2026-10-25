import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { draftSaveFeedback, temporaryDraftFailure, type DraftSaveResult } from "../src/lib/draft-sync";

test("el autoguardado reintenta fallos temporales con espera creciente y un máximo de 30 segundos", () => {
  let delay = 900;
  for (const expected of [1800, 3600, 7200, 14400, 28800, 30000, 30000]) {
    const feedback = draftSaveFeedback(temporaryDraftFailure, delay);
    assert.equal(feedback.blocked, false);
    assert.equal(feedback.delay, expected);
    assert.match(feedback.error, /automáticamente/);
    delay = feedback.delay;
  }
});

test("una recuperación limpia el error de sincronización y restablece el intervalo habitual", () => {
  const failed = draftSaveFeedback(temporaryDraftFailure, 900);
  assert.deepEqual(draftSaveFeedback({ revision: 2 }, failed.delay), { blocked: false, delay: 900, error: "" });
});

test("los conflictos, la sesión caducada y los datos no disponibles o inválidos suspenden el reintento", () => {
  for (const kind of ["conflict", "auth", "unavailable", "invalid"] as const) {
    const failure: DraftSaveResult = { kind, error: `Mensaje de ${kind}` };
    assert.deepEqual(draftSaveFeedback(failure, 1800), { blocked: true, delay: 1800, error: failure.error });
  }
});

test("guardar borradores distingue errores de infraestructura sin perder la concurrencia optimista", async t => {
  const owner = { id: "cuenta-propia" };
  let user: typeof owner | null = owner;
  let stage: "auth" | "variant" | "create" | "update" | null = null;
  let available = true;
  let writes = 0;
  let draft: { code: string; revision: number } | null = null;
  function fail(at: typeof stage) {
    if (stage === at) throw new Error("detalle privado de la conexión");
  }
  const state = {
    currentUser: async () => { fail("auth"); return user; },
    db: {
      exerciseVariant: { findFirst: async () => { fail("variant"); return available ? { id: "variante" } : null; } },
      draft: {
        create: async ({ data }: { data: { userId: string; variantId: string; code: string } }) => {
          assert.equal(data.userId, owner.id);
          assert.equal(data.variantId, "variante");
          fail("create");
          if (draft) throw Object.assign(new Error("colisión privada"), { code: "P2002" });
          writes++;
          draft = { code: data.code, revision: 1 };
          return draft;
        },
        updateMany: async ({ where, data }: { where: { userId: string; variantId: string; revision: number }; data: { code: string; revision: { increment: number } } }) => {
          assert.equal(where.userId, owner.id);
          assert.equal(where.variantId, "variante");
          assert.equal(data.revision.increment, 1);
          fail("update");
          if (!draft || draft.revision !== where.revision) return { count: 0 };
          writes++;
          draft = { code: data.code, revision: draft.revision + 1 };
          return { count: 1 };
        },
      },
    },
  };
  const key = Symbol.for("itera:test:draft-sync");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = state;
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL?.replaceAll("\\", "/").endsWith("/src/server/actions.ts")) {
        const replacements: Record<string, string> = { "./auth": "auth", "./db": "db", "next/cache": "cache" };
        if (replacements[specifier]) return { url: `itera-draft-test:${replacements[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-draft-test:")) return next(url, context);
      const sources: Record<string, string> = {
        auth: "export const {currentUser} = state; export const requireUser = currentUser;",
        db: "export const {db} = state;",
        cache: "export function revalidatePath() { throw new Error('revalidación inesperada'); }",
      };
      return { format: "module", source: 'const state = globalThis[Symbol.for("itera:test:draft-sync")];' + sources[url.split(":")[1]], shortCircuit: true };
    },
  });
  try {
    const { saveDraft } = await import("../src/server/actions");
    const save = (code: string, revision: number) => saveDraft({ variantId: "variante", code, revision, userId: "cuenta-ajena" });

    await t.test("fallos al leer sesión o disponibilidad se devuelven como temporales sin filtrar detalles", async () => {
      for (const failure of ["auth", "variant"] as const) {
        stage = failure;
        assert.deepEqual(await save("local", 0), temporaryDraftFailure);
      }
      assert.equal(writes, 0);
      stage = null;
    });

    await t.test("un fallo al crear permite reintentar la misma revisión tras recuperar la conexión", async () => {
      stage = "create";
      assert.deepEqual(await save("primera copia", 0), temporaryDraftFailure);
      assert.equal(writes, 0);
      stage = null;
      assert.deepEqual(await save("primera copia", 0), { revision: 1 });
      assert.equal(writes, 1);
    });

    await t.test("un fallo al actualizar no cambia el borrador y la siguiente petición se guarda", async () => {
      stage = "update";
      assert.deepEqual(await save("edición pendiente", 1), temporaryDraftFailure);
      assert.deepEqual(draft, { code: "primera copia", revision: 1 });
      stage = null;
      assert.deepEqual(await save("edición pendiente", 1), { revision: 2 });
      assert.deepEqual(draft, { code: "edición pendiente", revision: 2 });
      assert.equal(writes, 2);
    });

    await t.test("una revisión obsoleta y una creación duplicada siguen siendo conflictos", async () => {
      for (const revision of [0, 1]) {
        const result = await save("no sobrescribir", revision);
        assert.equal("kind" in result && result.kind, "conflict");
        assert.equal(draftSaveFeedback(result, 900).blocked, true);
        assert.equal(JSON.stringify(result).includes("edición pendiente"), false);
      }
      assert.deepEqual(draft, { code: "edición pendiente", revision: 2 });
      assert.equal(writes, 2);
    });

    await t.test("un ejercicio retirado, una sesión caducada y una entrada inválida no se reintentan", async () => {
      available = false;
      const unavailable = await save("local", 2);
      assert.equal("kind" in unavailable && unavailable.kind, "unavailable");
      available = true;
      user = null;
      const auth = await save("local", 2);
      assert.equal("kind" in auth && auth.kind, "auth");
      user = owner;
      const invalid = await save("local", -1);
      assert.equal("kind" in invalid && invalid.kind, "invalid");
      for (const result of [unavailable, auth, invalid]) assert.equal(draftSaveFeedback(result, 900).blocked, true);
      assert.equal(writes, 2);
    });
  } finally {
    hooks.deregister();
    delete globals[key];
  }
});
