import { mkdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`pistas sin scrollbar y filtros hacia abajo: ${theme}, ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 760 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
      await page.getByRole("button", { name: "Ver pistas", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Pistas y solución" });
      const tabs = dialog.getByRole("tablist");
      await expect(tabs).toHaveCSS("scrollbar-width", "none");
      await expect(tabs).toHaveCSS("overflow-y", "hidden");
      const height = await tabs.evaluate(node => node.clientHeight);
      const solution = dialog.getByRole("tab", { name: "Solución explicada" });
      await solution.click();
      await expect(solution).toHaveAttribute("aria-selected", "true");
      await expect.poll(() => tabs.evaluate(node => node.scrollHeight - node.clientHeight)).toBe(0);
      await expect(tabs).toHaveJSProperty("clientHeight", height);
      await solution.press("ArrowLeft");
      await expect(dialog.getByRole("tab", { name: "Pistas", exact: true })).toBeFocused();
      await page.keyboard.press("Escape");
      await page.goto("/ejercicios");
      if (width < 768) await page.getByRole("button", { name: /^Filtros/ }).click();
      for (const name of ["Lenguaje", "Nivel", "Categoría", "Estado"]) {
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
