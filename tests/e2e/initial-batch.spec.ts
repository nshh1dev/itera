import "dotenv/config";
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { PrismaClient, Prisma } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { exercises } from "../../prisma/content";
import { initialBatchSlugs } from "../../prisma/initial-batch";
import { seedVersionContent } from "../../prisma/editorial-revision";
import { activityNames } from "../../src/lib/types";
import { openLearningHelp, openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const prefix = `r1-e2e-${Date.now()}`;
const email = `${prefix}@example.test`;
const batch = initialBatchSlugs.map(slug => exercises.find(exercise => exercise.slug === slug)!);
const fixtureSlugs = [...new Set([...initialBatchSlugs, ...batch.flatMap(exercise => exercise.prerequisiteSlugs ?? [])])];
const fixtures = fixtureSlugs.map(slug => exercises.find(exercise => exercise.slug === slug)!);
const slugs = fixtures.map(exercise => `${prefix}-${exercise.slug}`);
const json = (value: unknown) => value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;

test.beforeAll(async () => {
  // Copias temporales para verificar presentación, no la publicación real ni Piston.
  // Nunca se modifica una identidad, versión o ruta del catálogo del propietario.
  for (const [index, exercise] of fixtures.entries()) {
    const { variants, ...version } = seedVersionContent(exercise);
    await db.exercise.create({ data: {
      slug: slugs[index], category: exercise.category, order: 10000 + index,
      versions: { create: { ...version, prerequisiteSlugs: version.prerequisiteSlugs.map(slug => `${prefix}-${slug}`), published: true, variants: { create: variants.map(({ tests, ...variant }) => ({
        ...variant, tests: { create: tests.map(fixture => ({ ...fixture, input: json(fixture.input), expected: json(fixture.expected), explanation: fixture.visible ? fixture.explanation : "MARCADOR_OCULTO_R1" })) },
      })) } } },
    } });
  }
  await mkdir(".local/screenshots", { recursive: true });
});

test.afterAll(async () => {
  await db.exercise.deleteMany({ where: { slug: { in: slugs } } });
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});

for (const language of ["python", "javascript"] as const) {
  test(`los doce ejercicios R1 presentan guía, ejemplos y plantilla en ${language}`, async ({ page }) => {
    for (const exercise of batch) {
      const href = `/ejercicios/${prefix}-${exercise.slug}?lenguaje=${language}`;
      await page.goto(href);
      await openLearningHelp(page);
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.getByText(exercise.objective!, { exact: true })).toBeVisible();
      for (const goal of exercise.practiceGoals!) await expect(guide.getByText(goal, { exact: true })).toBeVisible();
      await expect(page.getByText(activityNames[exercise.activityType!], { exact: true })).toBeVisible();
      await expect(guide.getByText(/todavía no tiene|no especifica/)).toHaveCount(0);
      await expect(page.locator(".example-panel")).toHaveCount(2);
      await expect(page.getByText(exercise.tests[0].explanation!, { exact: true })).toBeVisible();
      const previous = guide.getByRole("navigation", { name: "Ejercicios previos recomendados" });
      if (exercise.prerequisiteSlugs!.length) {
        await expect(previous.getByRole("link")).toHaveCount(exercise.prerequisiteSlugs!.length);
        for (const slug of exercise.prerequisiteSlugs!) await expect(previous.locator(`a[href="/ejercicios/${prefix}-${slug}?lenguaje=${language}"]`)).toBeVisible();
      } else await expect(previous).toHaveCount(0);
      await openSimpleEditor(page);
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(exercise.starters![language]);
      // Comprueba también el payload del servidor, no solo elementos visibles.
      const response = await page.request.get(href);
      expect(await response.text()).not.toContain("MARCADOR_OCULTO_R1");
    }
  });
}

for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 1440]) {
    test(`la guía R1 conserva lectura, foco y anchura a ${width}px en ${theme}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      await page.goto(`/ejercicios/${prefix}-suma-de-dos-numeros?lenguaje=python`);
      await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /light/);
      if (width >= 1200) await expect(page.locator(".monaco-editor")).toBeVisible();
      else await expect(page.locator(".monaco-editor")).toBeAttached();
      await openLearningHelp(page);
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.getByRole("heading", { name: "Qué vas a practicar", exact: true })).toBeVisible();
      const link = guide.getByRole("link").first();
      await page.keyboard.press("Tab");
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const statement = page.getByRole("region", { name: "Enunciado", exact: true });
      expect(await statement.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await page.screenshot({ path: `.local/screenshots/r1-${theme}-${width}.png`, fullPage: true });
    });
  }
}

test("la solución explica cada lenguaje sin conceder progreso por consultarla", async ({ page }) => {
  const signup = await page.request.post("/api/auth/sign-up/email", { data: { name: "Prueba R1", email, password: "Itera-R1-local-12345" }, headers: { origin: "http://127.0.0.1:3000" } });
  expect(signup.ok()).toBe(true);
  for (const language of ["python", "javascript"] as const) {
    await page.goto(`/ejercicios/${prefix}-suma-de-dos-numeros?lenguaje=${language}`);
    await page.getByRole("button", { name: "Ver pistas", exact: true }).click();
    await page.getByRole("tab", { name: "Solución explicada", exact: true }).click();
    await page.getByRole("button", { name: "Ver solución explicada", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/Razonamiento\s/)).toBeVisible();
    await expect(dialog.getByText(/Errores comunes\s/)).toBeVisible();
    await expect(dialog.getByText(language === "python" ? /En Python\s/ : /En JavaScript\s/)).toBeVisible();
    expect(await dialog.locator("p.whitespace-pre-line").evaluate(element => getComputedStyle(element).whiteSpace)).toBe("pre-line");
    await expect(dialog.locator("pre")).toHaveText(batch.find(exercise => exercise.slug === "suma-de-dos-numeros")![language]);
  }
  expect(await db.progress.count({ where: { user: { email } } })).toBe(0);
  expect(await db.submission.count({ where: { user: { email } } })).toBe(0);
});
