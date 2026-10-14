import { test, expect } from "@playwright/test";
import { exerciseHref, foundationSteps, intermediateSteps } from "../../src/lib/learning-paths";

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

test("Conecta las ideas introduce estructuras, textos y máximos antes de sus retos", async ({ page }) => {
  await page.goto("/rutas/pensar-en-soluciones");
  await expect(page.getByRole("heading", { name: "Conecta las ideas", exact: true })).toBeVisible();
  const steps = page.locator('a[href^="/ejercicios/"]');
  await expect(steps).toHaveCount(intermediateSteps.length);
  expect(await steps.evaluateAll(links => links.map(link => link.getAttribute("href"))))
    .toEqual(intermediateSteps.map(slug => exerciseHref(slug, "python", "pensar-en-soluciones")));
  await steps.first().click();
  await page.getByLabel("Lenguaje del ejercicio").selectOption("javascript");
  await expect(page).toHaveURL(/lenguaje=javascript&ruta=pensar-en-soluciones/);
  await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", "/rutas/pensar-en-soluciones?lenguaje=javascript");
});

for (const language of ["python", "javascript"] as const) {
  test(`las actividades de máximos muestran su guía y ausencia explícita en ${language}`, async ({ page }) => {
    const lessons = [
      { slug: "maximo-de-una-lista", title: "Conserva el mayor", code: "numero < mayor" },
      { slug: "primer-valor-o-ausencia", title: "Cuando no hay un valor", code: "return 0" },
      { slug: "maximo-bajo-un-limite", title: "El mayor por debajo del límite", code: "numero <= limite" },
    ];
    for (const lesson of lessons) {
      await page.goto(exerciseHref(lesson.slug, language, "pensar-en-soluciones"));
      await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.locator("li").first()).toBeVisible();
      await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code));
      if (lesson.slug === "maximo-bajo-un-limite") {
        await expect(editor).toHaveValue(language === "python" ? /candidato is None/ : /candidato === null/);
      }
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/pensar-en-soluciones?lenguaje=${language}`);
    }
  });
}

for (const language of ["python", "javascript"] as const) {
  test(`las cuatro actividades de colecciones muestran su guía y plantilla en ${language}`, async ({ page }) => {
    const lessons = [
      { slug: "pertenece-al-conjunto", title: "¿Está en el conjunto?", code: language === "python" ? "return False" : "return false;" },
      { slug: "cuenta-valores-distintos", title: "Recuerda cada valor una vez", code: "vistos.add(0)" },
      { slug: "guarda-con-una-clave", title: "Guarda un valor con nombre", code: "marcas[data] = 0" },
      { slug: "incrementa-contadores", title: "Un contador por letra", code: "frecuencias[letra] + 0" },
    ];
    for (const lesson of lessons) {
      await page.goto(exerciseHref(lesson.slug, language, "pensar-en-soluciones"));
      await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.getByRole("heading", { name: "Qué vas a practicar" })).toBeVisible();
      await expect(guide.locator("li").first()).toBeVisible();
      await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/pensar-en-soluciones?lenguaje=${language}`);
    }
  });
}

for (const language of ["python", "javascript"] as const) {
  test(`las actividades de textos muestran filtros y comparaciones en ${language}`, async ({ page }) => {
    const lessons = [
      { slug: "quita-los-espacios", title: "Conserva lo que no es espacio", code: language === "python" ? "letra == ' '" : "letra === ' '" },
      { slug: "filtra-letras-y-digitos", title: "Solo letras y dígitos", code: "abcdefghijklmnopqrstuvwxyz'" },
      { slug: "compara-dos-textos", title: "¿Son el mismo texto?", code: language === "python" ? "return False" : "return false" },
      { slug: "compara-contadores", title: "Las mismas cantidades", code: "primero > segundo" },
    ];
    for (const lesson of lessons) {
      await page.goto(exerciseHref(lesson.slug, language, "pensar-en-soluciones"));
      await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.locator("li").first()).toBeVisible();
      await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/pensar-en-soluciones?lenguaje=${language}`);
    }
  });
}
