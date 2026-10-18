import { test, expect } from "@playwright/test";
import { openSimpleEditor } from "../workspace";

const exerciseUrl = "/ejercicios/suma-de-dos-numeros?lenguaje=python";

test("el enunciado y los ejemplos se pueden leer antes de ejecutar JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(exerciseUrl);
    await expect(page.getByRole("heading", { name: "Tu reto", exact: true })).toBeVisible();
    await expect(page.locator("#exercise-statement")).not.toBeEmpty();
    await expect(page.locator(".challenge-sheet")).toContainText("Ejemplo");
    await expect(page.getByRole("status")).toHaveText("Preparando tu editor…");
  } finally { await context.close(); }
});

test("Ir al código mueve el foco y conserva el borrador al volver y recargar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(exerciseUrl);
  await page.getByRole("button", { name: "Ir al código", exact: true }).click();
  await expect(page.locator("#workspace-code")).toContainText("Tu solución");
  await expect.poll(() => page.locator("#workspace-code").evaluate(panel => panel.contains(document.activeElement))).toBe(true);
  await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
  const code = "def solve(data):\n    return 123\n";
  await editor.fill(code);
  await page.getByRole("button", { name: "Enunciado", exact: true }).click();
  await page.getByRole("button", { name: "Ir al código", exact: true }).click();
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue(code);
  await page.reload();
  await page.getByRole("button", { name: "Ir al código", exact: true }).click();
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue(code);
});

for (const shortcut of ["Control+Enter", "Control+Shift+Enter", "Meta+Enter", "Meta+Shift+Enter"]) {
  test(`el editor sencillo permite ${shortcut} y conserva el código del invitado`, async ({ page }) => {
    await page.goto(exerciseUrl);
    await openSimpleEditor(page);
    const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
    const code = "def solve(data):\n    return 456\n";
    await editor.fill(code);
    await editor.press(shortcut);
    await expect(page).toHaveURL(/\/iniciar-sesion\?volver=/);
    const transfers = await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith("itera:transfer:")).map(key => sessionStorage.getItem(key)));
    expect(transfers).toContain(code);
  });
}

test("el arrastre confirma el tamaño al soltar y lo conserva al recargar", async ({ page }) => {
  await page.goto(exerciseUrl);
  const separator = page.getByRole("separator", { name: "Ajustar ancho de los paneles" });
  await expect(separator).toBeVisible();
  const rect = await separator.boundingBox();
  await page.mouse.move(rect!.x + rect!.width / 2, rect!.y + 60);
  await page.mouse.down();
  await page.mouse.move(rect!.x + 80, rect!.y + 60, { steps: 12 });
  await expect.poll(async () => Number(await separator.getAttribute("aria-valuenow"))).toBeGreaterThan(35);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("itera:workspace")!).width)).toBe(35);
  await page.mouse.up();
  const width = Number(await separator.getAttribute("aria-valuenow"));
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("itera:workspace")!).width)).toBe(width);
  await page.reload();
  await expect(separator).toHaveAttribute("aria-valuenow", String(width));
});
