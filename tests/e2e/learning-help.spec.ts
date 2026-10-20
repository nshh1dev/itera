import { test, expect } from "@playwright/test";
import { languages } from "../../src/lib/types";

for (const language of languages) test(`la ayuda esencial y avanzada se separa sin revelar soluciones en ${language}`, async ({ page }) => {
  await page.goto(`/ejercicios/logica-dos-parametros?lenguaje=${language}&ruta=desde-cero`);
  const help = page.locator(".workspace-reference");
  await expect(help.locator(".arc-disclosure-trigger")).toHaveCount(3);
  await expect(page.getByRole("region", { name: "Condiciones del ejercicio", exact: true })).toBeVisible();
  for (const name of ["Comprender la idea", "Pistas progresivas", "Solución explicada"]) await expect(help.getByRole("button", { name, exact: true })).toHaveAttribute("aria-expanded", "false");
  const understand = help.getByRole("button", { name: "Comprender la idea", exact: true });
  await understand.focus();
  await understand.press("Enter");
  await expect(help.getByRole("region", { name: "Teoría y ejemplo" })).toBeVisible();
  await expect(help.getByRole("region", { name: "Teoría y ejemplo" }).locator("pre")).not.toBeEmpty();
  await understand.press("Enter");
  await expect(understand).toBeFocused();
  await help.getByRole("button", { name: "Solución explicada", exact: true }).click();
  const solution = page.getByRole("region", { name: "Solución explicada", exact: true });
  await expect(solution.locator("pre")).toHaveCount(0);
  await expect(solution.getByRole("button", { name: "Ver solución explicada", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver a la ruta", exact: true })).toHaveAttribute("href", `/rutas/desde-cero?lenguaje=${language}`);
});
