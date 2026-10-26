import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { test, expect } from "@playwright/test";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { languages } from "../../src/lib/types";
import { validateProjectDefinition, validateProjectSolution } from "../../src/lib/project";
import { postAuth } from "../e2e/auth-request";
import { openSimpleEditor } from "../workspace";
import { logicExercises } from "../../prisma/logic-content";
import { seedVersionContent } from "../../prisma/editorial-revision";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const users: string[] = [];
const exercises: string[] = [];
test.afterEach(async () => {
  await db.exercise.deleteMany({ where: { id: { in: exercises } } }); exercises.length = 0;
  await db.auditLog.deleteMany({ where: { userId: { in: users } } });
  await db.user.deleteMany({ where: { id: { in: users } } }); users.length = 0;
});
test.afterAll(async () => { await db.$disconnect(); });

for (const language of languages) test(`proyecto ${language}: archivos, recarga, pruebas propias y persistencia oficial`, async ({ page }) => {
  test.setTimeout(180000);
  const id = randomUUID(), email = `proyecto-${id}@example.test`, password = "Itera-proyectos-12345";
  users.push(id);
  await db.user.create({ data: { id, email, name: "Prueba Proyectos", accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: await hashPassword(password) } } } });
  const login = await postAuth(page.request, "/api/auth/sign-in/email", { email, password });
  expect(login.ok()).toBeTruthy();
  const variant = await db.exerciseVariant.findFirstOrThrow({ where: { language, version: { published: true, exercise: { slug: "logica-inventario-persistente" } } }, orderBy: { version: { number: "desc" } } });
  const project = validateProjectDefinition(variant.project);
  const files = validateProjectSolution(project, variant.solutionFiles);
  await page.emulateMedia({ colorScheme: language === "javascript" ? "dark" : "light", reducedMotion: "reduce" });
  await page.goto(`/ejercicios/logica-inventario-persistente?lenguaje=${language}`);
  await openSimpleEditor(page);
  const picker = page.getByLabel("Archivo del proyecto", { exact: true });
  for (const file of files.filter(file => !file.readOnly)) {
    await picker.selectOption(file.path);
    await page.getByRole("textbox", { name: `Editor sencillo de ${file.path}`, exact: true }).fill(file.content);
  }
  await expect.poll(async () => {
    const draft = await db.draft.findUnique({ where: { userId_variantId: { userId: id, variantId: variant.id } } });
    return draft?.files;
  }).toEqual(files);
  await page.reload();
  await openSimpleEditor(page);
  await picker.selectOption(project.entrypoint);
  await expect(page.getByRole("textbox", { name: `Editor sencillo de ${project.entrypoint}`, exact: true })).toHaveValue(files.find(file => file.path === project.entrypoint)!.content);
  await picker.selectOption("estado.json");
  await expect(page.getByRole("textbox", { name: "Editor sencillo de estado.json", exact: true })).toHaveAttribute("readonly", "");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  // En móvil las acciones pertenecen a la sección Código, no al Enunciado.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Ejecutar mis pruebas", exact: true }).click();
  await expect.poll(() => db.submission.count({ where: { userId: id, mode: "tests", status: "PASSED" } }), { timeout: 60000 }).toBe(1);
  expect(await db.progress.count({ where: { userId: id, firstPassedAt: { not: null } } })).toBe(0);
  await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Los ejemplos funcionan.", exact: true })).toBeVisible({ timeout: 60000 });
  expect(await db.progress.count({ where: { userId: id, firstPassedAt: { not: null } } })).toBe(0);
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Un paso más. Ejercicio resuelto.", exact: true })).toBeVisible({ timeout: 90000 });
  const progress = await db.progress.findMany({ where: { userId: id, firstPassedAt: { not: null } } });
  expect(progress).toHaveLength(1);
  expect(progress[0].language).toBe(language);
  const submission = await db.submission.findFirstOrThrow({ where: { userId: id, mode: "submit" } });
  expect(submission.files).toEqual(files);
  const hidden = (submission.results as { visible: boolean }[]).filter(result => !result.visible);
  expect(hidden.length).toBeGreaterThan(0);
  for (const result of hidden) expect(Object.keys(result).sort()).toEqual(["index", "passed", "status", "visible"]);
});

