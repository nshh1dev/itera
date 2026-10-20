import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect, type BrowserContext } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `help-motion-${Date.now()}@example.test`;
let cookies: Awaited<ReturnType<BrowserContext["cookies"]>> = [];
test.beforeAll(async ({ request }) => {
  const response = await request.post("/api/auth/sign-up/email", { headers: { origin: "http://127.0.0.1:3000" }, data: { name: "Prueba de pistas", email, password: "Itera-help-motion-12345" } });
  expect(response.ok()).toBeTruthy();
  cookies = (await request.storageState()).cookies;
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
    const hints = page.getByRole("button", { name: "Pistas progresivas", exact: true });
    const solution = page.getByRole("button", { name: "Solución explicada", exact: true });
    await expect(hints).toHaveAttribute("aria-expanded", "false");
    await expect(solution).toHaveAttribute("aria-expanded", "false");
    const panel = page.getByRole("region", { name: "Pistas progresivas", exact: true });
    await hints.click();
    await panel.getByRole("button", { name: "Descubrir la primera pista" }).click();
    const firstHint = panel.getByRole("heading", { name: "Pista 1", exact: true });
    await expect(firstHint).toBeVisible();
    await firstHint.evaluate(node => node.setAttribute("data-preserved-hint", "true"));
    await panel.getByRole("button", { name: "Una pista más", exact: true }).click();
    await expect(panel.getByRole("heading", { name: "Pista 2", exact: true })).toBeVisible();
    await hints.click();
    await solution.click();
    const solutionPanel = page.getByRole("region", { name: "Solución explicada", exact: true });
    await expect(solutionPanel.locator("pre")).toHaveCount(0);
    await solutionPanel.getByRole("button", { name: "Ver solución explicada", exact: true }).click();
    await expect(solutionPanel.locator("pre")).toBeVisible();
    await expect(solutionPanel.getByText("Leer una solución no marca el ejercicio como resuelto.")).toBeVisible();
    await solution.click();
    await hints.click();
    await expect(firstHint).toBeVisible();
    await expect(firstHint).toHaveAttribute("data-preserved-hint", "true");
    await expect(editor).toHaveAttribute("data-preserved", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await mkdir(".local/screenshots", { recursive: true });
    await page.screenshot({ path: `.local/screenshots/help-inline-${width}-${height}-${theme}.png` });
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(0);
  });
}
