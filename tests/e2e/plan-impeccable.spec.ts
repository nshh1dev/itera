import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { openLearningHelp, openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `impeccable-${Date.now()}@example.test`;
const matrixEmail = `python-superficies-${Date.now()}@example.test`;

test.afterAll(async () => {
  await db.user.deleteMany({ where: { email: { in: [email, matrixEmail] } } });
  await db.$disconnect();
});

test("la teoría es opcional y se pide una pista con teclado sin perder código", async ({ page }) => {
  await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
  const hint = page.getByRole("button", { name: "Mostrar una pista", exact: true });
  await expect(page.getByRole("region", { name: "Teoría y ejemplo" })).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "Tu reto", exact: true })).toBeVisible();
  await expect(hint).toBeVisible();
  await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python", exact: true });
  await editor.fill("def solve(data):\n    return data['a'] + data['b']");
  await hint.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Guía de aprendizaje" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pista 1", exact: true })).toBeVisible();
  await expect(editor).toHaveValue(/return data\['a'\] \+ data\['b'\]/);
  await openLearningHelp(page);
  await expect(page.getByRole("region", { name: "Teoría y ejemplo" })).toBeVisible();
});

test("la demo muestra la sustitución numérica sin evaluar código ni repetir animaciones con movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#demo-a").fill("-2");
  await page.locator("#demo-b").fill("7");
  await page.getByRole("button", { name: "Probar", exact: true }).click();
  await expect(page.locator(".landing-demo-trace")).toHaveText("La misma idea, con tus números-2 + 7 → 5");
  await expect(page.locator("output")).toHaveText("5");
  await expect(page.locator(".landing-demo-trace p")).toHaveCSS("animation-duration", "0s");
  await page.locator("#demo-a").fill("3");
  await page.locator("#demo-b").fill("2");
  await page.getByRole("button", { name: "Probar", exact: true }).click();
  await expect(page.locator(".landing-demo-trace code")).toHaveText("3 + 2 → 5");
  await page.locator("#demo-a").fill("");
  await page.getByRole("button", { name: "Probar", exact: true }).click();
  await expect(page.locator("#demo-error")).toContainText("Introduce dos enteros");
  await expect(page.locator(".landing-demo-trace")).toBeEmpty();
});

