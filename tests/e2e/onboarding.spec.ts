import { test, expect } from "@playwright/test";
import { exerciseHref, foundationSteps, intermediateSteps, introductorySteps } from "../../src/lib/learning-paths";
import { openLearningHelp, openSimpleEditor } from "../workspace";

test("Desde cero ofrece módulos progresivos y comienza con un programa completo", async ({ page }) => {
  await page.goto("/rutas/desde-cero");
  await expect(page.getByRole("heading", { name: "Desde cero", exact: true })).toBeVisible();
  const steps = page.locator('.route-module').getByRole('link');
  await expect(page.getByRole("region", { name: "Siguiente ejercicio de la ruta" }).getByRole("link", { name: "Abrir ejercicio" })).toHaveAttribute("href", exerciseHref(introductorySteps[0], "python", "desde-cero"));
  await expect(steps).toHaveCount(introductorySteps.length);
  await expect(steps.first()).toHaveAttribute("href", /imprime-un-saludo/);
  await expect(steps.last()).toHaveAttribute("href", /presupuesto-de-merienda/);
  await expect(steps.first()).toHaveAttribute("href", /ruta=desde-cero/);
  await steps.first().click();
  await expect(page).toHaveURL(/\/ejercicios\/imprime-un-saludo/);
  await expect(page.getByRole("heading", { name: "Tu primer programa", level: 1, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tu reto", exact: true })).toBeVisible();
  await openLearningHelp(page);
  await expect(page.getByText(/Entiende la idea/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Antes de empezar", exact: true })).toHaveAttribute("aria-expanded", "true");
  await openSimpleEditor(page);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue(/Escribe tu primer programa/);
});

test("Construye tus bases enseña condiciones y recorridos antes de los retos", async ({ page }) => {
  await page.goto("/rutas/primeros-pasos");
  const steps = page.locator('.route-module').getByRole('link');
  await expect(steps).toHaveCount(foundationSteps.length);
  expect(await steps.evaluateAll(links => links.map(link => link.getAttribute("href"))))
    .toEqual(foundationSteps.map(slug => exerciseHref(slug, "python", "primeros-pasos")));
  await expect(steps.first()).toHaveAttribute("href", /compara-con-cero/);
  await expect(steps.last()).toHaveAttribute("href", /resumen-de-mediciones/);
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
    await openSimpleEditor(page);
    const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
    await expect(editor).toHaveValue(language === "python" ? /range\(1, data \+ 1\)/ : /numero <= data/);
    await expect(editor).toHaveValue(language === "python" ? /resultado.append\(0\)/ : /resultado.push\(0\)/);
    await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/primeros-pasos?lenguaje=${language}`);
  });
}

test("la plantilla guiada también está disponible en JavaScript", async ({ page }) => {
  await page.goto("/ejercicios/cambia-un-numero?lenguaje=javascript");
  await expect(page.getByRole("heading", { name: "Cambia un número", exact: true })).toBeVisible();
  await openSimpleEditor(page);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de JavaScript" })).toHaveValue(/Cambia solo el 7 por un 10/);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de JavaScript" })).toHaveValue(/return 7/);
});

for (const language of ["python", "javascript"] as const) {
  test(`las actividades circulares presentan resto y recorrido desde otro índice en ${language}`, async ({ page }) => {
    const lessons = [
      { slug: "reduce-vueltas-completas", title: "Las vueltas que sobran", code: "pasos % 2", route: "primeros-pasos" },
      { slug: "siguiente-indice-circular", title: "Después del último, el primero", code: "indice + 0", route: "pensar-en-soluciones" },
      { slug: "recorre-en-circulo", title: "Empieza en otra posición", code: "indice = 0", route: "pensar-en-soluciones" },
    ];
    for (const lesson of lessons) {
      await page.goto(exerciseHref(lesson.slug, language, lesson.route));
      await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
      await openLearningHelp(page);
      await expect(page.getByRole("region", { name: "Guía de aprendizaje" }).locator("li").first()).toBeVisible();
      await openSimpleEditor(page);
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/${lesson.route}?lenguaje=${language}`);
    }
  });
}

test("Conecta las ideas introduce los conceptos antes de sus retos", async ({ page }) => {
  await page.goto("/rutas/pensar-en-soluciones");
  await expect(page.getByRole("heading", { name: "Conecta las ideas", exact: true })).toBeVisible();
  const steps = page.locator('.route-module').getByRole('link');
  await expect(steps).toHaveCount(intermediateSteps.length);
  expect(await steps.evaluateAll(links => links.map(link => link.getAttribute("href"))))
    .toEqual(intermediateSteps.map(slug => exerciseHref(slug, "python", "pensar-en-soluciones")));
  await steps.first().click();
  await page.getByLabel("Lenguaje del ejercicio").selectOption("javascript");
  await expect(page).toHaveURL(/lenguaje=javascript&ruta=pensar-en-soluciones/);
  await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", "/rutas/pensar-en-soluciones?lenguaje=javascript");
});

for (const language of ["python", "javascript"] as const) {
  test(`las actividades de búsqueda presentan while, índices y límites en ${language}`, async ({ page }) => {
    const lessons = [
      { slug: "repite-con-while", title: "Repite mientras se cumpla", code: "contador + 2", route: "primeros-pasos" },
      { slug: "recorre-por-indices", title: "Visita cada posición", code: "data[0]", route: "primeros-pasos" },
      { slug: "punto-medio-del-intervalo", title: "Una posición en el centro", code: language === "python" ? "// 1" : "/ 1", route: "pensar-en-soluciones" },
      { slug: "descarta-una-mitad", title: "Descarta una mitad", code: "derecha = centro + 1", route: "pensar-en-soluciones" },
    ];
    for (const lesson of lessons) {
      await page.goto(exerciseHref(lesson.slug, language, lesson.route));
      await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
      await openLearningHelp(page);
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.locator("li").first()).toBeVisible();
      await openSimpleEditor(page);
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/${lesson.route}?lenguaje=${language}`);
    }
  });
}

for (const language of ["python", "javascript"] as const) {
  test(`las actividades de máximos muestran su guía y ausencia explícita en ${language}`, async ({ page }) => {
    const lessons = [
      { slug: "maximo-de-una-lista", title: "Conserva el mayor", code: "numero < mayor", route: "primeros-pasos" },
      { slug: "primer-valor-o-ausencia", title: "Cuando no hay un valor", code: "return 0", route: "primeros-pasos" },
      { slug: "maximo-bajo-un-limite", title: "El mayor por debajo del límite", code: "numero <= limite", route: "pensar-en-soluciones" },
    ];
    for (const lesson of lessons) {
      await page.goto(exerciseHref(lesson.slug, language, lesson.route));
      await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
      await openLearningHelp(page);
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.locator("li").first()).toBeVisible();
      await openSimpleEditor(page);
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code));
      if (lesson.slug === "maximo-bajo-un-limite") {
        await expect(editor).toHaveValue(language === "python" ? /candidato is None/ : /candidato === null/);
      }
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/${lesson.route}?lenguaje=${language}`);
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
      await openLearningHelp(page);
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.getByRole("heading", { name: "Qué vas a practicar" })).toBeVisible();
      await expect(guide.locator("li").first()).toBeVisible();
      await openSimpleEditor(page);
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/pensar-en-soluciones?lenguaje=${language}`);
    }
  });
}

for (const language of ["python", "javascript"] as const) {
  test(`las actividades de textos muestran filtros y comparaciones en ${language}`, async ({ page }) => {
    const lessons = [
      { slug: "quita-los-espacios", title: "Conserva lo que no es espacio", code: language === "python" ? "letra == ' '" : "letra === ' '", route: "primeros-pasos" },
      { slug: "filtra-letras-y-digitos", title: "Solo letras y dígitos", code: "abcdefghijklmnopqrstuvwxyz'", route: "primeros-pasos" },
      { slug: "compara-dos-textos", title: "¿Son el mismo texto?", code: language === "python" ? "return False" : "return false", route: "primeros-pasos" },
      { slug: "compara-contadores", title: "Las mismas cantidades", code: "primero > segundo", route: "pensar-en-soluciones" },
    ];
    for (const lesson of lessons) {
      await page.goto(exerciseHref(lesson.slug, language, lesson.route));
      await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
      await openLearningHelp(page);
      const guide = page.getByRole("region", { name: "Guía de aprendizaje" });
      await expect(guide.locator("li").first()).toBeVisible();
      await openSimpleEditor(page);
      const editor = page.getByRole("textbox", { name: `Editor sencillo de ${language === "python" ? "Python" : "JavaScript"}` });
      await expect(editor).toHaveValue(new RegExp(lesson.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/${lesson.route}?lenguaje=${language}`);
    }
  });
}
