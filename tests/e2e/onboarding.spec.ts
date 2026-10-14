import { test, expect } from "@playwright/test";
import { exerciseHref, foundationSteps } from "../../src/lib/learning-paths";

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
  await expect(steps).toHaveCount(foundationSteps.length);
  expect(await steps.evaluateAll(links => links.map(link => link.getAttribute("href"))))
    .toEqual(foundationSteps.map(slug => exerciseHref(slug, "python", "primeros-pasos")));
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

for (const language of ["python", "javascript"] as const) {
  test(`el recorrido numérico tiene una plantilla guiada válida en ${language}`, async ({ page }) => {
    await page.goto(exerciseHref("numeros-del-uno-al-n", language, "primeros-pasos"));
    await expect(page.getByRole("heading", { name: "Del uno al número recibido", exact: true })).toBeVisible();
    await expect(page.getByText(/el límite final de range se excluye/)).toBeVisible();
    await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
    const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
    await expect(editor).toHaveValue(language === "python" ? /range\(1, data \+ 1\)/ : /numero <= data/);
    await expect(editor).toHaveValue(language === "python" ? /resultado.append\(0\)/ : /resultado.push\(0\)/);
    await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/primeros-pasos?lenguaje=${language}`);
  });
}

test("la plantilla guiada también está disponible en JavaScript", async ({ page }) => {
  await page.goto("/ejercicios/cambia-un-numero?lenguaje=javascript");
  await expect(page.getByRole("heading", { name: "Cambia un número", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Editor sencillo de JavaScript" })).toHaveValue(/Cambia solo el 7 por un 10/);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de JavaScript" })).toHaveValue(/return 7/);
});
