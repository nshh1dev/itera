import "dotenv/config";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { openLearningHelp, openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `impeccable-${Date.now()}@example.test`;

test.afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});

test("la ayuda llega cerrada y se descubre con teclado sin perder código", async ({ page }) => {
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
  const summary = page.getByText("Contexto y ayuda", { exact: true });
  await expect(summary.locator("..")).not.toHaveAttribute("open");
  await expect(page.getByRole("heading", { name: "Tu reto", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver pistas", exact: true })).toBeVisible();
  await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python", exact: true });
  await editor.fill("def solve(data):\n    return data['a'] + data['b']");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Guía de aprendizaje" })).toBeVisible();
  await summary.click();
  await expect(editor).toHaveValue(/return data\['a'\] \+ data\['b'\]/);
  await openLearningHelp(page);
});

test("la demo muestra la sustitución numérica sin evaluar código ni repetir animaciones con movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#demo-a").fill("-2");
  await page.locator("#demo-b").fill("7");
  await page.getByRole("button", { name: "Probar entrada" }).click();
  await expect(page.locator(".landing-demo-trace")).toHaveText("La misma idea, con tus números-2 + 7 → 5");
  await expect(page.locator("output")).toHaveText("5");
  await expect(page.locator(".landing-demo-trace p")).toHaveCSS("animation-duration", "0s");
  await page.locator("#demo-a").fill("3");
  await page.locator("#demo-b").fill("2");
  await page.getByRole("button", { name: "Probar entrada" }).click();
  await expect(page.locator(".landing-demo-trace code")).toHaveText("3 + 2 → 5");
  await page.locator("#demo-a").fill("");
  await page.getByRole("button", { name: "Probar entrada" }).click();
  await expect(page.locator("#demo-error")).toContainText("Introduce dos enteros");
  await expect(page.locator(".landing-demo-trace")).toBeEmpty();
});

for (const width of [390, 1440]) {
  test(`sesión y recuperación conservan un h1 antes de los encabezados secundarios a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/iniciar-sesion", "/registro", "/recuperar-cuenta", "/restablecer-contrasena"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const levels = await page.locator("h1,h2,h3").evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => Number(node.tagName.slice(1))));
      expect(levels[0]).toBe(1);
      for (let index = 1; index < levels.length; index++) expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1);
    }
  });
}

test("el recorrido conserva el lenguaje elegido al regresar al índice", async ({ page }) => {
  await page.goto("/rutas/desde-cero?lenguaje=typescript");
  await page.getByRole("link", { name: "Todas las rutas" }).click();
  await expect(page).toHaveURL(/\/rutas\?lenguaje=typescript$/);
  await expect(page.locator('a.path-map-entry[href^="/rutas/desde-cero?"]')).toHaveAttribute("href", /lenguaje=typescript/);
});

test("una cuenta nueva entiende el progreso y distingue cambios pendientes de preferencias guardadas", async ({ page }) => {
  const signup = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { email, password: "Itera-impeccable-12345", name: "Prueba Impeccable" },
  });
  expect(signup.ok(), await signup.text()).toBe(true);
  await page.goto("/progreso");
  await expect(page.getByRole("heading", { name: "Tu primer intento cuenta" })).toBeVisible();
  await page.getByRole("link", { name: "Cambiar lenguaje preferido" }).click();
  const panel = page.getByRole("dialog", { name: "Configuración", exact: true });
  await expect(panel).toBeVisible();
  await panel.getByLabel("Nombre", { exact: true }).fill("Prueba editada");
  await expect(panel.getByText("Cambios sin guardar", { exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await expect(panel.getByRole("status")).toHaveText("Tus preferencias están guardadas.");
  await panel.getByLabel("Nombre", { exact: true }).fill("Otro cambio");
  await expect(panel.getByRole("status")).toHaveCount(0);
  await expect(panel.getByText("Cambios sin guardar", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/progreso$/);
});
