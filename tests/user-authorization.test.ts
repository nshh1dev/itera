import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

test("intentos y borradores usan la identidad de sesión, nunca la enviada por el cliente", async t => {
  let user: { id: string } | null = { id: "cuenta-b" };
  let calls = 0;
  let projectHistory = false;
  const project = { version: 1, entrypoint: "main.js", files: [{ path: "main.js", content: "plantilla" }, { path: "reglas.js", content: "auxiliar" }] };
  const submittedFiles = project.files.map(file => ({ ...file, content: `privado de A: ${file.path}` }));
  const updates: { userId: string; variantId: string; revision: number }[] = [];
  const drafts = [{ userId: "cuenta-a", variantId: "variante", code: "privado de A", revision: 3 }];
  const state = {
    currentUser: async () => user,
    requireUser: async () => { if (!user) throw new Error("sin sesión"); return user; },
    expireInterruptedSubmissions: async () => { calls++; },
    db: {
      exerciseVariant: { findFirst: async () => { calls++; return { id: "variante" }; } },
      draft: {
        create: async ({ data }: { data: { userId: string; variantId: string; code: string } }) => {
          calls++;
          assert.equal(data.userId, user?.id);
          if (drafts.some(draft => draft.userId === data.userId && draft.variantId === data.variantId)) throw new Error("duplicado");
          const draft = { ...data, revision: 1 };
          drafts.push(draft);
          return draft;
        },
        updateMany: async ({ where, data }: { where: { userId: string; variantId: string; revision: number }; data: { code: string; revision: { increment: number } } }) => {
          calls++;
          updates.push(where);
          assert.equal(data.revision.increment, 1);
          const draft = drafts.find(draft => draft.userId === where.userId && draft.variantId === where.variantId && draft.revision === where.revision);
          if (!draft) return { count: 0 };
          draft.code = data.code;
          draft.revision++;
          return { count: 1 };
        },
      },
      submission: {
        findFirst: async ({ where, select }: { where: { id: string; userId: string }; select: Record<string, boolean> }) => {
          calls++;
          assert.equal(where.userId, user?.id);
          assert.deepEqual(Object.keys(select).sort(), ["id", "status", "mode", "passedCount", "totalCount", "results", "message"].sort());
          return where.id === "intento-a" && where.userId === "cuenta-a"
            ? { id: "intento-a", status: "COMPLETED", mode: "submit", passedCount: 1, totalCount: 1, results: null, message: null }
            : null;
        },
        findMany: async ({ where, select, skip, take }: { where: { userId: string; diagnosticItemId: null; variant: unknown }; select: Record<string, unknown>; skip: number; take: number }) => {
          calls++;
          assert.equal(where.userId, user?.id);
          assert.equal(where.diagnosticItemId, null);
          assert.deepEqual(where.variant, { language: "javascript", version: { exerciseId: "ejercicio", exercise: { published: true } } });
          assert.equal(skip, 10);
          assert.equal(take, 11);
          assert.deepEqual(Object.keys(select).sort(), ["id", "code", "files", "status", "mode", "passedCount", "totalCount", "createdAt", "variant"].sort());
          return where.userId === "cuenta-a" ? [{ id: "intento-a", code: projectHistory ? "" : "privado de A", ...(projectHistory ? { files: submittedFiles } : {}), createdAt: new Date(0), variant: { version: { number: 1 }, ...(projectHistory ? { project } : {}) } }] : [];
        },
      },
    },
  };
  // Sustituir solo dependencias de frontera. Se importan los módulos reales sin
  // Next en marcha, Prisma conectado ni cambios para inyectar dobles en producción.
  const key = Symbol.for("itera:test:user-authorization");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = state;
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      const parent = context.parentURL?.replaceAll("\\", "/") ?? "";
      const target = parent.endsWith("/src/server/actions.ts") || parent.includes("/src/app/api/executions/");
      if (target) {
        const replacements: Record<string, string> = {
          "./auth": "auth", "@/server/auth": "auth", "./db": "db", "@/server/db": "db",
          "@/server/execution/service": "service", "next/cache": "cache",
        };
        if (replacements[specifier]) return { url: `itera-test:${replacements[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-test:")) return next(url, context);
      const prelude = 'const state = globalThis[Symbol.for("itera:test:user-authorization")];';
      const sources: Record<string, string> = {
        "itera-test:auth": "export const {currentUser, requireUser} = state;",
        "itera-test:db": "export const {db} = state;",
        "itera-test:service": "export const {expireInterruptedSubmissions} = state;",
        "itera-test:cache": "export function revalidatePath() { throw new Error('revalidación inesperada'); }",
      };
      return { format: "module", source: prelude + sources[url], shortCircuit: true };
    },
  });
  try {
    const { saveDraft, getExerciseAttempts } = await import("../src/server/actions");
    const { GET } = await import("../src/app/api/executions/[id]/route");
    const query = (id: string) => GET(new Request(`http://127.0.0.1:3000/api/executions/${id}`), { params: Promise.resolve({ id }) });

    await t.test("consultar un intento ajeno devuelve el mismo 404 que uno inexistente", async () => {
      const foreign = await query("intento-a");
      const missing = await query("inexistente");
      assert.equal(foreign.status, 404);
      assert.equal(missing.status, 404);
      assert.deepEqual(await foreign.json(), await missing.json());
      user = { id: "cuenta-a" };
      const own = await query("intento-a");
      assert.equal(own.status, 200);
      assert.equal(own.headers.get("Cache-Control"), "no-store");
      assert.deepEqual((await own.json()).results, []);
      user = { id: "cuenta-b" };
    });

    await t.test("el historial multarchivo conserva la instantánea propia sin exponer el manifiesto ni casos", async () => {
      projectHistory = true;
      const input = { exerciseId: "ejercicio", language: "javascript", page: 1, userId: "cuenta-a" };
      assert.deepEqual(await getExerciseAttempts(input), { entries: [], more: false });
      user = { id: "cuenta-a" };
      const own = await getExerciseAttempts(input);
      assert.deepEqual(own.entries[0].files, submittedFiles);
      assert.equal("project" in own.entries[0].variant, false);
      assert.equal("results" in own.entries[0], false);
      user = { id: "cuenta-b" };
      projectHistory = false;
    });

    await t.test("historial ignora un userId falsificado y no selecciona resultados de casos", async () => {
      const input = { exerciseId: "ejercicio", language: "javascript", page: 1, userId: "cuenta-a" };
      assert.deepEqual(await getExerciseAttempts(input), { entries: [], more: false });
      user = { id: "cuenta-a" };
      const own = await getExerciseAttempts(input);
      assert.equal(own.entries[0]?.code, "privado de A");
      assert.equal(own.entries[0]?.createdAt, new Date(0).toISOString());
      user = { id: "cuenta-b" };
    });

    await t.test("una revisión ajena no permite modificar ni obtener el borrador de otra cuenta", async () => {
      const result = await saveDraft({ userId: "cuenta-a", variantId: "variante", code: "intrusión", revision: 3 });
      assert.deepEqual(updates.at(-1), { userId: "cuenta-b", variantId: "variante", revision: 3 });
      assert.equal("kind" in result && result.kind, "conflict");
      assert.deepEqual(drafts, [{ userId: "cuenta-a", variantId: "variante", code: "privado de A", revision: 3 }]);
      assert.equal(JSON.stringify(result).includes("privado de A"), false);
    });

    await t.test("crear y actualizar usan la sesión y preservan la concurrencia optimista", async () => {
      const input = { userId: "cuenta-a", variantId: "variante", code: "propio de B", revision: 0 };
      assert.deepEqual(await saveDraft(input), { revision: 1 });
      assert.deepEqual(await saveDraft({ ...input, code: "edición B", revision: 1 }), { revision: 2 });
      const stale = await saveDraft({ ...input, code: "edición obsoleta", revision: 1 });
      assert.equal("kind" in stale && stale.kind, "conflict");
      assert.equal(drafts[0].code, "privado de A");
      assert.equal(drafts[1].userId, "cuenta-b");
      assert.equal(drafts[1].code, "edición B");
      assert.equal(drafts[1].revision, 2);
      assert.deepEqual(updates.slice(1), [
        { userId: "cuenta-b", variantId: "variante", revision: 1 },
        { userId: "cuenta-b", variantId: "variante", revision: 1 },
      ]);
    });

    await t.test("sin sesión o con entradas inválidas no se consulta ni escribe en la base", async () => {
      user = null;
      const before = calls;
      assert.equal((await query("intento-a")).status, 401);
      const draft = await saveDraft({ variantId: "variante", code: "intrusión", revision: 0 });
      assert.equal("kind" in draft && draft.kind, "auth");
      await assert.rejects(getExerciseAttempts({ exerciseId: "ejercicio", language: "javascript", page: 1 }), /sin sesión/);
      assert.equal(calls, before);
      user = { id: "cuenta-b" };
      assert.equal((await query("x".repeat(101))).status, 400);
      assert.deepEqual(await getExerciseAttempts({ exerciseId: "ejercicio", language: "javascript", page: -1 }), { error: "No pudimos identificar el historial.", entries: [], more: false });
      const invalid = await saveDraft({ variantId: "variante", code: "intrusión", revision: -1 });
      assert.equal("kind" in invalid && invalid.kind, "invalid");
      assert.equal(calls, before);
    });
  } finally {
    hooks.deregister();
    delete globals[key];
  }
});
