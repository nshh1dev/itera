import { test, expect } from "@playwright/test";
import { learningPaths } from "../../src/lib/learning-paths";
import { modulesForPath } from "../../src/lib/learning-modules";

for (const path of learningPaths) {
  test(`${path.title} presenta módulos y permite continuar sin bloqueos`, async ({ page }) => {
    await page.goto(`/rutas/${path.slug}?lenguaje=typescript`);
    for (const unit of modulesForPath(path.slug)) await expect(page.getByRole("heading", { name: unit.title, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Estás preparado para continuar si puedes…", exact: true })).toBeVisible();
    await expect(page.getByRole("checkbox").first()).not.toBeChecked();
    await page.getByRole("checkbox").first().check();
    await expect(page.getByRole("checkbox").first()).toBeChecked();
    const next = learningPaths.find(entry => entry.order > path.order);
    if (next) await expect(page.getByRole("link", { name: `Continuar con ${next.title}`, exact: true })).toHaveAttribute("href", `/rutas/${next.slug}?lenguaje=typescript`);
  });
}

test("TypeScript empieza con variables sin exigir JavaScript y conserva su espacio en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/ejercicios/guarda-y-muestra?lenguaje=typescript&ruta=desde-cero");
  await expect(page.getByRole("heading", { name: "Un nombre para un valor", exact: true })).toBeVisible();
  await expect(page.getByText(/Entiende la idea/)).toBeVisible();
  await page.getByRole("button", { name: "Código", exact: true }).click();
  await expect(page.getByLabel("Lenguaje del ejercicio")).toHaveValue("typescript");
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Editor sencillo de TypeScript", exact: true })).toHaveValue(/puntos: number/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