test("proyecto invitado: dos pestañas conservan sus archivos sin sustituir la edición activa", async ({ page, context }) => {
  const url = "/ejercicios/logica-inventario-persistente?lenguaje=python";
  await page.goto(url);
  await openSimpleEditor(page);
  await page.getByLabel("Archivo del proyecto", { exact: true }).selectOption("reglas.py");
  const first = page.getByRole("textbox", { name: "Editor sencillo de reglas.py", exact: true });
  const firstCode = "# copia de la primera pestaña\ndef aplicar(stock, movimientos):\n    return 0\n";
  await first.fill(firstCode);
  const other = await context.newPage();
  try {
    await other.goto(url);
    await openSimpleEditor(other);
    await other.getByLabel("Archivo del proyecto", { exact: true }).selectOption("reglas.py");
    const second = other.getByRole("textbox", { name: "Editor sencillo de reglas.py", exact: true });
    await expect(second).toHaveValue(firstCode);
    const secondCode = "# copia de la segunda pestaña\ndef aplicar(stock, movimientos):\n    return 1\n";
    await second.fill(secondCode);
    await expect(first).toHaveValue(firstCode);
    await expect(second).toHaveValue(secondCode);
    await expect.poll(() => page.evaluate(() => {
      const contents: string[] = [];
      for (const key of Object.keys(localStorage).filter(key => key.startsWith("itera:draft:"))) {
        const stored = JSON.parse(localStorage.getItem(key)!);
        for (const copy of [stored, ...(stored.copies ?? [])]) for (const file of copy.files ?? []) if (file.path === "reglas.py") contents.push(file.content);
      }
      return new Set(contents).size;
    })).toBeGreaterThanOrEqual(2);
    await page.getByRole("button", { name: /Copias conservadas/ }).click();
    await expect(page.getByRole("button", { name: "Descargar todas las copias", exact: true })).toBeVisible();
  } finally { await other.close(); }
});

test("administración: guardar y publicar otra versión conserva proyecto y expectativas privadas", async ({ page }) => {
  test.setTimeout(180000);
  const id = randomUUID(), email = `editor-proyecto-${id}@example.test`, password = "Itera-editor-proyecto-12345";
  users.push(id);
  await db.user.create({ data: { id, email, role: "ADMIN", name: "Prueba Editorial", accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: await hashPassword(password) } } } });
  expect((await postAuth(page.request, "/api/auth/sign-in/email", { email, password })).ok()).toBeTruthy();
  const source = logicExercises.find(exercise => exercise.slug === "logica-inventario-persistente")!;
  const { variants, ...content } = seedVersionContent({ ...source, prerequisiteSlugs: [] });
  const slug = `prueba-proyecto-${randomUUID()}`;
  const exercise = await db.exercise.create({ data: { slug, category: source.category, order: 9999, published: false, versions: { create: { ...content, number: 1, published: false, variants: { create: variants.map(({ tests, ...variant }) => ({ ...variant, tests: { create: tests.map(fixture => ({ ...fixture, input: fixture.input as Prisma.InputJsonValue, expected: fixture.expected as Prisma.InputJsonValue })) } })) } } } } });
  exercises.push(exercise.id);
  await page.goto(`/admin/ejercicios/${slug}`);
  await page.getByLabel("Título", { exact: true }).fill("Inventario de prueba revisado");
  await page.getByRole("button", { name: "Guardar versión", exact: true }).click();
  await expect.poll(() => db.exerciseVersion.count({ where: { exerciseId: exercise.id } })).toBe(2);
  const saved = await db.exerciseVersion.findFirstOrThrow({ where: { exerciseId: exercise.id }, orderBy: { number: "desc" }, include: { variants: { include: { tests: { orderBy: { order: "asc" } } } } } });
  for (const language of languages) {
    const actual = saved.variants.find(variant => variant.language === language)!;
    const expected = variants.find(variant => variant.language === language)!;
    expect(actual.project).toEqual(expected.project);
    expect(actual.solutionFiles).toEqual(expected.solutionFiles);
    expect(actual.tests.map(fixture => fixture.expectedFiles)).toEqual(expected.tests.map(fixture => fixture.expectedFiles));
    expect(actual.tests.map(fixture => fixture.expectedPersistence)).toEqual(expected.tests.map(fixture => fixture.expectedPersistence));
  }
  await page.getByRole("button", { name: "Validar y publicar", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Validar y publicar", exact: true }).click();
  await expect.poll(async () => (await db.exerciseVersion.findUniqueOrThrow({ where: { id: saved.id } })).published, { timeout: 120000 }).toBe(true);
  await expect(page.getByText("Versión validada y publicada.", { exact: true })).toBeVisible();
});
