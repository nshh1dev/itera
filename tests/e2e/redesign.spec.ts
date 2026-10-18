import { mkdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { openLearningHelp } from "../workspace";

const screens = ["/", "/inicio", "/ejercicios", "/rutas", "/rutas/desde-cero", "/progreso", "/iniciar-sesion", "/registro", "/recuperar-cuenta"];

for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`el rediseño conserva contenido y reflujo: ${theme}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await mkdir(".local/screenshots", { recursive: true });
      for (const path of screens) {
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("lang", "es");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), { message: `${path} sin desbordamiento` }).toBeTruthy();
        if (path !== "/" && [390, 1440].includes(width)) {
          await page.screenshot({ path: `.local/screenshots/redesign-${path.slice(1).replaceAll("/", "-")}-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
        }
        if (path === "/") {
          await expect(page.locator(".landing-code")).toHaveCSS("font-size", "14px");
          await page.getByRole("button", { name: "Probar entrada" }).click();
          await expect(page.getByRole("status").filter({ hasText: "Suma calculada" })).toBeVisible();
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `.local/screenshots/redesign-landing-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
        }
        // Ampliación real del texto raíz: los tamaños rem deben crecer y el contenido refluir.
        await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const layout = await page.evaluate(() => {
          const fits = document.documentElement.scrollWidth <= innerWidth;
          const overflow = fits ? [] : [...document.querySelectorAll("body *")].filter(element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.right > innerWidth + 1; }).slice(0, 12).map(element => `${element.tagName}.${element.className}: ${Math.round(element.getBoundingClientRect().right)}px`);
          return { fits, overflow };
        });
        expect.soft(layout.fits, `${path} con texto al 200%: ${layout.overflow.join(", ")}`).toBeTruthy();
      }
    });
  }
}

test("los accesos de teclado y las ayudas tienen nombres claros", async ({ page }) => {
  await page.goto("/inicio");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
  const hints = page.getByRole("button", { name: "Ver pistas", exact: true });
  await hints.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Pistas y solución" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(hints).toBeFocused();
  await page.getByText("Atajos de teclado", { exact: true }).click();
  await expect(page.getByText("Ctrl / ⌘ + Enter: ejecutar ejemplos.", { exact: false })).toBeVisible();
});

for (const theme of ["light", "dark"] as const) {
  test(`el taller conserva espacio de código en ventana baja y consulta separada: ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 650 });
    await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await openLearningHelp(page);
    await expect(page.getByRole("heading", { name: "Aprende mientras practicas" })).toBeVisible();
    await expect(page.locator(".editor-region")).toBeVisible();
    await expect(page.getByRole("button", { name: "Comprobar solución", exact: true })).toBeInViewport();
    const editor = await page.locator(".editor-region").boundingBox();
    expect(editor!.height).toBeGreaterThanOrEqual(140);
    await expect(page.locator(".monaco-editor")).toBeVisible();
    await page.screenshot({ path: `.local/screenshots/redesign-workspace-${theme}-1440.png`, fullPage: true, animations: "disabled" });
    await page.setViewportSize({ width: 390, height: 700 });
    await page.getByRole("button", { name: "Código", exact: true }).click();
    await expect(page.locator(".editor-region")).toBeVisible();
    await expect(page.getByRole("button", { name: "Comprobar solución", exact: true })).toBeVisible();
    await page.screenshot({ path: `.local/screenshots/redesign-workspace-${theme}-390.png`, fullPage: true, animations: "disabled" });
  });
}
