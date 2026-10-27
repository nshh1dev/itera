import { test, expect } from "@playwright/test";
import { languages } from "../../src/lib/types";

for (const language of languages) test(`la ayuda esencial y avanzada se separa sin revelar soluciones en ${language}`, async ({ page }) => {
  await page.goto(`/ejercicios/logica-dos-parametros?lenguaje=${language}&ruta=desde-cero`);
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Comprobar solución", exact: true })).toHaveCount(1);
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const body = getComputedStyle(document.body);
    return { applied: body.fontFamily, local: body.getPropertyValue("--font-source-sans").trim() };
  });
  expect(fonts.local).not.toBe("");
  const firstFamily = (value: string) => value.split(",")[0].trim().replace(/^["']|["']$/g, "");
  expect(firstFamily(fonts.applied)).toBe(firstFamily(fonts.local));
  const help = page.locator(".workspace-reference");
  await expect(help.locator(".arc-disclosure-trigger")).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Condiciones del ejercicio", exact: true })).toBeVisible();
  for (const name of ["Comprender la idea", "Pistas progresivas"]) await expect(help.getByRole("button", { name, exact: true })).toHaveCount(0);
  await expect(help.getByRole("region", { name: "Teoría y ejemplo" })).toBeVisible();
  await expect(help.getByRole("region", { name: "Teoría y ejemplo" }).locator("pre")).not.toBeEmpty();
  await expect(page.getByRole("dialog", { name: "Solución explicada", exact: true })).toHaveCount(0);
  await expect(help.getByRole("button", { name: "Ver solución explicada", exact: true })).toBeVisible();
  await help.getByRole("button", { name: "Mostrar una pista", exact: true }).click();
  await expect(help.getByRole("heading", { name: "Pista 1", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver a la ruta", exact: true })).toHaveAttribute("href", `/rutas/desde-cero?lenguaje=${language}`);
});
