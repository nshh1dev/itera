import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "../e2e/auth-request";
import { openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ids: string[] = [];
const password = "Itera-dashboard-12345";

async function account(page: Page) {
  const id = randomUUID(), email = `dashboard-${id}@example.test`;
  ids.push(id);
  await db.user.create({ data: { id, email, name: "Prueba Dashboard", accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: await hashPassword(password) } } }, });
  const response = await postAuth(page.request, "/api/auth/sign-in/email", { email, password });
  expect(response.ok(), await response.text()).toBeTruthy();
  return id;
}

test.afterEach(async () => { await db.user.deleteMany({ where: { id: { in: ids } } }); ids.length = 0; });
test.afterAll(async () => { await db.$disconnect(); });

for (const theme of ["light", "dark"] as const) {
  test(`dashboard: borrador, ruta y actividad sin redundancias en ${theme}`, async ({ page }) => {
    const userId = await account(page);
    const route = await db.learningPath.findFirstOrThrow({ orderBy: { order: "asc" }, include: { items: { orderBy: { position: "asc" }, include: { exercise: { include: { versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, include: { variants: { where: { language: "python" } } } } } } } } } });
    const available = route.items.filter(item => item.exercise.published && item.exercise.versions[0]?.variants[0]);
    expect(available.length).toBeGreaterThan(3);
    const [featured, pending, solved] = available;
    const variant = (item: typeof featured) => item.exercise.versions[0].variants[0].id;
    await db.userPreference.create({ data: { userId, language: "python", level: "INITIATION" } });
    await db.learningProfile.create({ data: { userId, language: "python", declaredLevel: "INITIATION" } });
    const recent = new Date("2026-10-23T12:00:00Z");
    await db.draft.createMany({ data: [
      { userId, variantId: variant(featured), code: "print('borrador principal')", updatedAt: recent },
      { userId, variantId: variant(pending), code: "print('borrador secundario')", updatedAt: new Date("2026-10-22T12:00:00Z") },
    ] });
    await db.practiceContext.create({ data: { userId, exerciseId: featured.exerciseId, language: "python", pathSlug: route.slug, visitedAt: recent } });
    await db.progress.create({ data: { userId, exerciseId: solved.exerciseId, language: "python", firstPassedAt: recent, attempts: 1 } });
    // Otro lenguaje no aumenta el avance de la ruta Python.
    await db.progress.create({ data: { userId, exerciseId: pending.exerciseId, language: "typescript", firstPassedAt: recent, attempts: 1 } });
    await db.submission.create({ data: { userId, variantId: variant(solved), code: "# fixture de actividad, no ejecutada", mode: "submit", status: "PASSED", idempotencyKey: randomUUID(), createdAt: new Date("2026-10-23T11:00:00Z"), finishedAt: recent, passedCount: 1, totalCount: 1, results: [] } });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/inicio");
    const next = page.getByRole("region", { name: "Tu siguiente paso", exact: true });
    const progress = page.getByRole("region", { name: "Tu ruta", exact: true });
    const activity = page.getByRole("region", { name: "Actividad reciente", exact: true });
    await expect(next.getByRole("heading", { name: featured.exercise.versions[0].title, exact: true })).toBeVisible();
    await expect(next.getByRole("link", { name: "Continuar ejercicio", exact: true })).toHaveAttribute("href", `/ejercicios/${featured.exercise.slug}?lenguaje=python&ruta=${route.slug}`);
    await expect(next.getByText("Python", { exact: true })).toBeVisible();
    await expect(next.getByText("Retoma el ejercicio que dejaste pendiente.")).toBeVisible();
    await expect(progress.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    await expect(progress.getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(available.length));
    await expect(activity.getByText(featured.exercise.versions[0].title, { exact: true })).toHaveCount(0);
    await expect(activity.getByRole("link", { name: `${solved.exercise.versions[0].title} Resuelto`, exact: true })).toBeVisible();
    await expect(activity.getByRole("link", { name: `${pending.exercise.versions[0].title} Pendiente`, exact: true })).toBeVisible();
    await expect(activity.getByRole("link", { name: "Ver historial completo" })).toHaveAttribute("href", "/progreso?lenguaje=python");
    await expect(page.getByRole("link", { name: "Ajustar mi aprendizaje" })).toHaveCount(0);
    await expect(page.getByText("Nivel declarado", { exact: true })).toHaveCount(0);
    await mkdir(".local/screenshots", { recursive: true });
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      await page.screenshot({ path: `.local/screenshots/dashboard-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const continueLink = next.getByRole("link", { name: "Continuar ejercicio" });
    await continueLink.focus();
    await expect(continueLink).toBeFocused();
    await continueLink.press("Enter");
    await expect(page.locator(".monaco-editor")).toBeVisible();
    await openSimpleEditor(page);
    await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue("print('borrador principal')");
    // Completar el destacado y el resto de pendientes hace que se proponga uno nuevo.
    await db.progress.createMany({ data: [featured, pending].map(item => ({ userId, exerciseId: item.exerciseId, language: "python", firstPassedAt: recent, attempts: 1 })) });
    await page.goto("/inicio");
    await expect(next.getByRole("heading", { name: available[3].exercise.versions[0].title, exact: true })).toBeVisible();
    await expect(next.getByRole("link", { name: "Empezar ejercicio", exact: true })).toBeVisible();
    await expect(progress.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  });
}

test("dashboard sin actividad y catálogo completado no confunden empezar con repasar", async ({ page }) => {
  const userId = await account(page);
  await page.goto("/inicio");
  const next = page.getByRole("region", { name: "Tu siguiente paso", exact: true });
  await expect(next.getByRole("link", { name: "Empezar ejercicio", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Actividad reciente" }).getByText(/Cuando practiques/)).toBeVisible();
  const exercises = await db.exercise.findMany({ where: { published: true, versions: { some: { published: true } } }, select: { id: true } });
  await db.progress.createMany({ data: exercises.map(exercise => ({ userId, exerciseId: exercise.id, language: "python", firstPassedAt: new Date(), attempts: 1 })) });
  await page.reload();
  await expect(next.getByRole("heading", { name: "Todo el catálogo completado" })).toBeVisible();
  await expect(next.getByRole("link", { name: "Empezar ejercicio", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Tu ruta" }).getByText("Ruta completada", { exact: true })).toBeVisible();
});
