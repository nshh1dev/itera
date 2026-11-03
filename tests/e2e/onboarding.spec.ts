import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { exerciseHref, learningPaths } from "../../src/lib/learning-paths";
import { logicExercises } from "../../prisma/logic-content";
import { languageNames, languages } from "../../src/lib/types";
import { openLearningHelp, openSimpleEditor } from "../workspace";
import { postAuth } from "./auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
test.afterAll(async () => { await db.$disconnect(); });
const password = "Itera-bienvenida-local-82741";
async function registerInBrowser(page: Page, email: string) {
  await page.getByLabel("Tu nombre").fill("Prueba de bienvenida");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
}

// Requiere el catálogo nuevo activado. No publica contenido usando el doble HTTP.
for (const path of learningPaths) for (const language of languages) {
  test(`${path.title} mantiene todos sus pasos en orden en ${languageNames[language]}`, async ({ page }) => {
    await page.goto(`/rutas/${path.slug}?lenguaje=${language}`);
    await expect(page.getByRole("heading", { name: path.title, exact: true })).toBeVisible();
    for (const trigger of await page.locator(".route-module > div > h3 > button").all()) if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
    const steps = page.locator(".route-module").getByRole("link");
    await expect(steps).toHaveCount(path.slugs!.length);
    expect(await steps.evaluateAll(links => links.map(link => link.getAttribute("href"))))
      .toEqual(path.slugs!.map(slug => exerciseHref(slug, language, path.slug)));
    await expect(page.locator('.exercise-row[aria-current="step"]'))
      .toHaveAttribute("href", exerciseHref(path.slugs![0], language, path.slug));
    // Acceso libre: el último reto se puede abrir sin resolver ninguno.
    await steps.last().click();
    await expect(page.getByRole("heading", { level: 1, name: logicExercises.find(e => e.slug === path.slugs!.at(-1))!.title, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Volver a la ruta" })).toHaveAttribute("href", `/rutas/${path.slug}?lenguaje=${language}`);
  });
}

test("Desde cero es Iniciación y comienza con un programa completo", async ({ page }) => {
  await page.goto("/rutas/desde-cero");
  await expect(page.getByText("Iniciación · Fundamentos de programación y algoritmos", { exact: true })).toBeVisible();
  await page.locator(".route-module").getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Muestra un saludo", exact: true })).toBeVisible();
  await openLearningHelp(page);
  await expect(page.getByRole("region", { name: "Teoría y ejemplo" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Condiciones del ejercicio", exact: true })).toBeVisible();
  await openSimpleEditor(page);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue(logicExercises[0].starters!.python);
});

test("el lenguaje se elige en la ruta y permanece fijo en el editor", async ({ page }) => {
  const slug = "logica-dos-parametros";
  const exercise = logicExercises.find(e => e.slug === slug)!;
  for (const language of languages) {
    await page.goto("/rutas/desde-cero?lenguaje=python");
    await page.getByRole("navigation", { name: "Lenguaje de la ruta", exact: true }).getByRole("link", { name: languageNames[language], exact: true }).click();
    await expect(page).toHaveURL(`/rutas/desde-cero?lenguaje=${language}`);
    const exerciseLink = page.locator(".route-module").getByRole("link", { name: new RegExp(exercise.title) });
    for (const trigger of await page.locator(".route-module > div > h3 > button").all()) if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
    await exerciseLink.click();
    await expect(page).toHaveURL(exerciseHref(slug, language, "desde-cero"));
    await expect(page.getByText(`Lenguaje del ejercicio: ${languageNames[language]}`, { exact: true })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Lenguaje del ejercicio", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: exercise.title, exact: true })).toBeVisible();
    await openSimpleEditor(page);
    await expect(page.getByRole("textbox", { name: `Editor sencillo de ${languageNames[language]}` })).toHaveValue(exercise.starters![language]!);
    await expect(page.getByRole("link", { name: "Ejercicio siguiente", exact: true })).toHaveAttribute("href", exerciseHref("logica-imprimir-devolver", language, "desde-cero"));
  }
});

test("comprobar como invitado conserva el ejercicio y lenguaje al pedir iniciar sesión", async ({ page }) => {
  const href = exerciseHref("logica-elige-mensaje", "typescript", "primeros-pasos");
  await page.goto(href);
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  await expect(page).toHaveURL(/iniciar-sesion/);
  expect(new URL(page.url()).searchParams.get("volver")).toBe(href);
});

test("registrarse desde el ejercicio vuelve con ruta, lenguaje y código de invitado", async ({ page }) => {
  const email = `bienvenida-retorno-${randomUUID()}@example.test`;
  const href = exerciseHref("logica-dos-parametros", "python", "desde-cero");
  const code = "# Copia escrita antes de crear la cuenta\ndef solve(data):\n    return data['a'] + data['b']\n";
  try {
    await page.goto(href);
    await openSimpleEditor(page);
    await page.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(code);
    await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
    await expect(page).toHaveURL(/iniciar-sesion/);
    expect(new URL(page.url()).searchParams.get("volver")).toBe(href);
    await page.getByRole("link", { name: "Crea una cuenta", exact: true }).click();
    expect(new URL(page.url()).searchParams.get("volver")).toBe(href);
    await registerInBrowser(page, email);
    await expect(page).toHaveURL(href);
    await openSimpleEditor(page);
    await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue(code);
    await expect(page.getByRole("link", { name: "Volver a la ruta", exact: true })).toHaveAttribute("href", "/rutas/desde-cero?lenguaje=python");
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user.onboardingStep).toBe(2);
    await expect.poll(async () => (await db.draft.findFirst({ where: { userId: user.id, variant: { language: "python", version: { exercise: { slug: "logica-dos-parametros" } } } } }))?.code).toBe(code);
    expect(await db.learningProfile.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.submission.count({ where: { userId: user.id } })).toBe(0);
  } finally { await db.user.deleteMany({ where: { email } }); }
});

test("el alta sin ejercicio elige nivel intermedio y termina la bienvenida sin diagnóstico", async ({ page }) => {
  const email = `bienvenida-nueva-${randomUUID()}@example.test`;
  try {
    await page.goto("/registro");
    await registerInBrowser(page, email);
    await expect(page.getByRole("heading", { name: "Aprende a tu manera", exact: true })).toBeVisible();
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user.onboardingStep).toBe(2);
    await page.getByRole("radio", { name: /Intermedio/ }).check();
    await page.getByRole("button", { name: "Guardar y empezar mi ruta", exact: true }).click();
    await expect(page).toHaveURL("/rutas/pensar-en-soluciones?lenguaje=python");
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).onboardingStep).toBe(0);
    expect(await db.learningProfile.findUniqueOrThrow({ where: { userId_language: { userId: user.id, language: "python" } } })).toMatchObject({ declaredLevel: "INTERMEDIATE" });
    expect(await db.diagnostic.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(0);
    await page.goto("/bienvenida");
    await expect(page).toHaveURL("/configuracion?seccion=aprendizaje");
  } finally { await db.user.deleteMany({ where: { email } }); }
});

test("los estados antiguos de bienvenida conservan compatibilidad sin otorgar progreso", async ({ page }) => {
  const email = `bienvenida-antigua-${randomUUID()}@example.test`;
  try {
    const response = await postAuth(page.request, "/api/auth/sign-up/email", { email, name: "Bienvenida antigua temporal", password });
    expect(response.ok(), await response.text()).toBe(true);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    // Estados históricos simulados solo en esta cuenta temporal, sin migraciones.
    for (const step of [1, 2, 3, 4]) {
      await db.user.update({ where: { id: user.id }, data: { onboardingStep: step } });
      await page.goto(`/bienvenida?paso=${step}`);
      await expect(page.getByRole("heading", { name: "Aprende a tu manera", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Probar el diagnóstico", exact: true })).toHaveCount(0);
    }
    await db.learningProfile.create({ data: { userId: user.id, language: "python", declaredLevel: "INTERMEDIATE" } });
    await page.goto("/bienvenida?paso=3");
    await expect(page.getByRole("heading", { name: "Encuentra un punto de partida", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Probar el diagnóstico", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Continuar sin diagnóstico", exact: true }).click();
    await expect(page).toHaveURL("/rutas/pensar-en-soluciones?lenguaje=python");
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).onboardingStep).toBe(0);
    expect(await db.diagnostic.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(0);
  } finally { await db.user.deleteMany({ where: { email } }); }
});