for (const width of [390, 1440]) {
  test(`sesión y recuperación conservan un h1 antes de los encabezados secundarios a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/iniciar-sesion", "/registro", "/recuperar-cuenta", "/restablecer-contrasena"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const levels = await page.locator("h1,h2,h3").evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => Number(node.tagName.slice(1))));
      expect(levels[0]).toBe(1);
      for (let index = 1; index < levels.length; index++) expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1);
    }
  });
}

test("el recorrido conserva el lenguaje elegido al regresar al índice", async ({ page }) => {
  await page.goto("/rutas/desde-cero?lenguaje=typescript");
  await page.getByRole("link", { name: "Todas las rutas" }).click();
  await expect(page).toHaveURL(/\/rutas\?lenguaje=typescript$/);
  await expect(page.locator('a.path-map-entry[href^="/rutas/desde-cero?"]')).toHaveAttribute("href", /lenguaje=typescript/);
});

test("una cuenta nueva entiende el progreso y distingue cambios pendientes de preferencias guardadas", async ({ page }) => {
  const signup = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { email, password: "Itera-impeccable-12345", name: "Prueba Impeccable" },
  });
  expect(signup.ok(), await signup.text()).toBe(true);
  await page.goto("/progreso");
  await expect(page.getByRole("heading", { name: "Aún no hay intentos en Python" })).toBeVisible();
  await page.getByRole("link", { name: "Configuración", exact: true }).click();
  await expect(page).toHaveURL(/\/configuracion$/);
  const account = page.getByRole("region", { name: "Mi cuenta", exact: true });
  await account.getByLabel("Nombre", { exact: true }).fill("Prueba editada");
  await account.getByRole("button", { name: "Guardar nombre", exact: true }).click();
  await expect(account.getByRole("status")).toHaveText("Tu nombre está actualizado.");
  await page.getByRole("navigation", { name: "Secciones de configuración" }).getByRole("link", { name: "Aprendizaje", exact: true }).click();
  const panel = page.getByRole("region", { name: "Aprendizaje", exact: true });
  await panel.getByRole("radio").first().check();
  await expect(panel.getByText("Cambios sin guardar", { exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Guardar preferencias", exact: true }).click();
  await expect(panel.getByRole("status")).toHaveText("Tus preferencias están guardadas. Tu progreso no ha cambiado.");
  await panel.getByLabel("Lenguaje preferido", { exact: true }).selectOption("javascript");
  await expect(panel.getByRole("status")).toHaveCount(0);
  await expect(panel.getByText("Cambios sin guardar", { exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Progreso", exact: true }).click();
  await expect(page).toHaveURL(/\/progreso$/);
});

test("configuración, cierre y repaso Python conservan reflujo, teclado y progreso en ambos temas", async ({ page }) => {
  test.setTimeout(180000);
  const signup = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { email: matrixEmail, password: "Itera-superficies-12345", name: "Revisión de superficies Python" },
  });
  expect(signup.ok(), await signup.text()).toBe(true);
  const user = await db.user.findUniqueOrThrow({ where: { email: matrixEmail } });
  const path = await db.learningPath.findUniqueOrThrow({ where: { slug: "desde-cero" }, select: { items: { select: { exerciseId: true } } } });
  expect(path.items.length).toBeGreaterThan(0);
  // Estado visual simulado solo para esta cuenta: no acredita una evaluación.
  await db.progress.createMany({ data: path.items.map(item => ({ userId: user.id, exerciseId: item.exerciseId, language: "python", attempts: 1, firstPassedAt: new Date() })) });
  const snapshot = () => db.progress.findMany({ where: { userId: user.id }, orderBy: { exerciseId: "asc" } });
  const before = await snapshot();
  const preferences = await db.userPreference.findUnique({ where: { userId: user.id } });
  await mkdir(".local/screenshots/python-superficies", { recursive: true });
  await page.goto("/configuracion");
  for (const theme of ["light", "dark"] as const) for (const width of [390, 768, 1024, 1199, 1440]) {
    await page.evaluate(value => localStorage.setItem("theme", value), theme);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    const capture = async (name: string) => {
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}, ${theme}, ${width}`).toBe(true);
      await page.screenshot({ path: `.local/screenshots/python-superficies/${name}-${theme}-${width}.png`, animations: "disabled" });
    };
    for (const [section, title] of [["cuenta", "Mi cuenta"], ["aprendizaje", "Aprendizaje"], ["apariencia", "Apariencia"]]) {
      await page.goto(`/configuracion?seccion=${section}`);
      const panel = page.getByRole("region", { name: title, exact: true });
      await expect(panel).toBeVisible();
      const navigation = page.getByRole("navigation", { name: "Secciones de configuración" });
      const link = navigation.getByRole("link", { name: title, exact: true });
      await expect(link).toHaveAttribute("aria-current", "page");
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe("none");
      await capture(section);
      // El recorte de 900 px no cubre seguridad/datos ni el final de Aprendizaje.
      await panel.screenshot({ path: `.local/screenshots/python-superficies/${section}-completo-${theme}-${width}.png`, animations: "disabled" });
    }
    await page.goto("/configuracion?seccion=seguridad");
    const password = page.getByRole("button", { name: "Cambiar contraseña", exact: true });
    await password.focus();
    await password.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Cambiar contraseña", exact: true });
    await expect(dialog.getByLabel("Contraseña actual")).toBeFocused();
    await expect(dialog).toHaveCSS("transform", "none");
    await capture("seguridad");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(password).toBeFocused();

    await page.goto("/rutas/desde-cero?lenguaje=python");
    const completion = page.getByRole("region", { name: "Ruta completada en Python", exact: true });
    await expect(completion).toContainText("El progreso en los otros lenguajes es independiente.");
    await expect(completion.getByRole("link", { name: "Cómo interpretar tu progreso", exact: true })).toHaveAttribute("href", "/progreso?lenguaje=python");
    await completion.scrollIntoViewIfNeeded();
    const interpretationBounds = (await completion.getByRole("link", { name: "Cómo interpretar tu progreso", exact: true }).boundingBox())!;
    const reviewBounds = (await completion.getByRole("link", { name: "Repasar lo aprendido", exact: true }).boundingBox())!;
    if (reviewBounds.y < interpretationBounds.y + interpretationBounds.height) {
      expect(reviewBounds.x - (interpretationBounds.x + interpretationBounds.width)).toBeGreaterThanOrEqual(16);
    } else {
      expect(reviewBounds.y).toBeGreaterThanOrEqual(interpretationBounds.y + interpretationBounds.height);
    }
    await capture("cierre");
    const reviewLink = completion.getByRole("link", { name: "Repasar lo aprendido", exact: true });
    await reviewLink.focus();
    await reviewLink.press("Enter");
    await expect(page.getByRole("heading", { name: "Pon en práctica lo aprendido", exact: true })).toBeFocused();
    const review = page.getByRole("button", { name: "Repasar por módulo", exact: true });
    await page.keyboard.press("Tab");
    await expect(review).toBeFocused();
    await review.press("Enter");
    await expect(review).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/Este repaso no marca ejercicios como completados:/)).toBeVisible();
    await capture("repaso");
    const reviewPanel = page.getByRole("region", { name: "Pon en práctica lo aprendido", exact: true });
    const criteria = reviewPanel.locator('section[aria-label^="Repaso:"] li');
    expect(await criteria.count()).toBeGreaterThan(0);
    // Todos los criterios se conservan visibles, no solo los del primer recorte.
    for (const criterion of await criteria.all()) await expect(criterion).toBeVisible();
    await reviewPanel.screenshot({ path: `.local/screenshots/python-superficies/repaso-completo-${theme}-${width}.png`, animations: "disabled" });
    await review.press("Enter");
    await expect(review).toHaveAttribute("aria-expanded", "false");
    await expect(review).toBeFocused();
    await page.getByRole("navigation", { name: "Lenguaje de la ruta" }).getByRole("link", { name: "JavaScript", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Ruta completada en/ })).toHaveCount(0);
    expect(await snapshot()).toEqual(before);
  }
  expect(await db.userPreference.findUnique({ where: { userId: user.id } })).toEqual(preferences);
  expect(await db.submission.count({ where: { userId: user.id } })).toBe(0);
});
