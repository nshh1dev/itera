import { mkdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`ayudas desplegables y filtros hacia abajo: ${theme}, ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 760 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
      const hints = page.getByRole("button", { name: "Antes de empezar", exact: true });
      await hints.focus();
      await hints.press("Enter");
      await expect(hints).toHaveAttribute("aria-expanded", "true");
      await hints.press("Enter");
      await expect(hints).toHaveAttribute("aria-expanded", "false");
      await expect(hints).toBeFocused();
      await page.goto("/ejercicios");
      if (width < 768) await page.getByRole("button", { name: /^Filtros/ }).click();
      for (const name of ["Lenguaje", "Nivel", "Categoría", "Estado", "Ordenar por"]) {
        const select = page.getByRole("combobox", { name, exact: true });
        await select.scrollIntoViewIfNeeded();
        await select.click();
        const first = select.getByRole("option").first();
        await expect(first).toBeVisible();
        const control = (await select.boundingBox())!;
        const option = (await first.boundingBox())!;
        expect(option.y, `${name} se abre debajo`).toBeGreaterThanOrEqual(control.y + control.height);
        await page.keyboard.press("Escape");
      }
      await mkdir(".local/screenshots", { recursive: true });
      await page.screenshot({ path: `.local/screenshots/controls-${theme}-${width}.png`, fullPage: true });
    });
  }
}
