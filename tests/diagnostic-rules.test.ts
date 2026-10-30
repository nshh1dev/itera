import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { diagnosticExercises } from "../src/lib/learning-profile";
import type { Language, Level } from "../src/lib/types";

test("las acciones fijan reglas por sesión y nunca reinterpretan un diagnóstico antiguo", async t => {
  type Session = { id: string; language: Language; declaredLevel: Level; rulesVersion: number; finishedAt: Date | null };
  let session: Session | null = null;
  let recommendation: { suggestedLevel: Level | null; reason: string } | undefined;
  let updates = 0;
  let ids = 0;
  const key = Symbol.for("itera:test:diagnostic-rules");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  const db = {
    $executeRaw: async () => {},
    learningProfile: { findUnique: async ({ where }: { where: { userId_language: { userId: string } } }) => {
      assert.equal(where.userId_language.userId, "cuenta"); return { declaredLevel: "BEGINNER" };
    } },
    exercise: { findMany: async () => diagnosticExercises.BEGINNER.map(slug => ({ slug, versions: [{ variants: [{ id: slug, starter: "plantilla", tests: [{ id: "caso" }] }] }] })) },
    diagnostic: {
      findFirst: async ({ where, include }: { where: { userId: string; id?: string }; include?: { items: { include: { submissions: { where: { mode: string } } } } } }) => {
        assert.equal(where.userId, "cuenta");
        if (where.id) {
          assert.equal(include?.items.include.submissions.where.mode, "submit");
          return session && session.id === where.id ? { ...session, items: diagnosticExercises.BEGINNER.map(() => ({ submissions: [{ status: "PASSED" }] })) } : null;
        }
        return session?.finishedAt ? null : session;
      },
      create: async ({ data }: { data: Omit<Session, "id" | "finishedAt"> & { userId: string; items: { create: { variantId: string; code: string; position: number }[] } } }) => {
        assert.equal(data.userId, "cuenta");
        assert.deepEqual(data.items.create.map(item => item.variantId), diagnosticExercises.BEGINNER);
        assert.deepEqual(data.items.create.map(item => item.position), [0, 1, 2]);
        session = { id: `sesion-${++ids}`, language: data.language, declaredLevel: data.declaredLevel, rulesVersion: data.rulesVersion, finishedAt: null };
        return session;
      },
      update: async ({ where, data }: { where: { id: string }; data: { finishedAt: Date; suggestedLevel: Level | null; reason: string } }) => {
        assert.equal(where.id, session!.id); session!.finishedAt = data.finishedAt; recommendation = data; updates++;
      },
    },
    submission: { count: async () => 0 },
    user: { updateMany: async ({ where }: { where: { id: string } }) => { assert.equal(where.id, "cuenta"); } },
  };
  globals[key] = { db: { ...db, $transaction: async <T>(run: (tx: typeof db) => Promise<T>) => run(db) } };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      const parent = decodeURI(context.parentURL ?? "").replaceAll("\\", "/");
      if (parent.endsWith("/src/server/learning-actions.ts")) {
        const targets: Record<string, string> = { "./auth": "auth", "./db": "db", "next/cache": "cache", "@/server/learning": "learning" };
        if (targets[specifier]) return { url: `itera-diagnostic-rules:${targets[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-diagnostic-rules:")) return next(url, context);
      const sources: Record<string, string> = {
        auth: 'export const requireUser = async () => ({id:"cuenta"});',
        db: 'export const {db} = globalThis[Symbol.for("itera:test:diagnostic-rules")];',
        cache: "export const revalidatePath = () => {};",
        learning: "export const getLearningSummary = async () => ({});",
      };
      return { format: "module", source: sources[url.split(":")[1]], shortCircuit: true };
    },
  });
  try {
    const { startDiagnostic, finishDiagnostic } = await import("../src/server/learning-actions");
    await t.test("Python nuevo fija v2 y no promociona tras tres comprobaciones superadas", async () => {
      const result = await startDiagnostic("python");
      assert.ok(result.id);
      assert.equal(session!.rulesVersion, 2);
      assert.deepEqual(await finishDiagnostic(result.id), { success: true });
      assert.equal(recommendation?.suggestedLevel, "BEGINNER");
      assert.match(recommendation!.reason, /no bastan para saltar/);
    });
    await t.test("una sesión Python v1 abierta se retoma y finaliza con sus reglas originales", async () => {
      session = { id: "antigua", language: "python", declaredLevel: "BEGINNER", rulesVersion: 1, finishedAt: null };
      const before = ids;
      assert.deepEqual(await startDiagnostic("python"), { id: "antigua" });
      assert.equal(ids, before);
      assert.equal(session.rulesVersion, 1);
      await finishDiagnostic("antigua");
      assert.equal(recommendation?.suggestedLevel, "INTERMEDIATE");
      const beforeUpdates = updates;
      await finishDiagnostic("antigua");
      assert.equal(updates, beforeUpdates);
    });
    await t.test("JavaScript y TypeScript conservan selección y promoción v1", async () => {
      for (const language of ["javascript", "typescript"] as const) {
        session = null;
        const result = await startDiagnostic(language);
        assert.equal((session as Session | null)?.rulesVersion, 1);
        await finishDiagnostic(result.id);
        assert.equal(recommendation?.suggestedLevel, "INTERMEDIATE");
      }
    });
  } finally { hooks.deregister(); delete globals[key]; }
});
