import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import type { Language, Level } from "../src/lib/types";
import type { ReactElement } from "react";

test("la bienvenida guarda y finaliza sin diagnóstico ni progreso y respeta la orientación anterior", async t => {
  let user: { id: string } | null = { id: "cuenta" };
  let step = 2;
  let writes = 0;
  let profile: { declaredLevel: Level } | null = null;
  let diagnostic: { declaredLevel: Level; suggestedLevel: Level; reason: string; finishedAt: Date } | null = null;
  const owner = (id: string) => assert.equal(id, "cuenta");
  const key = Symbol.for("itera:test:onboarding");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = {
    requireUser: async () => { if (!user) throw new Error("sin sesión"); return { ...user, onboardingStep: step, preference: { language: "python" } }; },
    db: {
      learningProfile: {
        upsert: async ({ where, update }: { where: { userId_language: { userId: string; language: Language } }; update: { declaredLevel: Level } }) => {
          owner(where.userId_language.userId); assert.equal(where.userId_language.language, "python");
          profile = update; writes++;
        },
        findUnique: async ({ where }: { where: { userId_language: { userId: string } } }) => { owner(where.userId_language.userId); return profile; },
        findMany: async ({ where }: { where: { userId: string } }) => { owner(where.userId); return profile ? [{ ...profile, language: "python" }] : []; },
      },
      userPreference: { upsert: async ({ where }: { where: { userId: string } }) => { owner(where.userId); writes++; } },
      user: { updateMany: async ({ where, data }: { where: { id: string; onboardingStep: number | { gt: number } }; data: { onboardingStep: number } }) => {
        owner(where.id);
        if (typeof where.onboardingStep === "number" ? step === where.onboardingStep : step > where.onboardingStep.gt) step = data.onboardingStep;
        writes++;
      } },
      diagnostic: { findFirst: async ({ where }: { where: { userId: string } }) => { owner(where.userId); return diagnostic; } },
      $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
    },
  };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      const parent = decodeURI(context.parentURL ?? "").replaceAll("\\", "/");
      if (parent.endsWith("/src/server/learning-actions.ts") || parent.endsWith("/src/server/learning.ts") || parent.endsWith("/bienvenida/page.tsx")) {
        const targets: Record<string, string> = { "./auth": "auth", "@/server/auth": "auth", "./db": "db", "@/server/db": "db", "next/cache": "empty", "server-only": "empty", "next/navigation": "navigation", "@/components/onboarding": "component" };
        if (targets[specifier]) return { url: `itera-onboarding:${targets[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-onboarding:")) return next(url, context);
      if (url.endsWith(":navigation")) return { format: "module", source: 'export const redirect = href => { throw new Error("redirect:" + href); };', shortCircuit: true };
      if (url.endsWith(":component")) return { format: "module", source: "export const Onboarding = () => null;", shortCircuit: true };
      const name = url.endsWith(":auth") ? "requireUser" : "db";
      return { format: "module", source: url.endsWith(":empty") ? "export const revalidatePath = () => {};" : `export const {${name}} = globalThis[Symbol.for("itera:test:onboarding")];`, shortCircuit: true };
    },
  });
  try {
    const { saveLearningPreferences } = await import("../src/server/learning-actions");
    await t.test("los estados antiguos se completan sin escribir progreso, borradores o diagnósticos", async () => {
      for (const previous of [0, 1, 2, 3, 4]) {
        step = previous;
        const result = await saveLearningPreferences({ language: "python", level: "INTERMEDIATE", finishOnboarding: true, userId: "otra" });
        assert.equal(result.pathSlug, "pensar-en-soluciones");
        assert.equal(step, 0);
      }
    });
    await t.test("un diagnóstico aplicable conserva su recomendación y su historial", async () => {
      diagnostic = { declaredLevel: "INTERMEDIATE", suggestedLevel: "BEGINNER", reason: "Refuerza tus bases.", finishedAt: new Date() };
      const result = await saveLearningPreferences({ language: "python", level: "INTERMEDIATE", finishOnboarding: true });
      assert.equal(result.pathSlug, "primeros-pasos");
      assert.equal(diagnostic.reason, "Refuerza tus bases.");
    });
    await t.test("elegir diagnóstico o guardar ajustes no completa la bienvenida", async () => {
      step = 2;
      const result = await saveLearningPreferences({ language: "python", level: "BEGINNER" });
      assert.equal(result.pathSlug, undefined);
      assert.equal(step, 3);
    });
    await t.test("los pasos antiguos convergen en personalización y solo se abre el diagnóstico al pedirlo", async () => {
      const { default: WelcomePage } = await import("../src/app/(auth)/bienvenida/page");
      for (const previous of [1, 2, 3, 4]) {
        step = previous;
        for (const paso of [undefined, "1", "2", "4", "inválido", "-1"]) {
          const page = await WelcomePage({ searchParams: Promise.resolve({ paso, volver: "/ejercicios/reto?lenguaje=python&ruta=bases" }) }) as ReactElement<{ step: number; returnTo: string }>;
          assert.equal(page.props.step, 2);
          assert.equal(page.props.returnTo, "/ejercicios/reto?lenguaje=python&ruta=bases");
        }
      }
      const page = await WelcomePage({ searchParams: Promise.resolve({ paso: "3" }) }) as ReactElement<{ step: number }>;
      assert.equal(page.props.step, 3);
      profile = null;
      const withoutProfile = await WelcomePage({ searchParams: Promise.resolve({ paso: "3" }) }) as ReactElement<{ step: number }>;
      assert.equal(withoutProfile.props.step, 2);
      step = 0;
      await assert.rejects(WelcomePage({ searchParams: Promise.resolve({}) }), /redirect:\/configuracion\?seccion=aprendizaje/);
    });
    await t.test("la entrada inválida y la ausencia de sesión no escriben", async () => {
      const before = writes;
      assert.ok((await saveLearningPreferences({ language: "python", level: "INTERMEDIATE", finishOnboarding: "sí" })).error);
      user = null;
      await assert.rejects(saveLearningPreferences({ language: "python", level: "INTERMEDIATE", finishOnboarding: true }), /sin sesión/);
      assert.equal(writes, before);
    });
  } finally { hooks.deregister(); delete globals[key]; }
});
