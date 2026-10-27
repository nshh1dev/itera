import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { languages, languageNames } from "../../src/lib/types";
import { postAuth } from "../e2e/auth-request";
import { openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ids: string[] = [];
async function account(page: Page) {
  const id = randomUUID(), email = `educacion-${id}@example.test`, password = "Itera-educacion-12345";
  ids.push(id);
  await db.user.create({ data: { id, email, name: "Prueba Educación", accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: await hashPassword(password) } } } });
  const response = await postAuth(page.request, "/api/auth/sign-in/email", { email, password });
  expect(response.ok(), await response.text()).toBeTruthy();
  return id;
}
test.afterEach(async () => { await db.user.deleteMany({ where: { id: { in: ids } } }); ids.length = 0; });
test.afterAll(async () => { await db.$disconnect(); });

for (const language of languages) test(`cambio: ejemplos no completan y una respuesta fija no aprueba en ${language}`, async ({ page }) => {
  const userId = await account(page);
  await page.goto(`/ejercicios/logica-cambio?lenguaje=${language}`);
  await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: `Editor sencillo de ${languageNames[language]}` });
  const fixed = language === "python" ? "print(7)" : "console.log(7);";
  await editor.fill(fixed);
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toHaveCount(0);
  const variant = await db.exerciseVariant.findFirstOrThrow({ where: { language, version: { published: true, exercise: { slug: "logica-cambio" } } }, orderBy: { version: { number: "desc" } } });
  const examples = await page.request.post("/api/executions", { headers: { origin: "http://127.0.0.1:3000" }, data: { variantId: variant.id, code: fixed, mode: "examples", idempotencyKey: randomUUID() } });
  expect(examples.status()).toBe(202);
  const { id } = await examples.json();
  await expect.poll(async () => (await db.submission.findUniqueOrThrow({ where: { id } })).status, { timeout: 40000 }).toBe("PASSED");
  expect(await db.progress.count({ where: { userId } })).toBe(0);
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  await expect(page.getByRole("heading", { name: "La salida coincide; falta aplicar el concepto.", exact: true })).toBeVisible({ timeout: 40000 });
  await expect(page.getByText(/Calcula el cambio con una resta/)).toBeVisible();
  expect(await db.progress.count({ where: { userId, firstPassedAt: { not: null } } })).toBe(0);
  await editor.fill(language === "python" ? "coste = 13\nentregado = 20\nresto = entregado - coste\nprint(7)" : "const coste = 13, entregado = 20; const resto = entregado - coste; console.log(7);");
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  await expect.poll(() => db.submission.count({ where: { userId, mode: "submit", status: "FAILED" } })).toBe(2);
  expect(await db.progress.count({ where: { userId, firstPassedAt: { not: null } } })).toBe(0);
  await editor.fill(language === "python" ? "coste = 13\nentregado = 20\nresto = entregado - coste\nprint(resto)" : "const coste = 13, entregado = 20; const resto = entregado - coste; console.log(resto);");
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Un paso más. Ejercicio resuelto.", exact: true })).toBeVisible({ timeout: 40000 });
  const progress = await db.progress.findMany({ where: { userId } });
  expect(progress).toHaveLength(1);
  expect(progress[0].language).toBe(language);
  expect(progress[0].attempts).toBe(3);
  expect(progress[0].firstPassedAt).not.toBeNull();
});

for (const theme of ["light", "dark"] as const) test(`panel educativo: ayudas a demanda, salida única y solución oculta en ${theme}`, async ({ page }) => {
  await account(page);
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
  await page.goto("/ejercicios/logica-cambio?lenguaje=python");
  const statement = page.locator("#workspace-statement");
  await expect(statement.getByText("Práctica guiada", { exact: true })).toBeVisible();
  await expect(statement.getByRole("region", { name: "Salida esperada" })).toBeVisible();
  await expect(statement.getByText("Ejemplo 2", { exact: true })).toHaveCount(0);
  await expect(statement.getByText("(sin entrada)", { exact: true })).toHaveCount(0);
  await expect(statement.getByRole("button", { name: "Antes de empezar", exact: true })).toHaveAttribute("aria-expanded", "false");
  await expect(statement.getByRole("region", { name: "Teoría y ejemplo", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Solución explicada", exact: true })).toHaveCount(0);
  await expect(statement.getByText("precio = 13", { exact: false })).toHaveCount(0);
  await mkdir(".local/screenshots", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: `.local/screenshots/educacion-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
  }
  const solution = statement.getByRole("button", { name: "Ver solución explicada", exact: true });
  await solution.focus();
  await solution.press("Enter");
  await expect(page.getByRole("dialog", { name: "Solución explicada", exact: true }).locator("pre").filter({ hasText: "precio = 13" })).toBeVisible();
});
