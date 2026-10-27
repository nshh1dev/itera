import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import { PrismaClient, Prisma } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedVersionContent } from "../../prisma/editorial-revision";
import { logicExercises } from "../../prisma/logic-content";
import { openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const prefix = `ux-${Date.now()}`;
const emails: string[] = [];
const exercises: Awaited<ReturnType<typeof db.exercise.findMany>> = [];
const json = (value: unknown) => value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
test.beforeAll(async () => {
  const source = logicExercises.find(exercise => exercise.slug === "logica-dos-parametros")!;
  for (let index = 0; index < 2; index++) {
    const { variants, ...version } = seedVersionContent(source);
    const item = await db.exercise.create({ data: { slug: `${prefix}-${index}`, category: "Fundamentos", order: 25000 + index, versions: { create: [1, 2].map(number => ({ ...version, title: `Prueba UX ${index + 1}`, number, published: true, minutes: index ? 12 : 6, variants: { create: variants.map(({ tests, ...variant }) => ({ ...variant, tests: { create: tests.map(fixture => ({ ...fixture, input: json(fixture.input), expected: json(fixture.expected) })) } })) } })) } } });
    exercises.push(item);
  }
  await db.learningPath.create({ data: { slug: prefix, title: "Ruta temporal UX", description: "Ruta de prueba", order: 25000, items: { create: exercises.map((exercise, position) => ({ exerciseId: exercise.id, position })) } } });
  await mkdir(".local/screenshots", { recursive: true });
});
test.afterAll(async () => {
  await db.user.deleteMany({ where: { email: { in: emails } } });
  await db.learningPath.deleteMany({ where: { slug: prefix } });
  await db.exercise.deleteMany({ where: { slug: { in: exercises.map(exercise => exercise.slug) } } });
  await db.$disconnect();
});
async function signup(page: Page, suffix: string) {
  const email = `${prefix}-${suffix}@example.test`;
  emails.push(email);
  const response = await page.request.post("/api/auth/sign-up/email", { headers: { origin: "http://127.0.0.1:3000" }, data: { name: "Prueba UX", email, password: "Itera-UX-local-12345" } });
  expect(response.ok(), await response.text()).toBe(true);
  return db.user.findUniqueOrThrow({ where: { email } });
}
async function variant(index: number, language = "python", number = 2) {
  return db.exerciseVariant.findFirstOrThrow({ where: { language, version: { exerciseId: exercises[index].id, number } } });
}

test("retoma el último pendiente entre lenguajes y conserva su origen en otro navegador", async ({ page, browser, baseURL }) => {
  const user = await signup(page, "continuar");
  const python = await variant(0);
  const javascript = await variant(1, "javascript");
  await db.draft.create({ data: { userId: user.id, variantId: python.id, code: "# anterior", updatedAt: new Date("2026-01-01") } });
  await db.draft.create({ data: { userId: user.id, variantId: javascript.id, code: "function solve(data) { return 1; }" } });
  await db.practiceContext.create({ data: { userId: user.id, exerciseId: exercises[1].id, language: "javascript", pathSlug: prefix } });
  await page.goto("/inicio");
  await expect(page.getByRole("link", { name: "Continuar ejercicio", exact: true })).toHaveAttribute("href", `/ejercicios/${exercises[1].slug}?lenguaje=javascript&ruta=${prefix}`);
  const context = await browser.newContext({ baseURL, storageState: await page.context().storageState() });
  try {
    const other = await context.newPage();
    await other.goto("/inicio");
    await other.getByRole("link", { name: "Continuar ejercicio", exact: true }).click();
    await expect(other.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/${prefix}?lenguaje=javascript`);
    await expect.poll(async () => (await db.practiceContext.findUniqueOrThrow({ where: { userId_exerciseId_language: { userId: user.id, exerciseId: exercises[1].id, language: "javascript" } } })).pathSlug).toBe(prefix);
    await other.goto(`/ejercicios/${exercises[1].slug}?lenguaje=javascript`);
    await expect.poll(async () => (await db.practiceContext.findUniqueOrThrow({ where: { userId_exerciseId_language: { userId: user.id, exerciseId: exercises[1].id, language: "javascript" } } })).pathSlug).toBeNull();
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(0);
  } finally { await context.close(); }
});

test("el catálogo distingue borrador, ejemplos y ausencia de actividad con filtros automáticos", async ({ page }) => {
  const user = await signup(page, "estados");
  const draft = await variant(0);
  await db.draft.create({ data: { userId: user.id, variantId: draft.id, code: "# borrador sin comprobaciones" } });
  await page.goto("/ejercicios?q=Prueba+UX&lenguaje=python");
  await expect(page.getByRole("link").filter({ hasText: "Prueba UX 1" }).last()).toContainText("En progreso");
  await expect(page.getByRole("link").filter({ hasText: "Prueba UX 2" }).last()).toContainText("Sin empezar");
  const search = page.getByRole("searchbox", { name: "Palabra clave" });
  await search.fill("Prueba UX 1");
  await expect(page).toHaveURL(/q=Prueba\+UX\+1/);
  await expect(search).toBeFocused();
  await search.fill("Prueba UX");
  await expect(page).toHaveURL(/q=Prueba\+UX&/);
  await page.getByLabel("Estado", { exact: true }).selectOption("sin-empezar");
  await expect(page).toHaveURL(/estado=sin-empezar/);
  await expect(page.locator(".catalog-results .exercise-row")).toHaveCount(1);
  await expect(page.locator(".catalog-results .exercise-row")).toContainText("Prueba UX 2");
  await page.getByRole("link", { name: "Limpiar filtros", exact: true }).click();
  await expect(page.getByLabel("Estado", { exact: true })).toHaveValue("");
  await search.fill("Prueba UX");
  await expect(page).toHaveURL(/q=Prueba\+UX/);
  await page.getByLabel("Ordenar por").selectOption("duracion");
  await expect(page).toHaveURL(/orden=duracion/);
  await expect(page.locator(".catalog-results .exercise-row").first()).toContainText("Prueba UX 1");
  await search.fill("ninguna-coincidencia-ux");
  await expect(page.getByRole("heading", { name: "Todavía no hay coincidencias." })).toBeVisible();
});

test("el historial agrupa versiones, pagina intentos y no mezcla lenguajes ni usuarios", async ({ page }) => {
  const user = await signup(page, "historial");
  const old = await variant(0, "python", 1);
  const current = await variant(0);
  const js = await variant(0, "javascript");
  await db.submission.createMany({ data: Array.from({ length: 12 }, (_, index) => ({ userId: user.id, variantId: index % 2 ? old.id : current.id, mode: "submit", status: index === 0 ? "PASSED" as const : "FAILED" as const, code: `# intento propio ${index}`, idempotencyKey: `${prefix}-${index}`, passedCount: index === 0 ? 3 : 0, totalCount: 3, createdAt: new Date(Date.now() + index * 1000) })) });
  await db.submission.create({ data: { userId: user.id, variantId: js.id, mode: "examples", status: "PASSED", code: "// SOLO_JAVASCRIPT", idempotencyKey: `${prefix}-js`, passedCount: 2, totalCount: 2 } });
  await db.progress.create({ data: { userId: user.id, exerciseId: exercises[0].id, language: "python", firstPassedAt: new Date(), attempts: 12 } });
  await page.goto("/progreso?lenguaje=python");
  const history = page.locator(".activity-journal");
  await expect(history.locator("article")).toHaveCount(1);
  const entry = history.getByRole("button", { name: /Prueba UX 1.*Resuelto.*12 intentos/ });
  await expect(entry).toContainText("pruebas no superadas");
  expect(await page.content()).not.toContain("intento propio");
  await entry.click();
  await expect(history.getByRole("button", { name: /^Comprobación/ })).toHaveCount(10);
  await history.getByRole("button", { name: "Ver más intentos" }).click();
  await expect(history.getByRole("button", { name: /^Comprobación/ })).toHaveCount(12);
  await history.getByRole("button", { name: /^Comprobación.*Último intento/ }).click();
  await expect(history.getByRole("code")).toHaveText("# intento propio 11");
  expect(await page.content()).not.toContain("SOLO_JAVASCRIPT");
  await expect(page.locator("dl dd").first()).toHaveText(/1\s*\/\s*\d+/);
  await page.getByRole("navigation", { name: "Lenguaje del progreso" }).getByRole("link", { name: "JavaScript", exact: true }).click();
  await expect(history.locator("article")).toHaveCount(1);
  await expect(history.getByRole("button", { name: /Prueba UX 1.*En progreso.*1 intento/ })).toBeVisible();
  await expect(page.locator("dl dd").first()).toHaveText(/0\s*\/\s*\d+/);
  await page.screenshot({ path: ".local/screenshots/ux-progress-desktop.png", fullPage: true });
});

for (const theme of ["light", "dark"] as const) test(`jerarquía, acordeones y reflujo sin perder código: ${theme}`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/rutas/desde-cero?lenguaje=typescript");
    await expect(page.locator(".route-outline")).toHaveCount(0);
    const modules = page.locator(".route-module > div > h3 > button");
    await expect(modules.first()).toHaveAttribute("aria-expanded", "true");
    await expect(modules.nth(1)).toBeEnabled();
    await modules.nth(1).focus();
    await modules.nth(1).press("Enter");
    await expect(modules.nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(modules.first()).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.local/screenshots/ux-route-${theme}-${width}.png`, fullPage: true });
    await page.goto(`/ejercicios/${exercises[0].slug}?lenguaje=python`);
    if (width < 1200) await page.getByRole("button", { name: "Código", exact: true }).click();
    await openSimpleEditor(page);
    await page.getByRole("textbox", { name: "Editor sencillo de Python" }).fill("# código conservado");
    if (width < 1200) await page.getByRole("button", { name: "Enunciado", exact: true }).click();
    await expect(page.getByRole("region", { name: "Guía de aprendizaje" })).toBeVisible();
    await page.getByRole("button", { name: "Mostrar una pista" }).click();
    await page.screenshot({ path: `.local/screenshots/ux-editor-${theme}-${width}.png`, fullPage: true });
    if (width < 1200) await page.getByRole("button", { name: "Código", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue("# código conservado");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto("/ejercicios");
    if (width < 768) await page.getByRole("button", { name: "Filtros", exact: true }).click();
    await page.screenshot({ path: `.local/screenshots/ux-catalog-${theme}-${width}.png`, fullPage: true });
  }
});
