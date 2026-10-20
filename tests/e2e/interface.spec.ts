import { test, expect } from "@playwright/test";
import { openSimpleEditor } from "../workspace";

test("la sidebar se contrae, conserva la preferencia y mantiene navegación accesible", async ({ page }) => {
  await page.goto("/inicio");
  const sidebar = page.getByRole("complementary", { name: "Barra lateral" });
  await expect(sidebar).toHaveCSS("width", "224px");
  await page.getByRole("button", { name: "Contraer navegación", exact: true }).click();
  await expect(sidebar).toHaveCSS("width", "64px");
  const paths = page.getByRole("navigation", { name: "Navegación principal", exact: true }).getByRole("link", { name: "Rutas", exact: true });
  await paths.focus();
  await expect(paths.locator("..").locator(".navigation-tooltip")).toBeVisible();
  await paths.click();
  await expect(page).toHaveURL(/\/rutas$/);
  await page.reload();
  await expect(sidebar).toHaveCSS("width", "64px");
  await expect(paths).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Expandir navegación", exact: true }).click();
  await expect(sidebar).toHaveCSS("width", "224px");
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(sidebar).toHaveCSS("width", "64px");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(sidebar).toHaveCSS("width", "224px");
});

test("la navegación móvil se cierra al navegar y devuelve el foco con Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/inicio");
  const trigger = page.getByRole("button", { name: "Abrir navegación" });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Navegación de Itera" });
  await expect(drawer).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.goForward();
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await drawer.getByRole("link", { name: "Ejercicios", exact: true }).click();
  await expect(page).toHaveURL(/\/ejercicios$/);
  await expect(drawer).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.goBack();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(drawer).not.toBeVisible();
});

