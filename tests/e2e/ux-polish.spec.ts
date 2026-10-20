import "dotenv/config";
import { mkdir, readdir, readFile, unlink } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { languages } from "../../src/lib/types";
import { exerciseHref } from "../../src/lib/learning-paths";
import { postAuth } from "./auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const email = `pulido-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
const password = "Itera-pulido-local-12345";
const mailFiles = new Set<string>();
test.describe.configure({ mode: "serial" });
test.afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  for (const file of mailFiles) await unlink(`.local/mail/${file}`);
  await db.$disconnect();
});

for (const language of languages) test(`volver y siguiente conservan ruta o práctica libre en ${language}`, async ({ page }) => {
  await page.goto(exerciseHref("logica-dos-parametros", language, "desde-cero"));
  await expect(page.getByRole("link", { name: "Volver a la ruta", exact: true })).toHaveAttribute("href", `/rutas/desde-cero?lenguaje=${language}`);
  await expect(page.getByRole("link", { name: "Ejercicio siguiente", exact: true })).toHaveAttribute("href", exerciseHref("logica-imprimir-devolver", language, "desde-cero"));
  await page.getByRole("link", { name: "Ejercicio siguiente", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`logica-imprimir-devolver\\?lenguaje=${language}&ruta=desde-cero`));
  await page.goto(exerciseHref("logica-dos-parametros", language));
  await expect(page.getByRole("link", { name: "Volver a ejercicios", exact: true })).toHaveAttribute("href", `/ejercicios?lenguaje=${language}`);
  const next = page.getByRole("link", { name: "Ejercicio siguiente", exact: true });
  await expect(next).toHaveAttribute("href", new RegExp(`lenguaje=${language}$`));
  await next.click();
  await expect(page.getByRole("link", { name: "Volver a ejercicios", exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("ruta")).toBe(false);
});

test("el estado sin sesión explica el progreso y permite entrar sin promesas de nube", async ({ page }) => {
  await page.goto("/progreso");
  await expect(page.getByRole("heading", { name: "Entra para ver tu progreso" })).toBeVisible();
  await expect(page.getByText(/los borradores solo quedan en este navegador/)).toBeVisible();
  await page.getByRole("link", { name: "Iniciar sesión", exact: true }).click();
  await expect(page).toHaveURL(/iniciar-sesion\?volver=%2Fprogreso/);
  await expect(page.getByRole("link", { name: "Volver a explorar", exact: true })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Explorar sin cuenta", exact: true })).toHaveCount(0);
});

test("la recuperación y el inicio de sesión devuelven al ejercicio y lenguaje originales", async ({ page }) => {
  const signup = await postAuth(page.request, "/api/auth/sign-up/email", { name: "Prueba de pulido", email, password });
  expect(signup.ok(), await signup.text()).toBe(true);
  await page.context().clearCookies();
  const target = exerciseHref("logica-dos-parametros", "typescript", "desde-cero");
  await page.goto(target);
  await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
  await expect(page.getByRole("link", { name: "Volver al ejercicio", exact: true })).toHaveAttribute("href", target);
  await page.getByRole("link", { name: "¿La olvidaste?", exact: true }).click();
  await expect(page).toHaveURL(/recuperar-cuenta\?volver=/);
  await expect(page.getByText(/No se envía por correo/)).toBeVisible();
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByRole("button", { name: "Crear enlace", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Solicitud recibida.");
  await expect(page.getByRole("link", { name: "Volver a iniciar sesión", exact: true })).toHaveCount(1);
  let resetUrl = "";
  await expect.poll(async () => {
    for (const file of await readdir(".local/mail")) {
      if (!file.endsWith(".txt")) continue;
      const text = await readFile(`.local/mail/${file}`, "utf8");
      if (!text.includes(`Para: ${email}\n`)) continue;
      mailFiles.add(file);
      resetUrl = text.match(/http:\/\/[^\s]+/)?.[0] ?? "";
    }
    return resetUrl;
  }).not.toBe("");
  await page.goto(resetUrl);
  expect(new URL(page.url()).searchParams.get("volver")).toBe(target);
  await page.getByLabel("Contraseña", { exact: true }).fill(`${password}-nueva`);
  await page.getByRole("button", { name: "Guardar contraseña", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Tu contraseña fue actualizada.");
  await page.getByRole("link", { name: "Volver a iniciar sesión", exact: true }).click();
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(`${password}-nueva`);
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`logica-dos-parametros\\?lenguaje=typescript&ruta=desde-cero`));
});

test("el módulo activo retoma el borrador y los integradores no duplican filas", async ({ page }) => {
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const variant = await db.exerciseVariant.findFirstOrThrow({ where: { language: "python", version: { published: true, exercise: { slug: "logica-dos-parametros" } } }, orderBy: { version: { number: "desc" } } });
  await db.draft.create({ data: { userId: user.id, variantId: variant.id, code: variant.starter } });
  await page.request.post("/api/auth/sign-in/email", { headers: { origin: "http://127.0.0.1:3000" }, data: { email, password: `${password}-nueva` } });
  await page.goto("/rutas/desde-cero?lenguaje=python");
  const active = page.locator(".route-module-active");
  await expect(active).toHaveCount(1);
  await expect(active.locator(".arc-disclosure-trigger").first()).toHaveAttribute("aria-expanded", "true");
  await expect(active.locator('a[aria-current="step"]')).toContainText("Calcula con dos parámetros");
  await expect(page.getByRole("region", { name: "Siguiente ejercicio de la ruta" }).getByRole("link", { name: "Abrir ejercicio", exact: true })).toHaveAttribute("href", exerciseHref("logica-dos-parametros", "python", "desde-cero"));
  await expect(page.locator('.exercise-row[href*="logica-merienda?"]')).toHaveCount(1);
  await page.goto("/progreso?lenguaje=python");
  await expect(page.getByRole("link", { name: "Retomar un borrador", exact: true })).toBeVisible();
  await expect(page.locator(".activity-journal")).toContainText("Aquí aparecerán tus ejecuciones");
  await mkdir(".local/screenshots/pulido", { recursive: true });
  for (const theme of ["light", "dark"] as const) for (const width of [390, 1440]) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    for (const [name, url] of [["progreso", "/progreso?lenguaje=python"], ["ruta", "/rutas/desde-cero?lenguaje=python"], ["editor", exerciseHref("logica-dos-parametros", "python", "desde-cero")], ["ejercicios", "/ejercicios?lenguaje=python"]]) {
      await page.goto(url);
      if (url.includes("/ejercicios/") && width >= 1200) await page.locator(".monaco-editor").first().waitFor({ state: "visible" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `.local/screenshots/pulido/${name}-${theme}-${width}.png`, fullPage: true, animations: "disabled" });
    }
  }
});
