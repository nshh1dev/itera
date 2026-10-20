import { expect, type Page } from "@playwright/test";

export async function openLearningHelp(page: Page) {
  for (const name of ["Comprender la idea"]) {
    const summary = page.getByRole("button", { name, exact: true });
    await expect(summary).toBeVisible();
    if (await summary.getAttribute("aria-expanded") !== "true") await summary.click();
  }
  await expect(page.getByRole("region", { name: "Guía de aprendizaje" })).toBeVisible();
}

// La preferencia persiste al cambiar de ejercicio y recargar. No asumir que
// cada navegación vuelve a Monaco ni alternar a ciegas el estado del editor.
export async function openSimpleEditor(page: Page) {
  const toggle = page.getByRole("button", { name: /^(Editor sencillo|Usar editor avanzado)$/ });
  await expect(toggle).toBeVisible();
  if (await toggle.innerText() === "Editor sencillo") await toggle.click();
  await expect(toggle).toHaveText("Usar editor avanzado");
}
