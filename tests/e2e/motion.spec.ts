import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect, type BrowserContext } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { openLearningHelp } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `motion-${Date.now()}@example.test`;
let cookies: Awaited<ReturnType<BrowserContext["cookies"]>> = [];

// Fotograma muestreado durante la salida de Arc, sin geometría del sistema retirado.
type Frame = { overlay: number | null; region: number };

test.beforeAll(async ({ request }) => {
  const signup = await request.post("/api/auth/sign-up/email", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { email, password: "Itera-motion-12345", name: "Prueba de movimiento" },
  });
  expect(signup.ok(), await signup.text()).toBeTruthy();
  cookies = (await request.storageState()).cookies;
});

test.afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`Configuración conserva origen, borrador, historial y página directa: ${theme}, ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
      await db.user.update({ where: { email }, data: { name: "Prueba de movimiento" } });
      await page.context().addCookies(cookies);
      await page.goto("/inicio");
      const origin = page.getByRole("button", { name: "Mi cuenta", exact: true });
      await origin.click();
      await page.getByRole("menuitem", { name: "Configuración", exact: true }).click();
      await expect(page).toHaveURL(/\/configuracion$/);
      const dialog = page.getByRole("dialog", { name: "Configuración", exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("transform", "none");
      await expect(dialog.getByLabel("Nombre", { exact: true })).toHaveValue("Prueba de movimiento");
      await dialog.getByLabel("Nombre", { exact: true }).fill("Edición sin guardar");
      await page.keyboard.press("Escape");
      await expect(page).toHaveURL(/\/inicio$/);
      await expect(dialog).toHaveCount(0);
      await expect(origin).toBeFocused();
      await page.goForward();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByLabel("Nombre", { exact: true })).toHaveValue("Edición sin guardar");
      await dialog.getByRole("button", { name: "Guardar cambios", exact: true }).click();
      await expect(dialog.getByRole("status")).toHaveText("Tus preferencias están guardadas.");
      await dialog.evaluate(async node => { await Promise.all(node.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))); });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      await mkdir(".local/screenshots", { recursive: true });
      await page.screenshot({ path: `.local/screenshots/motion-settings-${theme}-${width}.png` });
      await page.reload();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1, name: "Configuración", exact: true })).toBeVisible();
      await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Edición sin guardar");
    });
  }
}

test("el cierre Arc desvanece el fondo sin repetir la entrada del contenido y devuelve el foco", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/inicio");
  const origin = page.getByRole("button", { name: "Mi cuenta", exact: true });
  await origin.click();
  await page.getByRole("menuitem", { name: "Configuración", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Configuración", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("transform", "none");
  await expect(page.locator(".dialog-overlay")).toHaveCSS("opacity", "1");
  await page.evaluate(() => {
    const collected: Frame[] = [];
    (window as unknown as { __close: Frame[] }).__close = collected;
    const sample = () => {
      const overlay = document.querySelector(".dialog-overlay");
      const region = document.querySelector("main > div");
      collected.push({ overlay: overlay ? Number(getComputedStyle(overlay).opacity) : null, region: region ? Number(getComputedStyle(region).opacity) : 1 });
      if (overlay) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  const frames = await page.evaluate(() => (window as unknown as { __close: Frame[] }).__close);
  // El fondo se desvanece sin recuperar opacidad antes de desmontarse.
  const overlays = frames.flatMap(frame => frame.overlay === null ? [] : [frame.overlay]);
  expect(overlays.length).toBeGreaterThan(1);
  for (let index = 1; index < overlays.length; index++) expect(overlays[index], `fotograma ${index}`).toBeLessThanOrEqual(overlays[index - 1] + 0.01);
  // Abrir y cerrar un panel interceptado no vuelve a presentar el contenido del shell.
  expect(frames.every(frame => frame.region === 1)).toBe(true);
  await expect(origin).toBeFocused();
});

test("pistas y detalles permiten invertir la apertura sin perder el editor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
  await expect(page.locator(".monaco-editor")).toBeVisible();
  const trigger = page.getByRole("button", { name: "Pistas progresivas", exact: true });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await openLearningHelp(page);
  const summary = page.getByRole("button", { name: "Comprender la idea", exact: true });
  const initial = await summary.getAttribute("aria-expanded");
  await summary.focus();
  // El contenido que se contrae puede desplazar el botón bajo el puntero.
  // El teclado invierte el estado durante la animación sin depender de coordenadas.
  await summary.press("Enter");
  await expect(summary).toHaveAttribute("aria-expanded", initial === "true" ? "false" : "true");
  await summary.press("Enter");
  await expect(summary).toHaveAttribute("aria-expanded", initial!);
  await expect(page.locator(".monaco-editor")).toBeVisible();
});

test("Configuración superpuesta conserva Monaco y el código del taller", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
  const editor = page.locator(".monaco-editor");
  await expect(editor).toBeVisible();
  await editor.evaluate(node => node.setAttribute("data-motion-preserved", "true"));
  const settings = page.getByRole("link", { name: "Configuración", exact: true });
  // El indicador de desarrollo de Next puede superponerse a la esquina inferior.
  await settings.focus();
  await settings.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Configuración", exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBeTruthy();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/ejercicios\/logica-dos-parametros\?lenguaje=python$/);
  await expect(editor).toHaveAttribute("data-motion-preserved", "true");
  await expect(settings).toBeFocused();
});

test("cambiar a movimiento reducido durante una apertura la termina sin bloqueo", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/inicio");
  await page.getByRole("button", { name: "Mi cuenta", exact: true }).click();
  await page.getByRole("menuitem", { name: "Configuración", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Configuración", exact: true });
  await expect(dialog).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(dialog).toHaveCSS("transform", "none");
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(dialog).toHaveCount(0);
});

test("movimiento reducido permite abrir y cerrar sin transformaciones espaciales", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
  const trigger = page.getByRole("button", { name: "Pistas progresivas", exact: true });
  await trigger.click();
  const content = page.getByRole("region", { name: "Pistas progresivas", exact: true });
  await expect(content).toBeVisible();
  await expect(content).toHaveCSS("transform", "none");
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("Configuración desde el menú móvil restaura un control visible aunque desaparezca su origen", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/inicio");
  const menu = page.getByRole("button", { name: "Abrir navegación", exact: true });
  await menu.click();
  await page.getByRole("dialog", { name: "Navegación de Itera" }).getByRole("link", { name: "Configuración", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Configuración", exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Navegación de Itera" })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const focused = document.activeElement;
    return focused instanceof HTMLElement && ["Mi cuenta", "Abrir navegación", "Configuración"].includes(focused.getAttribute("aria-label") ?? "") && focused.getClientRects().length > 0;
  })).toBeTruthy();
});
