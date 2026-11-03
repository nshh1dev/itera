import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 768, 1024, 1199, 1440]) {
    test(`JSON Python anidado conserva lectura y anchura: ${theme}, ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      await page.goto("/ejercicios/logica-copia-anidada?lenguaje=python");
      const example = page.locator(".example-panel").first();
      await expect(example).toBeVisible();
      const input = example.locator("pre").nth(0);
      const output = example.locator("pre").nth(1);
      await expect(input).toContainText('"matriz"');
      const inputText = (await input.textContent())!;
      const outputText = (await output.textContent())!;
      expect(inputText).toBe(JSON.stringify(JSON.parse(inputText), null, 2));
      expect(outputText).toBe(JSON.stringify(JSON.parse(outputText), null, 2));
      expect(JSON.parse(outputText)).toHaveProperty("original");
      expect(JSON.parse(outputText)).toHaveProperty("copia");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await example.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      await expect(page.getByRole("button", { name: "Mostrar una pista", exact: true })).toBeVisible();
    });
  }
}

for (const language of ["javascript", "typescript"] as const) {
  test(`los ejemplos de ${language} mantienen el JSON compacto`, async ({ page }) => {
    await page.goto(`/ejercicios/logica-copia-anidada?lenguaje=${language}`);
    const input = page.locator(".example-panel").first().locator("pre").first();
    await expect(input).toBeVisible();
    const text = (await input.textContent())!;
    expect(text).toBe(JSON.stringify(JSON.parse(text)));
  });
}

test("PROGRAM Python conserva salida literal sin comillas ni formato JSON", async ({ page }) => {
  await page.goto("/ejercicios/logica-saludo?lenguaje=python");
  const output = page.getByRole("region", { name: "Salida esperada", exact: true }).locator("pre");
  await expect(output).toBeVisible();
  expect(await output.textContent()).toBe("Hola, mundo!\n");
});
