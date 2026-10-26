import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import type { Level } from "../src/lib/types";

test("el resumen respeta el último diagnóstico terminado, incluso inconcluso", async t => {
  let declaredLevel: Level | undefined = "BEGINNER";
  type Diagnostic = { id: string; userId: string; language: string; declaredLevel: Level; suggestedLevel: Level | null; reason: string; createdAt: Date; finishedAt: Date | null };
  let diagnostics: Diagnostic[] = [];
  const entry = (id: string, extra: Partial<Diagnostic> = {}): Diagnostic => ({ id, userId: "cuenta", language: "python", declaredLevel: "BEGINNER", suggestedLevel: "INTERMEDIATE", reason: "Puedes avanzar.", createdAt: new Date("2026-10-24"), finishedAt: new Date("2026-10-24"), ...extra });
  const key = Symbol.for("itera:test:learning-summary");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = { db: {
    learningProfile: { findUnique: async ({ where }: { where: { userId_language: { userId: string; language: string } } }) => {
      assert.deepEqual(where.userId_language, { userId: "cuenta", language: "python" });
      return declaredLevel ? { declaredLevel } : null;
    } },
    diagnostic: { findFirst: async ({ where, orderBy }: { where: { userId: string; language: string; suggestedLevel?: unknown }; orderBy: Record<string, string>[] }) => {
      assert.equal(where.userId, "cuenta"); assert.equal(where.language, "python");
      const matching = diagnostics.filter(item => item.userId === where.userId && item.language === where.language && item.finishedAt && (!where.suggestedLevel || item.suggestedLevel));
      return matching.sort((a, b) => {
        for (const order of orderBy) {
          const field = Object.keys(order)[0] as "createdAt" | "finishedAt" | "id";
          const difference = field === "id" ? b.id.localeCompare(a.id) : b[field]!.getTime() - a[field]!.getTime();
          if (difference) return difference;
        }
        return 0;
      })[0] ?? null;
    } },
  } };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (decodeURI(context.parentURL ?? "").replaceAll("\\", "/").endsWith("/src/server/learning.ts")) {
        if (specifier === "server-only" || specifier === "./db") return { url: `itera-learning-summary:${specifier === "./db" ? "db" : "empty"}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-learning-summary:")) return next(url, context);
      return { format: "module", source: url.endsWith(":db") ? 'export const {db} = globalThis[Symbol.for("itera:test:learning-summary")];' : "", shortCircuit: true };
    },
  });
  try {
    const { getLearningSummary } = await import("../src/server/learning");
    await t.test("un diagnóstico inconcluso reciente sustituye la orientación anterior, no el nivel declarado", async () => {
      diagnostics = [entry("anterior"), entry("reciente", { suggestedLevel: null, reason: "Conservamos tu nivel declarado.", createdAt: new Date("2026-10-25"), finishedAt: new Date("2026-10-25") })];
      const summary = await getLearningSummary("cuenta", "python");
      assert.equal(summary.path.level, "BEGINNER"); assert.equal(summary.suggestedLevel, null);
      assert.equal(summary.reason, "Conservamos tu nivel declarado."); assert.equal(summary.diagnosticDate, "2026-10-25T00:00:00.000Z");
    });
    await t.test("terminado más recientemente no significa creado más recientemente", async () => {
      diagnostics = [entry("creado-antes", { suggestedLevel: null, finishedAt: new Date("2026-10-26") }), entry("creado-después", { createdAt: new Date("2026-10-25"), finishedAt: new Date("2026-10-25") })];
      assert.equal((await getLearningSummary("cuenta", "python")).diagnosticDate, "2026-10-26T00:00:00.000Z");
    });
    await t.test("un diagnóstico sin terminar o de otra cuenta/lenguaje no desplaza el resultado", async () => {
      diagnostics = [entry("propio"), entry("inconcluso", { finishedAt: null }), entry("ajeno", { userId: "otra", finishedAt: new Date("2026-10-26") }), entry("otro-lenguaje", { language: "typescript", finishedAt: new Date("2026-10-26") })];
      const summary = await getLearningSummary("cuenta", "python");
      assert.equal(summary.suggestedLevel, "INTERMEDIATE"); assert.equal(summary.path.level, "INTERMEDIATE");
    });
    await t.test("cambiar el nivel declarado deja de aplicar la recomendación y razón anteriores", async () => {
      declaredLevel = "ADVANCED"; diagnostics = [entry("anterior")];
      const summary = await getLearningSummary("cuenta", "python");
      assert.equal(summary.path.level, "ADVANCED"); assert.equal(summary.suggestedLevel, null); assert.equal(summary.diagnosticDate, null);
      assert.notEqual(summary.reason, diagnostics[0].reason);
    });
    await t.test("sin perfil ni diagnóstico propone iniciación sin inventar un resultado", async () => {
      declaredLevel = undefined; diagnostics = [];
      const summary = await getLearningSummary("cuenta", "python");
      assert.equal(summary.path.level, "INITIATION"); assert.equal(summary.declaredLevel, null); assert.equal(summary.diagnosticDate, null);
    });
  } finally { hooks.deregister(); delete globals[key]; }
});
