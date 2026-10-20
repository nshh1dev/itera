import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect, type BrowserContext } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `help-motion-${Date.now()}@example.test`;
let cookies: Awaited<ReturnType<BrowserContext["cookies"]>> = [];

test.beforeAll(async ({ request }) => {
  const response = await request.post("/api/auth/sign-up/email", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { name: "Prueba de pistas", email, password: "Itera-help-motion-12345" },
  });
  expect(response.ok()).toBeTruthy();
  cookies = (await request.storageState()).cookies;
});

test.afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});

for (const { width, height, theme } of [
  { width: 390, height: 900, theme: "dark" },
  { width: 1440, height: 900, theme: "light" },
  { width: 390, height: 480, theme: "light" },
  { width: 1440, height: 480, theme: "dark" },
] as const) {
  test(`pistas y solución conservan marco y pestañas: ${width}x${height}, ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "no-preference", colorScheme: theme });
    await page.context().addCookies(cookies);
    await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
    await page.getByRole("button", { name: "Ver pistas", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Pistas y solución" });
    await expect(dialog).toHaveCSS("transform", "none");
    const title = dialog.getByRole("heading", { name: "Pistas y solución" });
    const initialTop = (await title.boundingBox())!.y;
    const initialFrame = (await dialog.boundingBox())!;
    await dialog.evaluate(node => {
      node.setAttribute("data-preserved", "true");
      const samples: { top: number; opacity: number; transform: string; frame: { x: number; y: number; width: number; height: number } }[] = [];
      const sample = () => {
        const style = getComputedStyle(node);
        const { x, y, width, height } = node.getBoundingClientRect();
        samples.push({ top: node.querySelector("h2")!.getBoundingClientRect().top, opacity: Number(style.opacity), transform: style.transform, frame: { x, y, width, height } });
        frame = requestAnimationFrame(sample);
      };
      let frame = requestAnimationFrame(sample);
      Object.assign(window, { __helpMotion: { samples, stop: () => cancelAnimationFrame(frame) } });
    });
    await dialog.getByRole("button", { name: "Descubrir la primera pista" }).click();
    const firstHint = dialog.getByRole("heading", { name: "Pista 1", exact: true });
    await expect(firstHint).toBeVisible();
    await firstHint.evaluate(node => node.setAttribute("data-preserved-hint", "true"));
    await dialog.getByRole("button", { name: "Una pista más", exact: true }).click();
    await expect(dialog.getByRole("heading", { name: "Pista 2", exact: true })).toBeVisible();
    await dialog.getByRole("tab", { name: "Solución explicada", exact: true }).click();
    await dialog.getByRole("button", { name: "Ver solución explicada", exact: true }).click();
    await expect(dialog.locator("pre")).toBeVisible();
    await mkdir(".local/screenshots", { recursive: true });
    const solutionPanel = dialog.getByRole("tabpanel", { name: "Solución explicada", exact: true });
    await solutionPanel.evaluate(node => { node.scrollTop = node.scrollHeight; });
    await expect(title).toBeInViewport();
    await expect(dialog.getByRole("tablist")).toBeInViewport();
    await page.screenshot({ path: `.local/screenshots/help-stable-${width}-${height}-${theme}.png` });
    await dialog.getByRole("tab", { name: "Pistas", exact: true }).click();
    await expect(firstHint).toBeVisible();
    await expect(firstHint).toHaveAttribute("data-preserved-hint", "true");
    await expect(dialog).toHaveAttribute("data-preserved", "true");
    const samples = await page.evaluate(() => {
      const state = (window as unknown as { __helpMotion: { samples: { top: number; opacity: number; transform: string; frame: { x: number; y: number; width: number; height: number } }[]; stop: () => void } }).__helpMotion;
      state.stop();
      return state.samples;
    });
    expect(samples.length).toBeGreaterThan(0);
    expect(Math.max(...samples.map(sample => Math.abs(sample.top - initialTop)))).toBeLessThan(1);
    for (const dimension of ["x", "y", "width", "height"] as const) {
      expect(Math.max(...samples.map(sample => Math.abs(sample.frame[dimension] - initialFrame[dimension]))), `marco estable: ${dimension}`).toBeLessThan(1);
    }
    expect(samples.every(sample => sample.opacity === 1 && sample.transform === "none")).toBeTruthy();
  });
}
