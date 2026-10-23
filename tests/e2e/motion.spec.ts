import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect, type BrowserContext } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { openLearningHelp, openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `motion-${Date.now()}@example.test`;
let cookies: Awaited<ReturnType<BrowserContext["cookies"]>> = [];

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
    test(`Configuración navega como página y conserva cambios entre secciones: ${theme}, ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
      await db.user.update({ where: { email }, data: { name: "Prueba de movimiento" } });
      await page.context().addCookies(cookies);
      await page.goto("/inicio");
      await page.getByRole("button", { name: "Mi cuenta", exact: true }).click();
      await page.getByRole("menuitem", { name: "Configuración", exact: true }).click();
      await expect(page).toHaveURL(/\/configuracion$/);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.getByLabel("Nombre", { exact: true }).fill("Edición sin guardar");
      const sections = page.getByRole("navigation", { name: "Secciones de configuración" });
      await sections.getByRole("link", { name: "Apariencia", exact: true }).click();
      await expect(sections.getByRole("link", { name: "Apariencia", exact: true })).toHaveAttribute("aria-current", "page");
      await page.goBack();
      await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Edición sin guardar");
      await page.getByRole("button", { name: "Guardar nombre", exact: true }).click();
      await expect(page.getByRole("status")).toHaveText("Tu nombre está actualizado.");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      await mkdir(".local/screenshots", { recursive: true });
      await page.screenshot({ path: `.local/screenshots/motion-settings-${theme}-${width}.png`, animations: "disabled" });
      await page.reload();
      await expect(page.getByRole("heading", { level: 1, name: "Configuración", exact: true })).toBeVisible();
      await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Edición sin guardar");
    });
  }
}

test("el cierre Arc desvanece el diálogo de seguridad y devuelve el foco", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/configuracion?seccion=seguridad");
  const trigger = page.getByRole("button", { name: "Cambiar contraseña", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Cambiar contraseña", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("transform", "none");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/\/configuracion\?seccion=seguridad$/);
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
  await summary.press("Enter");
  await expect(summary).toHaveAttribute("aria-expanded", initial === "true" ? "false" : "true");
  await summary.press("Enter");
  await expect(summary).toHaveAttribute("aria-expanded", initial!);
  await expect(page.locator(".monaco-editor")).toBeVisible();
});

test("volver de Configuración recupera el borrador del taller", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
  await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
  await editor.fill("# borrador conservado al navegar");
  await expect(page.getByText("Guardado", { exact: true })).toBeVisible();
  const settings = page.getByRole("link", { name: "Configuración", exact: true });
  await settings.focus(); await settings.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Configuración" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goBack();
  await expect(editor).toHaveValue("# borrador conservado al navegar");
});

test("cambiar a movimiento reducido durante una apertura termina el diálogo sin bloqueo", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/configuracion?seccion=seguridad");
  const trigger = page.getByRole("button", { name: "Cambiar contraseña", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Cambiar contraseña", exact: true });
  await expect(dialog).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(dialog).toHaveCSS("transform", "none");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
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

test("Configuración desde el menú móvil cierra el menú y abre la página", async ({ page }) => {
  await page.context().addCookies(cookies);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/inicio");
  await page.getByRole("button", { name: "Abrir navegación", exact: true }).click();
  await page.getByRole("dialog", { name: "Navegación de Itera" }).getByRole("link", { name: "Configuración", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Configuración" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Secciones de configuración" })).toBeVisible();
});
