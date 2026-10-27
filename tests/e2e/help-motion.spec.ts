import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect, type BrowserContext } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { postAuth } from "./auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `help-motion-${Date.now()}@example.test`;
let cookies: Awaited<ReturnType<BrowserContext["cookies"]>> = [];
test.beforeAll(async ({ request }) => {
  const response = await postAuth(request, "/api/auth/sign-up/email", { name: "Prueba de pistas", email, password: "Itera-help-motion-12345" });
  expect(response.ok(), await response.text()).toBeTruthy();
  cookies = (await request.storageState()).cookies;
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const variant = await db.exerciseVariant.findFirstOrThrow({ where: { language: "python", version: { published: true, exercise: { slug: "logica-dos-parametros" } } }, orderBy: { version: { number: "desc" } } });
  await db.submission.create({ data: { userId: user.id, variantId: variant.id, mode: "examples", status: "FAILED", code: "# intento de prueba", idempotencyKey: email, passedCount: 0, totalCount: 2 } });
});
test.afterAll(async () => { await db.user.deleteMany({ where: { email } }); await db.$disconnect(); });

for (const { width, height, theme } of [
  { width: 390, height: 900, theme: "dark" },
  { width: 1440, height: 900, theme: "light" },
  { width: 390, height: 480, theme: "light" },
  { width: 1440, height: 480, theme: "dark" },
] as const) {
  test(`ayuda progresiva conserva pistas, solución y editor: ${width}x${height}, ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
    await page.context().addCookies(cookies);
    await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
    const editor = page.locator(".monaco-editor");
    await expect(editor).toBeAttached();
    await editor.evaluate(node => node.setAttribute("data-preserved", "true"));
    const solution = page.getByRole("button", { name: "Ver solución explicada", exact: true });
    const help = page.locator(".workspace-reference");
    await expect(help.locator(".arc-disclosure-trigger")).toHaveCount(1);
    await expect(help.getByRole("region", { name: "Teoría y ejemplo" })).toBeVisible();
    await expect(help.getByRole("heading", { name: "Antes de empezar", exact: true })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Solución explicada", exact: true })).toHaveCount(0);
    const panel = page.getByRole("region", { name: "Pistas", exact: true });
    await panel.getByRole("button", { name: "Mostrar una pista" }).click();
    const firstHint = panel.getByRole("heading", { name: "Pista 1", exact: true });
    await expect(firstHint).toBeVisible();
    await firstHint.evaluate(node => node.setAttribute("data-preserved-hint", "true"));
    await panel.getByRole("button", { name: "Mostrar otra pista", exact: true }).click();
    await expect(panel.getByRole("heading", { name: "Pista 2", exact: true })).toBeVisible();
    const review = panel.getByRole("button", { name: "Revisar errores comunes", exact: true });
    if (await review.count()) {
      await expect(panel.getByRole("heading", { name: "Errores comunes", exact: true })).toHaveCount(0);
      await review.click();
      await expect(panel.getByRole("heading", { name: "Errores comunes", exact: true })).toBeVisible();
    }
    await solution.click();
    const solutionPanel = page.getByRole("dialog", { name: "Solución explicada", exact: true });
    await expect(solutionPanel.locator("pre")).toBeVisible();
    await expect(solutionPanel.getByText("Leer una solución no marca el ejercicio como resuelto.")).toBeVisible();
    await solutionPanel.getByRole("button", { name: "Cerrar", exact: true }).click();
    await expect(solution).toBeFocused();
    await expect(firstHint).toBeVisible();
    await expect(firstHint).toHaveAttribute("data-preserved-hint", "true");
    await expect(editor).toHaveAttribute("data-preserved", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await mkdir(".local/screenshots", { recursive: true });
    await page.screenshot({ path: `.local/screenshots/help-inline-${width}-${height}-${theme}.png` });
    await expect(page.locator("#workspace-statement #workspace-history")).toHaveCount(0);
    if (width < 1200) await page.getByRole("button", { name: "Resultados", exact: true }).click();
    const results = page.getByRole("region", { name: "Resultados de ejecución", exact: true });
    await expect(results.getByText("Aquí verás el resultado de tu código.", { exact: true })).toBeVisible();
    await expect(results.getByRole("button", { name: "Tus intentos en este ejercicio", exact: true })).toHaveCount(0);
    if (width < 1200) await page.getByRole("button", { name: "Código", exact: true }).click();
    await page.getByRole("button", { name: "Historial", exact: true }).click();
    const history = page.getByRole("dialog", { name: "Historial de este ejercicio", exact: true });
    await expect(history).toContainText("0/2 pruebas");
    await history.getByRole("button", { name: "Cerrar", exact: true }).click();
    await expect(editor).toHaveAttribute("data-preserved", "true");
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(0);
  });
}
