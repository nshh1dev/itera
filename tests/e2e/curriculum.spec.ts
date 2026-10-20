import { test, expect } from "@playwright/test";
import { learningPaths } from "../../src/lib/learning-paths";
import { modulesForPath } from "../../src/lib/learning-modules";
import { openLearningHelp } from "../workspace";

for (const path of learningPaths) {
  test(`${path.title} presenta módulos y permite continuar sin bloqueos`, async ({ page }) => {
    await page.goto(`/rutas/${path.slug}?lenguaje=typescript`);
    for (const unit of modulesForPath(path.slug)) await expect(page.getByRole("button", { name: new RegExp(unit.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pon en práctica lo aprendido", exact: true })).toBeVisible();
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Abrir primer integrador", exact: true })).toBeVisible();
    const next = learningPaths.find(entry => entry.order > path.order);
    if (next) await expect(page.getByRole("link", { name: `Continuar con ${next.title}`, exact: true })).toHaveAttribute("href", `/rutas/${next.slug}?lenguaje=typescript`);
  });
}

test("TypeScript empieza con variables sin exigir JavaScript y conserva su espacio en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/ejercicios/logica-guarda-cantidad?lenguaje=typescript&ruta=desde-cero");
  await expect(page.getByRole("heading", { name: "Guarda una cantidad", exact: true })).toBeVisible();
  await openLearningHelp(page);
  await expect(page.getByText(/Entiende la idea/)).toBeVisible();
  await page.getByRole("button", { name: "Código", exact: true }).click();
  await expect(page.getByLabel("Lenguaje del ejercicio")).toHaveValue("typescript");
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Editor sencillo de TypeScript", exact: true })).toHaveValue(/puntos: number/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
