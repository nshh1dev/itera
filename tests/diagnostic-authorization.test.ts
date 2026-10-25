import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { NextResponse } from "next/server";

test("diagnósticos: lectura, borradores, finalización y ejecución respetan al propietario", async t => {
  let user: { id: string; onboardingStep: number } | null = { id: "cuenta-b", onboardingStep: 0 };
  let finishedAt: Date | null = null;
  let running = 0;
  let revision = 3;
  let code = "privado de A";
  let writes = 0;
  let runtimeCalls = 0;
  let itemChecks = 0;
  let closeDuringReservation = false;
  const scheduled: unknown[] = [];
  const queries: Record<string, unknown>[] = [];
  type ItemWhere = { id: string; variantId: string; diagnostic: { userId: string; finishedAt: null } };
  const db = {
    $executeRaw: async () => {},
    diagnostic: {
      findFirst: async ({ where, include }: { where: { id: string; userId: string }; include?: { items: { include: { variant?: { include: { tests: { where: unknown } } } } } } }) => {
        queries.push(where);
        assert.equal(where.userId, user?.id);
        if (include?.items.include.variant) assert.deepEqual(include.items.include.variant.include.tests.where, { visible: true });
        if (where.id !== "diagnostico-a" || where.userId !== "cuenta-a") return null;
        return { id: where.id, language: "javascript", declaredLevel: "BEGINNER", finishedAt, items: [{
          id: "item-a", variantId: "variante", code, revision, submissions: [],
          variant: { statement: "", version: { title: "Prueba", statement: "Prueba", runtimeMode: "FUNCTION" }, tests: [{ input: 1, expected: 1 }] },
        }] };
      },
      update: async ({ where }: { where: { id: string } }) => { assert.equal(where.id, "diagnostico-a"); writes++; finishedAt = new Date(); },
    },
    diagnosticItem: {
      updateMany: async ({ where, data }: { where: { id: string; revision: number; diagnostic: { userId: string; finishedAt: null } }; data: { code: string; revision: { increment: number } } }) => {
        queries.push(where);
        assert.equal(where.diagnostic.userId, user?.id);
        assert.equal(where.diagnostic.finishedAt, null);
        assert.equal(data.revision.increment, 1);
        if (where.id !== "item-a" || where.diagnostic.userId !== "cuenta-a" || finishedAt || where.revision !== revision) return { count: 0 };
        code = data.code; revision++; writes++;
        return { count: 1 };
      },
      findFirst: async ({ where }: { where: ItemWhere }) => {
        queries.push(where);
        itemChecks++;
        assert.equal(where.diagnostic.userId, user?.id);
        assert.equal(where.diagnostic.finishedAt, null);
        if (closeDuringReservation && itemChecks === 2) finishedAt = new Date();
        return where.id === "item-a" && where.variantId === "variante" && where.diagnostic.userId === "cuenta-a" && !finishedAt ? { id: "item-a" } : null;
      },
    },
    exerciseVariant: { findFirst: async () => ({ id: "variante", language: "javascript", tests: [{ visible: true }] }) },
    submission: {
      findUnique: async ({ where }: { where: { userId_idempotencyKey: { userId: string } } }) => {
        queries.push(where);
        assert.equal(where.userId_idempotencyKey.userId, user?.id);
        return null;
      },
      count: async () => running,
      create: async ({ data }: { data: { userId: string; diagnosticItemId: string; variantId: string } }) => {
        assert.equal(data.userId, "cuenta-a");
        assert.equal(data.diagnosticItemId, "item-a");
        assert.equal(data.variantId, "variante");
        writes++;
        return { id: "intento-propio" };
      },
    },
    user: { updateMany: async ({ where }: { where: { id: string } }) => { assert.equal(where.id, user?.id); writes++; } },
    learningProfile: { findUnique: async ({ where }: { where: { userId_language: { userId: string; language: string } } }) => {
      queries.push(where);
      assert.deepEqual(where.userId_language, { userId: user?.id, language: "javascript" });
      return null;
    } },
  };
  const key = Symbol.for("itera:test:diagnostic-authorization");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = {
    db: { ...db, $transaction: async <T>(run: (tx: typeof db) => Promise<T>): Promise<T> => run(db) }, NextResponse,
    currentUser: async () => user,
    requireUser: async () => { if (!user) throw new Error("sin sesión"); return user; },
    after: (callback: unknown) => { scheduled.push(callback); },
    availableRuntime: async () => { runtimeCalls++; },
  };
  // Solo dobles en fronteras: página, acciones y endpoint se importan del código
  // real. No se conecta Prisma, no se ejecuta código ni se inicia Next/Piston.
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      const parent = decodeURI(context.parentURL ?? "").replaceAll("\\", "/");
      const target = parent.endsWith("/src/server/learning-actions.ts") || parent.endsWith("/src/app/api/executions/route.ts") || parent.includes("/diagnostico/[id]/page.tsx");
      if (target) {
        const replacements: Record<string, string> = {
          "./auth": "auth", "@/server/auth": "auth", "./db": "db", "@/server/db": "db", "next/cache": "cache",
          "next/server": "server", "next/navigation": "navigation", "@/server/execution/piston": "piston",
          "@/server/execution/service": "service", "@/server/learning": "learning",
          "next/link": "components", "@/components/diagnostic-workspace": "components", "@/components/starting-point": "components", "@/components/ui/button": "components",
        };
        if (replacements[specifier]) return { url: `itera-diagnostic-test:${replacements[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-diagnostic-test:")) return next(url, context);
      const sources: Record<string, string> = {
        auth: "export const {currentUser, requireUser} = state;",
        db: "export const {db} = state;",
        cache: "export function revalidatePath() {}",
        server: "export const {NextResponse, after} = state;",
        navigation: "export function notFound() { throw new Error('no encontrado'); }",
        piston: "export const {availableRuntime} = state; export class RunnerUnavailable extends Error {}",
        service: "export async function expireInterruptedSubmissions() {} export async function evaluateSubmission() { throw new Error('evaluación inesperada'); }",
        learning: "export async function getLearningSummary() { return {}; }",
        components: "export default function Component() { return null; } export const DiagnosticWorkspace = Component, StartingPoint = Component, Button = Component;",
      };
      return { format: "module", source: 'const state = globalThis[Symbol.for("itera:test:diagnostic-authorization")];' + sources[url.split(":")[1]], shortCircuit: true };
    },
  });
  try {
    const { startDiagnostic, saveDiagnosticDraft, finishDiagnostic } = await import("../src/server/learning-actions");
    const { default: Page } = await import("../src/app/(platform)/diagnostico/[id]/page");
    const { POST } = await import("../src/app/api/executions/route");
    const read = (id: string) => Page({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });
    const execute = (changes: Record<string, unknown> = {}, origin = "http://127.0.0.1:3000") => POST(new Request("http://127.0.0.1:3000/api/executions", {
      method: "POST", headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: "variante", diagnosticItemId: "item-a", code: "function solve(data) { return data; }", mode: "submit", idempotencyKey: randomUUID(), userId: "cuenta-a", ...changes }),
    }));

    await t.test("lectura ajena e inexistente no revelan el diagnóstico; la propia solo pide casos visibles", async () => {
      await assert.rejects(read("diagnostico-a"), /no encontrado/);
      await assert.rejects(read("inexistente"), /no encontrado/);
      user = { id: "cuenta-a", onboardingStep: 0 };
      assert.ok(JSON.stringify(await read("diagnostico-a")).includes("privado de A"));
      user = { id: "cuenta-b", onboardingStep: 0 };
    });

    await t.test("borrador ajeno y userId falsificado no escriben ni devuelven código", async () => {
      const result = await saveDiagnosticDraft({ itemId: "item-a", code: "intrusión", revision: 3, userId: "cuenta-a" });
      assert.ok("error" in result);
      assert.equal(JSON.stringify(result).includes(code), false);
      assert.equal(writes, 0);
      assert.equal(revision, 3);
    });

    await t.test("el propietario guarda; revisión obsoleta o diagnóstico cerrado no lo sobrescriben", async () => {
      user = { id: "cuenta-a", onboardingStep: 0 };
      assert.deepEqual(await saveDiagnosticDraft({ itemId: "item-a", code: "edición propia", revision: 3, userId: "cuenta-b" }), { revision: 4 });
      assert.ok("error" in await saveDiagnosticDraft({ itemId: "item-a", code: "obsoleto", revision: 3 }));
      finishedAt = new Date();
      assert.ok("error" in await saveDiagnosticDraft({ itemId: "item-a", code: "cerrado", revision: 4 }));
      assert.equal(code, "edición propia");
      assert.equal(revision, 4);
      finishedAt = null;
    });

    await t.test("finalizar requiere propietario, espera evaluaciones y no repite escrituras al reintentar", async () => {
      const before = writes;
      user = { id: "cuenta-b", onboardingStep: 0 };
      assert.deepEqual(await finishDiagnostic("diagnostico-a"), { error: "No encontramos este diagnóstico." });
      assert.equal(writes, before);
      user = { id: "cuenta-a", onboardingStep: 0 };
      running = 1;
      assert.ok("error" in await finishDiagnostic("diagnostico-a"));
      assert.equal(writes, before);
      running = 0;
      assert.deepEqual(await finishDiagnostic("diagnostico-a"), { success: true });
      assert.equal(writes, before + 2);
      assert.deepEqual(await finishDiagnostic("diagnostico-a"), { success: true });
      assert.equal(writes, before + 2);
      finishedAt = null;
    });

    await t.test("ejecutar con ítem ajeno, variante incorrecta o diagnóstico cerrado no reserva ni programa", async () => {
      const before = writes;
      const runtimesBefore = runtimeCalls;
      user = { id: "cuenta-b", onboardingStep: 0 };
      assert.equal((await execute()).status, 404);
      user = { id: "cuenta-a", onboardingStep: 0 };
      assert.equal((await execute({ variantId: "otra-variante" })).status, 404);
      finishedAt = new Date();
      assert.equal((await execute()).status, 404);
      finishedAt = null;
      assert.equal(writes, before);
      assert.equal(runtimeCalls, runtimesBefore);
      assert.equal(scheduled.length, 0);
    });

    await t.test("la reserva revalida el propietario/estado dentro del bloqueo y usa la sesión al crear", async () => {
      const before = writes;
      itemChecks = 0;
      closeDuringReservation = true;
      assert.equal((await execute()).status, 429);
      assert.equal(itemChecks, 2);
      assert.equal(writes, before);
      assert.equal(scheduled.length, 0);
      closeDuringReservation = false;
      finishedAt = null;
      itemChecks = 0;
      const response = await execute({ userId: "cuenta-b" });
      assert.equal(response.status, 202);
      assert.deepEqual(await response.json(), { id: "intento-propio" });
      assert.equal(itemChecks, 2);
      assert.equal(writes, before + 1);
      assert.equal(scheduled.length, 1);
    });

    await t.test("inicio usa el perfil propio; sin sesión o con entrada inválida no hay acceso a datos", async () => {
      assert.ok("error" in await startDiagnostic("javascript"));
      const before = queries.length;
      assert.ok("error" in await saveDiagnosticDraft({ itemId: "item-a", code: "inválido", revision: 0 }));
      assert.ok("error" in await finishDiagnostic(""));
      assert.equal((await execute({ diagnosticItemId: "" })).status, 400);
      assert.equal(queries.length, before);
      user = null;
      await assert.rejects(read("diagnostico-a"), /sin sesión/);
      await assert.rejects(saveDiagnosticDraft({ itemId: "item-a", code: "invitado", revision: 4 }), /sin sesión/);
      await assert.rejects(finishDiagnostic("diagnostico-a"), /sin sesión/);
      await assert.rejects(startDiagnostic("javascript"), /sin sesión/);
      assert.equal((await execute()).status, 401);
      assert.equal((await execute({}, "http://untrusted.example")).status, 403);
      assert.equal(queries.length, before);
    });
  } finally {
    hooks.deregister();
    delete globals[key];
  }
});
