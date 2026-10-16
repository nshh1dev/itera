import { expect, type Page } from "@playwright/test";

// La preferencia persiste al cambiar de ejercicio y recargar. No asumir que
// cada navegación vuelve a Monaco ni alternar a ciegas el estado del editor.
export async function openSimpleEditor(page: Page) {
  const toggle = page.getByRole("button", { name: /^(Editor sencillo|Usar editor avanzado)$/ });
  await expect(toggle).toBeVisible();
  if (await toggle.innerText() === "Editor sencillo") await toggle.click();
  await expect(toggle).toHaveText("Usar editor avanzado");
}
