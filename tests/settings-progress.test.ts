import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ExerciseCard, Language } from "../src/lib/types";
import { learningPaths } from "../src/lib/learning-paths";

const reactUrl = import.meta.resolve("react");

test("Configuración agrupa la cuenta y conserva los destinos antiguos sin duplicar controles", async () => {
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (specifier === "react" && context.parentURL?.startsWith("itera-settings:")) return { url: reactUrl, shortCircuit: true };
      const parent = decodeURI(context.parentURL ?? "").replaceAll("\\", "/");
      if (parent.endsWith("/src/components/settings-page.tsx")) {
        const targets: Record<string, string> = { "next/navigation": "router", "next-themes": "theme", "@/server/learning-actions": "actions", "./account-security": "account", "./learning-preferences": "learning" };
        if (targets[specifier]) return { url: `itera-settings:${targets[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-settings:")) return next(url, context);
      const sources: Record<string, string> = {
        router: "export const useRouter = () => ({refresh() {}});",
        theme: 'export const useTheme = () => ({theme: "light", setTheme() {}});',
        actions: "export const saveAccountName = async () => ({success:true});",
        account: 'import {createElement} from "react"; export const AccountSecurity = ({section = "account"}) => createElement("span", {"data-account-mode": section}, section);',
        learning: "export const LearningPreferences = () => null; export const DiagnosticStart = () => null;",
      };
      return { format: "module", source: sources[url.slice("itera-settings:".length)], shortCircuit: true };
    },
  });
  try {
    const { SettingsPageContent } = await import("../src/components/settings-page");
    for (const section of ["cuenta", "seguridad", "privacidad", "aprendizaje", "apariencia", "desconocida"]) {
      const html = renderToStaticMarkup(createElement(SettingsPageContent, {
        section, user: { id: "cuenta", name: "Estudiante", email: "estudiante@example.test" }, profiles: [], history: [],
        summary: { language: "python", declaredLevel: null, suggestedLevel: null, reason: "Empieza aquí.", diagnosticDate: null, path: learningPaths[0] },
      }));
      const nav = html.match(/<nav[^>]*aria-label="Secciones de configuración"[^>]*>(.*?)<\/nav>/s)![1];
      assert.equal((nav.match(/<a /g) ?? []).length, 3);
      const canonical = ["aprendizaje", "apariencia"].includes(section) ? section : "cuenta";
      const current = nav.match(/<a\b[^>]*aria-current="page"[^>]*>/)![0];
      assert.match(current, new RegExp(`href="/configuracion\\?seccion=${canonical}"`));
      for (const mode of ["account", "security", "privacy"]) assert.equal((html.match(new RegExp(`data-account-mode="${mode}"`, "g")) ?? []).length, 1);
      assert.equal((html.match(/id="account-name"/g) ?? []).length, 1);
      assert.match(html, /id="security-title"/);
      assert.match(html, /id="privacy-title"/);
      assert.equal((html.match(/<section hidden=""/g) ?? []).length, 2);
    }
  } finally { hooks.deregister(); }
});

test("Progreso prioriza continuidad e historial sin perder archivos, páginas o aislamiento", async t => {
  let signedIn = true;
  let userId = "cuenta";
  let selected: Language = "python";
  const catalog: ExerciseCard[] = Array.from({ length: 12 }, (_, index) => ({ id: `e${index}`, slug: `reto-${index}`, title: `Reto ${index}`, description: "", category: "Listas", level: "BEGINNER", order: index, minutes: 5, runtimeMode: "FUNCTION", solved: index === 0, started: index === 1, solvedOther: false }));
  const scoped = (query: { where: { userId: string; language?: string; variant?: { language: string } } }) => {
    assert.equal(query.where.userId, userId);
    assert.equal(query.where.language ?? query.where.variant?.language, selected);
  };
  const key = Symbol.for("itera:test:progress-page");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = {
    currentUser: async () => signedIn ? { id: userId, preference: { language: "python" } } : null,
    getPracticeNavigation: async (id: string, language: Language) => {
      assert.equal(id, userId); assert.equal(language, selected);
      return { catalog, recommendation: { exercise: catalog[1], language, pathSlug: "bases", resume: true } };
    },
    getHistoryGroups: async (id: string, language: Language) => {
      assert.equal(id, userId); assert.equal(language, selected);
      return catalog.map(exercise => ({ exerciseId: exercise.id, count: 2, date: "2026-10-30", lastResult: "Ejemplos" }));
    },
    db: {
      learningPath: { findMany: async () => [{ slug: "bases", title: "Bases", items: catalog.map(exercise => ({ exerciseId: exercise.id })) }] },
      helpUsage: { findMany: async (query: Parameters<typeof scoped>[0]) => { scoped(query); return []; } },
      progress: { count: async (query: Parameters<typeof scoped>[0]) => { scoped(query); return 2; } },
      draft: { findMany: async (query: Parameters<typeof scoped>[0] & { skip: number; take: number }) => {
        scoped(query); assert.equal(query.skip, 20); assert.equal(query.take, 21);
        return [{ id: "borrador", code: "# conservado", updatedAt: new Date("2026-10-30"), variant: { language: selected, version: { title: "Actividad antigua", number: 1 } } }];
      } },
      submission: { findMany: async (query: Parameters<typeof scoped>[0] & { skip: number; take: number }) => {
        scoped(query); assert.equal(query.skip, 20); assert.equal(query.take, 21);
        return [{ id: "intento", code: "# intento conservado", status: "FAILED", variant: { language: selected, version: { title: "Actividad archivada" } } }];
      } },
      exerciseVersion: { findMany: async () => [{ id: "actual" }] },
    },
  };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (specifier === "react" && context.parentURL?.startsWith("itera-progress:")) return { url: reactUrl, shortCircuit: true };
      const parent = decodeURI(context.parentURL ?? "").replaceAll("\\", "/");
      if (parent.endsWith("/progreso/page.tsx")) {
        const targets: Record<string, string> = { "@/server/auth": "auth", "@/server/db": "db", "@/server/practice-navigation": "navigation", "@/server/progress-history": "history", "@/components/exercise-history": "exercise" };
        if (targets[specifier]) return { url: `itera-progress:${targets[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-progress:")) return next(url, context);
      if (url.endsWith(":exercise")) return { format: "module", source: 'import {createElement} from "react"; export const ExerciseHistory = ({title}) => createElement("p", {"data-history": true}, title);', shortCircuit: true };
      const names: Record<string, string> = { auth: "currentUser", db: "db", navigation: "getPracticeNavigation", history: "getHistoryGroups" };
      return { format: "module", source: `export const {${names[url.slice("itera-progress:".length)]}} = globalThis[Symbol.for("itera:test:progress-page")];`, shortCircuit: true };
    },
  });
  try {
    const { default: ProgressPage } = await import("../src/app/(platform)/progreso/page");
    await t.test("el lenguaje explícito y la cuenta se conservan en consultas, enlaces y archivos", async () => {
      for (const language of ["python", "typescript"] as const) {
        selected = language; userId = `cuenta-${language}`;
        const html = renderToStaticMarkup(await ProgressPage({ searchParams: Promise.resolve({ lenguaje: language, pagina: "2", archivo: "2", borradores: "2" }) }));
        assert.match(html, new RegExp(`/ejercicios/reto-1\\?lenguaje=${language}&amp;ruta=bases`));
        assert.ok(html.indexOf("Retomar:") < html.indexOf("Historial por ejercicio"));
        assert.ok(html.indexOf("Historial por ejercicio") < html.indexOf("Por ruta"));
        assert.equal((html.match(/data-history="true"/g) ?? []).length, 2);
        assert.match(html, /Reto 10/); assert.match(html, /Reto 11/);
        assert.match(html, /# conservado/); assert.match(html, /# intento conservado/);
        assert.match(html, new RegExp(`lenguaje=${language}&amp;archivo=1`));
        assert.match(html, new RegExp(`lenguaje=${language}&amp;borradores=1`));
        assert.match(html, /Por categoría/); assert.match(html, /data-state="closed"/);
      }
    });
    await t.test("los visitantes no consultan datos de cuenta", async () => {
      signedIn = false;
      const html = renderToStaticMarkup(await ProgressPage({ searchParams: Promise.resolve({}) }));
      assert.match(html, /Entra para ver tu progreso/);
      assert.doesNotMatch(html, /# conservado|# intento conservado/);
    });
  } finally { hooks.deregister(); delete globals[key]; }
});