test("los filtros móviles muestran la selección y se pueden quitar sin cambiar de lenguaje", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ejercicios?lenguaje=javascript");
  await expect(page.getByLabel("Nivel", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  await page.getByLabel("Nivel", { exact: true }).selectOption("ADVANCED");
  await page.getByRole("button", { name: "Buscar ejercicios" }).click();
  await expect(page.getByRole("link", { name: "Quitar filtro: Avanzado", exact: true })).toBeVisible();
  await expect(page.getByLabel("Lenguaje", { exact: true })).toHaveValue("javascript");
  await page.getByRole("link", { name: "Quitar filtro: Avanzado", exact: true }).click();
  await expect(page.getByRole("link", { name: "Quitar filtro: Avanzado", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Lenguaje", { exact: true })).toHaveValue("javascript");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("el IDE permite ajustar paneles por teclado y colapsar los resultados", async ({ page }) => {
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await expect(page.locator(".monaco-editor-background").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const width = page.getByRole("separator", { name: "Ajustar ancho de los paneles" });
  await width.focus();
  await page.keyboard.press("ArrowRight");
  await expect(width).toHaveAttribute("aria-valuenow", "36");
  const height = page.getByRole("separator", { name: "Ajustar altura de resultados" });
  await height.focus();
  await page.keyboard.press("ArrowUp");
  await expect(height).toHaveAttribute("aria-valuenow", "260");
  await page.getByRole("button", { name: "Contraer resultados", exact: true }).click();
  await expect(page.getByText("Todo empieza con un intento.", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: "Expandir resultados", exact: true }).click();
  await expect(page.getByText("Todo empieza con un intento.", { exact: true })).toBeVisible();
  const editor = await page.locator(".editor-region").boundingBox();
  expect(editor!.width).toBeGreaterThanOrEqual(420);
  await page.screenshot({ path: ".local/screenshots/ui-workspace-light.png", fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Cambiar tema claro u oscuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator(".workspace-statement")).toHaveCSS("background-color", "rgb(22, 22, 24)");
  await expect(page.locator(".monaco-editor-background").first()).toHaveCSS("background-color", "rgb(28, 28, 30)");
  await page.screenshot({ path: ".local/screenshots/ui-workspace-dark.png", fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Cambiar tema claro u oscuro" }).click();
  await expect(page.locator(".monaco-editor-background").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("las opciones del editor y la confirmación conservan el código y restauran el foco", async ({ page }) => {
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
  await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
  const code = "def solve(data):\n    # Mi borrador\n    return 42\n";
  await editor.fill(code);
  const options = page.locator('summary[aria-label="Opciones del editor"]');
  await options.click();
  await page.getByRole("button", { name: "Aumentar tamaño del código" }).click();
  await expect(editor).toHaveCSS("font-size", "15px");
  await page.keyboard.press("Escape");
  await expect(options).toBeFocused();
  await options.click();
  await page.getByRole("button", { name: "Restablecer plantilla", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: ".local/screenshots/ui-confirmation.png", fullPage: true, animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(options).toBeFocused();
  await expect(editor).toHaveValue(code);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Cambiar tema claro u oscuro" }).click();
  await options.click();
  await page.getByRole("button", { name: "Restablecer plantilla", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCSS("background-color", "rgb(36, 36, 38)");
  await page.screenshot({ path: ".local/screenshots/ui-confirmation-dark.png", fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(editor).toHaveValue(code);
  await page.reload();
  await expect(page.getByRole("button", { name: "Usar editor avanzado", exact: true })).toBeVisible();
  await expect(editor).toHaveValue(code);
  await expect(editor).toHaveCSS("font-size", "15px");
});

test("las pantallas se adaptan sin desbordamientos y conservan el editor entre paneles", async ({ page }) => {
  for (const width of [320, 768, 1024, 1200]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("/ejercicios");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Catálogo a ${width}px`).toBeTruthy();
    await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=javascript");
    await expect(page.getByRole("heading", { name: "Dos números, una suma", exact: true })).toBeVisible();
    if (width < 1200) await page.getByRole("button", { name: "Código", exact: true }).click();
    await openSimpleEditor(page);
    const editor = page.getByRole("textbox", { name: "Editor sencillo de JavaScript" });
    await editor.fill("function solve(data) { return data.a + data.b; }");
    if (width < 1200) {
      await page.getByRole("button", { name: "Resultados", exact: true }).click();
      await page.getByRole("button", { name: "Código", exact: true }).click();
    }
    await expect(editor).toHaveValue("function solve(data) { return data.a + data.b; }");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Editor a ${width}px`).toBeTruthy();
    if (width === 320) await page.screenshot({ path: ".local/screenshots/ui-workspace-mobile.png", fullPage: true, animations: "disabled" });
  }
  await page.setViewportSize({ width: 1200, height: 620 });
  await expect(page.getByRole("button", { name: "Comprobar solución", exact: true })).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/inicio");
  await page.screenshot({ path: ".local/screenshots/ui-home-mobile.png", fullPage: true, animations: "disabled" });
});

test("las superficies y listas mantienen su jerarquía en ambos temas y tamaños", async ({ page }) => {
  const screens = [
    { path: "/inicio", title: "Empieza a practicar.", name: "home" },
    { path: "/ejercicios", title: "Ejercicios", name: "catalog" },
    { path: "/rutas", title: "Rutas", name: "paths" },
    { path: "/rutas/desde-cero", title: "Desde cero", name: "path" },
  ];
  for (const theme of ["light", "dark"]) {
    await page.goto("/inicio");
    if (theme === "dark") await page.getByRole("button", { name: "Cambiar tema claro u oscuro" }).click();
    for (const screen of screens) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(screen.path);
        await expect(page.getByRole("heading", { name: screen.title, exact: true })).toBeVisible();
        await expect(page.locator(".app-shell")).toHaveCSS("background-color", theme === "dark" ? "rgb(17, 17, 19)" : "rgb(240, 240, 243)");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${screen.path} ${theme} ${width}px`).toBeTruthy();
        await page.screenshot({ path: `.local/screenshots/ui-${screen.name}-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
      }
    }
  }
});
