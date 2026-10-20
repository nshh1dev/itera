import { test, expect } from "@playwright/test";
import { exerciseHref, learningPaths } from "../../src/lib/learning-paths";
import { logicExercises } from "../../prisma/logic-content";
import { languageNames, languages } from "../../src/lib/types";
import { openLearningHelp, openSimpleEditor } from "../workspace";

// Requiere el catálogo nuevo activado. No publica contenido usando el doble HTTP.
for (const path of learningPaths) for (const language of languages) {
  test(`${path.title} mantiene todos sus pasos en orden en ${languageNames[language]}`, async ({ page }) => {
    await page.goto(`/rutas/${path.slug}?lenguaje=${language}`);
    await expect(page.getByRole("heading", { name: path.title, exact: true })).toBeVisible();
    for (const trigger of await page.locator(".route-module > div > h3 > button").all()) if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
    const steps = page.locator(".route-module").getByRole("link");
    await expect(steps).toHaveCount(path.slugs!.length);
    expect(await steps.evaluateAll(links => links.map(link => link.getAttribute("href"))))
      .toEqual(path.slugs!.map(slug => exerciseHref(slug, language, path.slug)));
    await expect(page.getByRole("region", { name: "Siguiente ejercicio de la ruta" }).getByRole("link", { name: "Abrir ejercicio" }))
      .toHaveAttribute("href", exerciseHref(path.slugs![0], language, path.slug));
    // Acceso libre: el último reto se puede abrir sin resolver ninguno.
    await steps.last().click();
    await expect(page.getByRole("heading", { level: 1, name: logicExercises.find(e => e.slug === path.slugs!.at(-1))!.title, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/${path.slug}?lenguaje=${language}`);
  });
}

test("Desde cero es Iniciación y comienza con un programa completo", async ({ page }) => {
  await page.goto("/rutas/desde-cero");
  await expect(page.getByText("Iniciación · Fundamentos de programación y algoritmos", { exact: true })).toBeVisible();
  await page.locator(".route-module").getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Muestra un saludo", exact: true })).toBeVisible();
  await openLearningHelp(page);
  await expect(page.getByRole("region", { name: "Teoría y ejemplo" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Condiciones del ejercicio", exact: true })).toBeVisible();
  await openSimpleEditor(page);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue(logicExercises[0].starters!.python);
});

test("cambiar de lenguaje conserva el reto, su posición y la ruta", async ({ page }) => {
  const slug = "logica-dos-parametros";
  await page.goto(exerciseHref(slug, "python", "desde-cero"));
  const exercise = logicExercises.find(e => e.slug === slug)!;
  for (const language of languages) {
    await page.getByLabel("Lenguaje del ejercicio").selectOption(language);
    await expect(page).toHaveURL(exerciseHref(slug, language, "desde-cero"));
    await expect(page.getByRole("heading", { name: exercise.title, exact: true })).toBeVisible();
    await openSimpleEditor(page);
    await expect(page.getByRole("textbox", { name: `Editor sencillo de ${languageNames[language]}` })).toHaveValue(exercise.starters![language]!);
    await expect(page.getByRole("link", { name: "Ejercicio siguiente", exact: true })).toHaveAttribute("href", exerciseHref("logica-imprimir-devolver", language, "desde-cero"));
  }
});

test("comprobar como invitado conserva el ejercicio y lenguaje al pedir iniciar sesión", async ({ page }) => {
  const href = exerciseHref("logica-elige-mensaje", "typescript", "primeros-pasos");
  await page.goto(href);
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  await expect(page).toHaveURL(/iniciar-sesion/);
  expect(new URL(page.url()).searchParams.get("volver")).toBe(href);
});
