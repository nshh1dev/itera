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

for (const width of [390, 1440]) {
  test(`mostrar pistas y solución no vuelve a abrir el diálogo: ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.context().addCookies(cookies);
    await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
    await page.getByRole("button", { name: "Ver pistas", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Pistas y solución" });
    await expect(dialog).toHaveCSS("transform", "none");
    const title = dialog.getByRole("heading", { name: "Pistas y solución" });
    const initialTop = (await title.boundingBox())!.y;
    await dialog.evaluate(node => {
      node.setAttribute("data-preserved", "true");
      const samples: { top: number; opacity: number; transform: string }[] = [];
      const sample = () => {
        const style = getComputedStyle(node);
        samples.push({ top: node.querySelector("h2")!.getBoundingClientRect().top, opacity: Number(style.opacity), transform: style.transform });
        frame = requestAnimationFrame(sample);
      };
      let frame = requestAnimationFrame(sample);
      Object.assign(window, { __helpMotion: { samples, stop: () => cancelAnimationFrame(frame) } });
    });
    await dialog.getByRole("button", { name: "Descubrir la primera pista" }).click();
    const firstHint = dialog.getByRole("heading", { name: "Pista 1", exact: true });
    await expect(firstHint).toBeVisible();
    await firstHint.evaluate(node => node.setAttribute("data-preserved-hint", "true"));
    await dialog.getByRole("tab", { name: "Solución explicada", exact: true }).click();
    await dialog.getByRole("button", { name: "Ver solución explicada", exact: true }).click();
    await expect(dialog.locator("pre")).toBeVisible();
    await mkdir(".local/screenshots", { recursive: true });
    await page.screenshot({ path: `.local/screenshots/help-stable-${width}.png` });
    await dialog.getByRole("tab", { name: "Pistas", exact: true }).click();
    await expect(firstHint).toBeVisible();
    await expect(firstHint).toHaveAttribute("data-preserved-hint", "true");
    await expect(dialog).toHaveAttribute("data-preserved", "true");
    const samples = await page.evaluate(() => {
      const state = (window as unknown as { __helpMotion: { samples: { top: number; opacity: number; transform: string }[]; stop: () => void } }).__helpMotion;
      state.stop();
      return state.samples;
    });
    expect(samples.length).toBeGreaterThan(0);
    expect(Math.max(...samples.map(sample => Math.abs(sample.top - initialTop)))).toBeLessThan(1);
    expect(samples.every(sample => sample.opacity === 1 && sample.transform === "none")).toBeTruthy();
  });
}
