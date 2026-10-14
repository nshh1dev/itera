import { test, expect } from "@playwright/test";

test("Desde cero ofrece ocho pasos y comienza con un programa completo", async ({ page }) => {
  await page.goto("/rutas/desde-cero");
  await expect(page.getByRole("heading", { name: "Desde cero", exact: true })).toBeVisible();
  const steps = page.locator('a[href^="/ejercicios/"]');
  await expect(steps).toHaveCount(8);
  await expect(steps.first()).toHaveAttribute("href", /tu-primer-resultado/);
  await expect(steps.last()).toHaveAttribute("href", /suma-de-dos-numeros/);
  await expect(steps.first()).toHaveAttribute("href", /ruta=desde-cero/);
  await steps.first().click();
  await expect(page.getByRole("heading", { name: "Tu primer resultado", exact: true })).toBeVisible();
  await expect(page.getByText(/No necesitas saber programar todavía/)).toBeVisible();
  await expect(page.locator("details").filter({ has: page.locator("summary", { hasText: "Antes de empezar" }) })).toHaveAttribute("open", "");
  await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue(/return 7/);
});

test("Construye tus bases enseña condiciones y recorridos antes de los retos", async ({ page }) => {
  await page.goto("/rutas/primeros-pasos");
  const steps = page.locator('a[href^="/ejercicios/"]');
  await expect(steps).toHaveCount(13);
  await expect(steps.first()).toHaveAttribute("href", /compara-con-cero/);
  await expect(steps.last()).toHaveAttribute("href", /fizzbuzz/);
  await steps.first().click();
  await page.getByLabel("Lenguaje del ejercicio").selectOption("javascript");
  await expect(page).toHaveURL(/lenguaje=javascript&ruta=primeros-pasos/);
  await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", "/rutas/primeros-pasos?lenguaje=javascript");
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  await expect(page).toHaveURL(/iniciar-sesion/);
  const returnTo = new URL(page.url()).searchParams.get("volver");
  expect(returnTo).toBe("/ejercicios/compara-con-cero?lenguaje=javascript&ruta=primeros-pasos");
});

test("la plantilla guiada también está disponible en JavaScript", async ({ page }) => {
  await page.goto("/ejercicios/cambia-un-numero?lenguaje=javascript");
  await expect(page.getByRole("heading", { name: "Cambia un número", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Editor sencillo de JavaScript" })).toHaveValue(/Cambia solo el 7 por un 10/);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de JavaScript" })).toHaveValue(/return 7/);
});
