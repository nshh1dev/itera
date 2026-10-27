import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "../e2e/auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const password = "Itera-diagnostico-12345";
const ids: string[] = [];

async function account(page: Page, onboardingStep = 0) {
  const id = randomUUID(), email = `aprendizaje-${id}@example.test`;
  ids.push(id);
  await db.user.create({ data: { id, email, name: "Prueba Aprendizaje", onboardingStep, accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: await hashPassword(password) } } } });
  const response = await postAuth(page.request, "/api/auth/sign-in/email", { email, password });
  expect(response.ok(), await response.text()).toBeTruthy();
  return id;
}

test.afterEach(async () => {
  await db.auditLog.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  ids.length = 0;
});
test.afterAll(async () => { await db.$disconnect(); });

for (const [theme, width] of [["light", 1440], ["dark", 390]] as const) {
  test(`bienvenida saltable, preferencias por lenguaje y configuración completa: ${theme}`, async ({ page }) => {
    const userId = await account(page, 2);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/bienvenida");
    await expect(page.getByRole("heading", { name: "Aprende a tu manera" })).toBeVisible();
    await page.getByRole("radio", { name: /Intermedio/ }).check();
    await mkdir(".local/screenshots", { recursive: true });
    await page.screenshot({ path: `.local/screenshots/onboarding-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
    await page.getByRole("button", { name: "Guardar y continuar" }).click();
    await expect(page.getByRole("heading", { name: "Descubre tu nivel", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Atrás", exact: true }).click();
    await expect(page.getByRole("radio", { name: /Intermedio/ })).toBeChecked();
    await page.getByRole("button", { name: "Guardar y continuar" }).click();
    await page.getByRole("button", { name: "Saltar diagnóstico" }).click();
    await expect(page.getByRole("heading", { name: "Tu punto de partida" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Conecta las ideas" })).toBeVisible();
    expect(await db.progress.count({ where: { userId } })).toBe(0);
    await page.getByRole("button", { name: "Empezar mi ruta" }).click();
    await expect(page).toHaveURL(/\/rutas\/pensar-en-soluciones\?lenguaje=python/);
    expect((await db.user.findUniqueOrThrow({ where: { id: userId } })).onboardingStep).toBe(0);
    await page.goto("/inicio");
    await expect(page.getByRole("region", { name: "Tu ruta", exact: true }).getByRole("heading", { name: "Conecta las ideas", exact: true })).toBeVisible();
    await page.goto("/configuracion?seccion=aprendizaje");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const sections = page.getByRole("navigation", { name: "Secciones de configuración" });
    await page.getByLabel("Lenguaje preferido").selectOption("typescript");
    await expect(page.getByRole("radio", { name: /Intermedio/ })).not.toBeChecked();
    await page.getByRole("radio", { name: /Nunca he programado/ }).check();
    await page.getByRole("button", { name: "Guardar preferencias" }).click();
    await expect(page.getByRole("status")).toContainText("Tu progreso no ha cambiado");
    await page.getByLabel("Lenguaje preferido").selectOption("python");
    await expect(page.getByRole("radio", { name: /Intermedio/ })).toBeChecked();
    await sections.getByRole("link", { name: "Mi cuenta", exact: true }).click();
    await page.getByLabel("Nombre", { exact: true }).fill("Cambio pendiente");
    await sections.getByRole("link", { name: "Apariencia", exact: true }).click();
    await page.getByRole("button", { name: theme === "dark" ? "Oscuro" : "Claro", exact: true }).click();
    await sections.getByRole("link", { name: "Mi cuenta", exact: true }).click();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Cambio pendiente");
    await sections.getByRole("link", { name: "Aprendizaje", exact: true }).click();
    await expect(page.getByLabel("Lenguaje preferido")).toHaveValue("python");
    await page.screenshot({ path: `.local/screenshots/settings-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const profiles = await db.learningProfile.findMany({ where: { userId }, orderBy: { language: "asc" } });
    expect(profiles.map(profile => [profile.language, profile.declaredLevel])).toEqual([["python", "INTERMEDIATE"], ["typescript", "INITIATION"]]);
    await page.reload();
    await expect(page.getByLabel("Lenguaje preferido")).toHaveValue("typescript");
    await page.goto("/bienvenida");
    await expect(page).toHaveURL(/\/configuracion\?seccion=aprendizaje/);
  });
}

test("diagnóstico real aislado: casos ocultos, propiedad, idempotencia y repetición", async ({ page, browser }) => {
  let executor = false;
  try { executor = (await fetch(`${process.env.PISTON_URL || "http://127.0.0.1:2000"}/api/v2/runtimes`, { signal: AbortSignal.timeout(2500) })).ok; } catch { /* La suite real no sustituye Piston por un doble. */ }
  test.skip(!executor, "Piston no está disponible.");
  const userId = await account(page);
  await db.learningProfile.create({ data: { userId, language: "python", declaredLevel: "BEGINNER" } });
  await db.userPreference.create({ data: { userId, language: "python", level: "BEGINNER" } });
  await page.goto("/configuracion?seccion=aprendizaje");
  await page.evaluate(() => localStorage.setItem("itera:workspace", JSON.stringify({ fontSize: 18, width: 40, simple: false, resultsHeight: 280 })));
  await page.getByRole("button", { name: "Repetir diagnóstico" }).click();
  await expect(page).toHaveURL(/\/diagnostico\//);
  const id = new URL(page.url()).pathname.split("/").at(-1)!;
  const diagnostic = await db.diagnostic.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { position: "asc" }, include: { variant: true } } } });
  await page.getByRole("button", { name: "Editor sencillo", exact: true }).click();
  for (const item of diagnostic.items.slice(0, 2)) {
    await expect(page.getByRole("textbox", { name: "Código del diagnóstico" })).toHaveCSS("font-size", "18px");
    await page.getByRole("textbox", { name: "Código del diagnóstico" }).fill(item.variant.solution);
    await page.getByRole("button", { name: "Comprobar respuesta", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Reto de diagnóstico superado." })).toBeVisible({ timeout: 60000 });
    if (item.position === 0) await page.getByRole("button", { name: "Siguiente reto" }).click();
  }
  const submission = await db.submission.findFirstOrThrow({ where: { userId, diagnosticItemId: diagnostic.items[1].id, mode: "submit" } });
  const retry = await page.request.post("/api/executions", { headers: { origin: "http://127.0.0.1:3000" }, data: { variantId: submission.variantId, diagnosticItemId: submission.diagnosticItemId, mode: "submit", code: submission.code, idempotencyKey: submission.idempotencyKey } });
  expect(retry.status()).toBe(202); expect((await retry.json()).id).toBe(submission.id);
  const conflicting = await page.request.post("/api/executions", { headers: { origin: "http://127.0.0.1:3000" }, data: { variantId: submission.variantId, mode: "submit", code: submission.code, idempotencyKey: submission.idempotencyKey } });
  expect(conflicting.status()).toBe(409);
  const payload = await (await page.request.get(`/api/executions/${submission.id}`)).json();
  const hidden = payload.results.filter((result: { visible: boolean }) => !result.visible);
  expect(hidden.length).toBeGreaterThan(0);
  for (const result of hidden) for (const field of ["input", "expected", "actual", "output", "error"]) expect(result).not.toHaveProperty(field);
  expect(await db.progress.count({ where: { userId } })).toBe(0);
  expect(await db.draft.count({ where: { userId } })).toBe(0);
  expect(await db.practiceContext.count({ where: { userId } })).toBe(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("itera:workspace")!))).toMatchObject({ fontSize: 18, width: 40, resultsHeight: 280, simple: true });
  await mkdir(".local/screenshots", { recursive: true });
  await page.screenshot({ path: ".local/screenshots/diagnostic-desktop.png", fullPage: true, animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.screenshot({ path: ".local/screenshots/diagnostic-mobile.png", fullPage: true, animations: "disabled" });
  const other = await browser.newContext();
  try {
    const otherPage = await other.newPage(); await account(otherPage);
    const forbidden = await otherPage.request.post("/api/executions", { headers: { origin: "http://127.0.0.1:3000" }, data: { variantId: submission.variantId, diagnosticItemId: submission.diagnosticItemId, mode: "submit", code: submission.code, idempotencyKey: randomUUID() } });
    expect(forbidden.status()).toBe(404);
    expect((await otherPage.request.get(`/api/executions/${submission.id}`)).status()).toBe(404);
  } finally { await other.close(); }
  await page.getByRole("button", { name: "Ver mi recomendación" }).click();
  await expect(page).toHaveURL(/\/configuracion\?seccion=aprendizaje/);
  const finished = await db.diagnostic.findUniqueOrThrow({ where: { id } });
  expect(finished.finishedAt).not.toBeNull(); expect(finished.suggestedLevel).toBe("BEGINNER");
  await page.getByRole("button", { name: "Repetir diagnóstico" }).click();
  await expect(page).toHaveURL(/\/diagnostico\//);
  expect(new URL(page.url()).pathname).not.toBe(`/diagnostico/${id}`);
  expect(await db.diagnostic.count({ where: { userId } })).toBe(2);
  const repeatedId = new URL(page.url()).pathname.split("/").at(-1)!;
  const repeatedItem = await db.diagnosticItem.findFirstOrThrow({ where: { diagnosticId: repeatedId, position: 0 } });
  const editor = page.getByRole("textbox", { name: "Código del diagnóstico" });
  await editor.fill("# copia local independiente");
  await expect(page.getByRole("status").filter({ hasText: "Diagnóstico guardado." })).toBeVisible();
  await page.reload();
  await expect(editor).toHaveValue("# copia local independiente");
  await db.diagnosticItem.update({ where: { id: repeatedItem.id }, data: { code: "# revisión de otra pestaña", revision: { increment: 1 } } });
  await editor.fill("# edición local ante un conflicto");
  await expect(page.getByRole("status").filter({ hasText: "El diagnóstico cambió en otra pestaña" })).toBeVisible();
  expect((await db.diagnosticItem.findUniqueOrThrow({ where: { id: repeatedItem.id } })).code).toBe("# revisión de otra pestaña");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).code, `itera:diagnostic:${userId}:${repeatedItem.id}`)).toBe("# edición local ante un conflicto");
  await page.getByRole("button", { name: "Terminar sin continuar" }).click();
  await expect(page).toHaveURL(/\/configuracion\?seccion=aprendizaje/);
  expect(await db.progress.count({ where: { userId } })).toBe(0);
});
