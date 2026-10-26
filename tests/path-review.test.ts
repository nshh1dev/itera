import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathReview } from "../src/components/path-review";
import { modulesForPath } from "../src/lib/learning-modules";
import { learningPaths, exerciseHref } from "../src/lib/learning-paths";
import { languages, type ExerciseCard, type Language } from "../src/lib/types";

const exercise = (slug: string, extra: Partial<ExerciseCard> = {}): ExerciseCard => ({ id: slug, slug, title: slug, description: "", category: "Fundamentos", level: "INITIATION", order: 0, minutes: 5, runtimeMode: "PROGRAM", solved: false, started: false, solvedOther: false, ...extra });

test("el repaso de las cuatro rutas usa readiness y enlaza ejercicios publicados en cada lenguaje", () => {
  for (const path of learningPaths) for (const language of languages) {
    const modules = modulesForPath(path.slug);
    const exercises = modules.flatMap(module => module.slugs.map(slug => exercise(slug)));
    const before = JSON.stringify(exercises);
    const html = renderToStaticMarkup(createElement(PathReview, { pathSlug: path.slug, language, modules, exercises }));
    for (const unit of modules) {
      for (const criterion of unit.readiness) assert.ok(html.includes(criterion));
      assert.ok(html.includes(exerciseHref(unit.slugs.at(-1)!, language, path.slug).replaceAll("&", "&amp;")));
    }
    assert.match(html, /solo una comprobación de solución superada guarda ese progreso/);
    assert.match(html, /id="path-readiness" tabindex="-1"/);
    assert.doesNotMatch(html, /type="checkbox"|<form/);
    assert.equal(JSON.stringify(exercises), before);
  }
});

test("el repaso prefiere un integrador publicado y no enlaza ejercicios retirados", () => {
  const modules = modulesForPath("desde-cero").slice(0, 2);
  const available = exercise(modules[0].slugs[0], { activityType: "INTEGRATION", title: "Integrador <script>" });
  const html = renderToStaticMarkup(createElement(PathReview, { pathSlug: "desde-cero", language: "typescript", modules, exercises: [available], next: { slug: "primeros-pasos", title: "Construye tus bases" } }));
  assert.ok(html.includes(exerciseHref(available.slug, "typescript", "desde-cero").replaceAll("&", "&amp;")));
  assert.ok(!html.includes(exerciseHref(modules[0].slugs.at(-1)!, "typescript", "desde-cero").replaceAll("&", "&amp;")));
  assert.match(html, /Este módulo todavía no tiene ejercicios publicados/);
  assert.match(html, /Abrir primer integrador/);
  assert.match(html, /href="\/rutas\/primeros-pasos\?lenguaje=typescript"/);
  assert.doesNotMatch(html, /<script>/);
});

test("la última ruta ofrece repaso sin inventar una ruta siguiente o integradores ausentes", () => {
  const html = renderToStaticMarkup(createElement(PathReview, { pathSlug: "un-paso-mas", language: "python", modules: modulesForPath("un-paso-mas"), exercises: [] }));
  assert.doesNotMatch(html, /Continuar con|Abrir primer integrador/);
  assert.match(html, /Vuelve a los retos con otra estrategia/);
  assert.match(html, /todavía no tiene desafíos integradores publicados/);
});

test("el cierre de ruta depende del catálogo del usuario y lenguaje, sin escribir progreso", async t => {
  let user: { id: string; preference: { language: Language } } | null = { id: "cuenta", preference: { language: "python" } };
  const modules = modulesForPath("desde-cero");
  let catalog = [exercise(modules[0].slugs[0], { solved: true }), exercise(modules[0].slugs[1], { solved: true })];
  let pathSlug = "desde-cero";
  let reads = 0;
  const key = Symbol.for("itera:test:path-review");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = {
    db: { learningPath: { findUnique: async () => ({ slug: pathSlug, title: "Desde cero", description: "Descripción", items: [...modules[0].slugs.map(exerciseId => ({ exerciseId }))] }) } },
    currentUser: async () => user,
    getCatalog: async (userId: string | undefined, language: Language) => {
      reads++;
      assert.equal(userId, user?.id);
      return catalog.map(entry => ({ ...entry, solved: userId === "cuenta" && language === "python" && entry.solved, solvedOther: language !== "python", started: true }));
    },
  };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (decodeURI(context.parentURL ?? "").replaceAll("\\", "/").includes("/rutas/[slug]/page.tsx")) {
        const name = specifier === "@/server/db" ? "db" : specifier === "@/server/auth" ? "currentUser" : specifier === "@/server/catalog" ? "getCatalog" : null;
        if (name) return { url: `itera-path-review:${name}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-path-review:")) return next(url, context);
      return { format: "module", source: `export const {${url.split(":")[1]}} = globalThis[Symbol.for("itera:test:path-review")];`, shortCircuit: true };
    },
  });
  try {
    const { default: PathPage } = await import("../src/app/(platform)/rutas/[slug]/page");
    const render = async (language?: string) => renderToStaticMarkup(await PathPage({ params: Promise.resolve({ slug: pathSlug }), searchParams: Promise.resolve({ lenguaje: language }) }));
    await t.test("todos los publicados completados muestran resumen, ancla de repaso y acceso libre", async () => {
      const html = await render();
      assert.match(html, /Ruta completada en Python/);
      assert.match(html, /los 2 ejercicios publicados/);
      assert.match(html, /no demuestra por sí solo dominio/);
      assert.match(html, /href="#path-readiness"/);
      assert.match(html, /id="path-readiness"/);
      assert.match(html, /Continuar con Construye tus bases/);
      assert.doesNotMatch(html, /Siguiente ejercicio de la ruta/);
      assert.doesNotMatch(html, /0 \/ 0/);
      const published = new Set(catalog.map(entry => entry.slug));
      for (const match of html.matchAll(/href="\/ejercicios\/([^?"#]+)/g)) assert.ok(published.has(decodeURIComponent(match[1])), `Enlace a actividad no publicada: ${match[1]}`);
    });
    await t.test("otros lenguajes y cuentas no heredan el cierre", async () => {
      for (const language of ["javascript", "typescript"]) {
        const html = await render(language);
        assert.doesNotMatch(html, /Ruta completada en/);
        assert.match(html, /Siguiente ejercicio de la ruta/);
        assert.match(html, /Continuar con Construye tus bases/);
      }
      user = { id: "otra-cuenta", preference: { language: "python" } };
      assert.doesNotMatch(await render(), /Ruta completada en/);
    });
    await t.test("borradores, ejemplos y consulta de ayudas no sustituyen completados", async () => {
      user = { id: "cuenta", preference: { language: "python" } };
      catalog[1].solved = false;
      const before = JSON.stringify(catalog);
      const html = await render();
      assert.doesNotMatch(html, /Ruta completada en/);
      assert.match(html, /Retoma tu práctica/);
      assert.equal(JSON.stringify(catalog), before);
    });
    await t.test("invitados, rutas vacías y rutas sin módulos no tienen un cierre falso", async () => {
      user = null;
      assert.doesNotMatch(await render(), /Ruta completada en/);
      user = { id: "cuenta", preference: { language: "python" } };
      catalog = [];
      assert.doesNotMatch(await render(), /Ruta completada en/);
      catalog = [exercise(modules[0].slugs[0], { solved: true })];
      pathSlug = "personalizada";
      assert.doesNotMatch(await render(), /Ruta completada en|href="#path-readiness"/);
    });
    assert.equal(reads, 8);
  } finally { hooks.deregister(); delete globals[key]; }
});
