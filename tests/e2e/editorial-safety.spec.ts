import "dotenv/config";
import { randomUUID, randomBytes } from "node:crypto";
import { readFile, mkdir } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { test as base, expect } from "@playwright/test";
import { PrismaClient, Prisma } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedVersionContent, catalogRevision } from "../../prisma/editorial-revision";
import { postAuth } from "./auth-request";
import { learningPaths } from "../../src/lib/learning-paths";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const test = base.extend<{ entry: { userId: string; slug: string; id: string } }>({
  entry: async ({ page }, runTest) => {
    const userId = randomUUID();
    const slug = `editorial-${randomUUID()}`;
    const email = `${slug}@example.test`;
    const password = randomBytes(24).toString("base64url");
    try {
      await db.user.create({ data: { id: userId, name: "Editora temporal", email, role: "ADMIN", accounts: { create: { id: randomUUID(), providerId: "credential", accountId: userId, password: await hashPassword(password) } } } });
      const { variants, ...content } = seedVersionContent(catalogRevision("logica-dos-parametros")!);
      const exercise = await db.exercise.create({ data: { slug, category: "Fundamentos", order: 100000, published: false, versions: { create: { ...content, prerequisiteSlugs: [], number: 1, variants: { create: variants.map(({ tests, ...variant }) => ({ ...variant, tests: { create: tests.map(test => ({ ...test, input: test.input === null ? Prisma.JsonNull : test.input as Prisma.InputJsonValue, expected: test.expected === null ? Prisma.JsonNull : test.expected as Prisma.InputJsonValue })) } })) } } } } });
      expect((await postAuth(page.request, "/api/auth/sign-in/email", { email, password })).ok()).toBe(true);
      await runTest({ userId, slug, id: exercise.id });
    } finally {
      await db.auditLog.deleteMany({ where: { userId } });
      await db.exercise.deleteMany({ where: { slug } });
      await db.user.deleteMany({ where: { id: userId } });
    }
  },
});
test.afterAll(async () => { await db.$disconnect(); });

test("guardar rechaza casos repetidos o contradictorios sin crear una versión", async ({ page, entry }) => {
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  await page.getByRole("tab", { name: "Pruebas", exact: true }).click();
  const sample = { input: { a: 1, b: 2 }, expected: 3, visible: true };
  for (const [tests, message] of [
    [[sample, sample, { ...sample, visible: false }], "tres entradas distintas"],
    [[sample, { ...sample, expected: 99 }, { ...sample, visible: false }], "contradictorios"],
  ] as const) {
    await page.getByLabel("Casos de prueba en JSON").fill(JSON.stringify(tests));
    await page.getByRole("button", { name: "Guardar versión", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: message })).toBeVisible();
    expect(await db.exerciseVersion.count({ where: { exerciseId: entry.id } })).toBe(1);
  }
});

test("publicar comprueba todas las variantes antes de consultar Piston", async ({ page, entry }) => {
  const version = await db.exerciseVersion.findFirstOrThrow({ where: { exerciseId: entry.id }, include: { variants: { include: { tests: true } } } });
  for (const variant of version.variants) {
    const original = variant.tests.map(test => ({ input: test.input as Prisma.InputJsonValue, expected: test.expected as Prisma.InputJsonValue, visible: test.visible, order: test.order }));
    for (const contradictory of [false, true]) {
      await db.testCase.deleteMany({ where: { variantId: variant.id } });
      await db.testCase.createMany({ data: [0, 1, 2].map(order => ({ variantId: variant.id, input: { a: 1, b: 2 }, expected: contradictory && order === 1 ? 99 : 3, visible: order === 0, order })) });
      await page.goto(`/admin/ejercicios/${entry.slug}`);
      await page.getByRole("button", { name: "Validar y publicar", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Validar y publicar", exact: true }).click();
      await expect(page.getByRole("status").filter({ hasText: `${variant.language}:` })).toContainText(contradictory ? "contradictorios" : "tres entradas distintas");
      expect((await db.exerciseVersion.findUniqueOrThrow({ where: { id: version.id } })).published).toBe(false);
    }
    await db.testCase.deleteMany({ where: { variantId: variant.id } });
    await db.testCase.createMany({ data: original.map(test => ({ ...test, variantId: variant.id })) });
  }
  expect(await db.auditLog.count({ where: { userId: entry.userId, action: "exercise.version.published" } })).toBe(0);
});

test("una respuesta de guardado lenta bloquea campos y entrega exactamente la instantánea enviada", async ({ page, entry }) => {
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  const title = "Título guardado sin perder ediciones";
  await page.getByLabel("Título", { exact: true }).fill(title);
  await expect(page.getByRole("button", { name: "Validar y publicar", exact: true })).toBeDisabled();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let received!: () => void;
  const receivedResponse = new Promise<void>(resolve => { received = resolve; });
  await page.route(`**/admin/ejercicios/${entry.slug}`, async route => {
    if (route.request().method() !== "POST") { await route.continue(); return; }
    const response = await route.fetch();
    received(); await gate; await route.fulfill({ response });
  });
  try {
    await page.getByRole("button", { name: "Guardar versión", exact: true }).click();
    await receivedResponse;
    const editor = page.getByRole("group", { name: "Editor de ejercicios", exact: true });
    await expect(editor).toHaveAttribute("aria-busy", "true");
    for (const field of await editor.locator("input, textarea, select, button").all()) await expect(field).toBeDisabled();
    expect(await db.exerciseVersion.count({ where: { exerciseId: entry.id } })).toBe(2);
    release();
    await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page.getByLabel("Título", { exact: true })).toBeEnabled();
    await expect(page.getByText("Editando desde la versión 2 guardada.", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Recuperar copia de sesión" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Validar y publicar", exact: true })).toBeEnabled();
    const version = await db.exerciseVersion.findFirstOrThrow({ where: { exerciseId: entry.id }, orderBy: { number: "desc" } });
    expect(version.title).toBe(title); expect(version.published).toBe(false);
    expect(await page.evaluate(key => sessionStorage.getItem(key), `itera:editorial:${entry.userId}:${entry.slug}`)).toBeNull();
  } finally { release(); }
});

test("un guardado fallido conserva campos y copia de sesión, y permite reintentar", async ({ page, entry }) => {
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  const title = "Cambios que sobreviven al fallo de red";
  await page.getByLabel("Título", { exact: true }).fill(title);
  await page.route(`**/admin/ejercicios/${entry.slug}`, async route => { if (route.request().method() === "POST") await route.abort("connectionfailed"); else await route.continue(); });
  await page.getByRole("button", { name: "Guardar versión", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "No se pudieron guardar los cambios." })).toBeVisible();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(title);
  await expect(page.getByLabel("Título", { exact: true })).toBeEnabled();
  expect(await db.exerciseVersion.count({ where: { exerciseId: entry.id } })).toBe(1);
  await page.unrouteAll();
  await page.getByRole("button", { name: "Guardar versión", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
});

test("avisa al salir por un enlace y recupera cambios incompletos al volver o recargar", async ({ page, entry }) => {
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  const title = "Edición todavía sin guardar";
  await page.getByLabel("Título", { exact: true }).fill(title);
  await page.getByRole("tab", { name: "Pruebas", exact: true }).click();
  await page.getByLabel("Casos de prueba en JSON").fill("[{incompleto");
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("link", { name: "Volver al catálogo", exact: true }).click();
  await expect(page).toHaveURL(`/admin/ejercicios/${entry.slug}`);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("link", { name: "Volver al catálogo", exact: true }).click();
  await expect(page).toHaveURL("/admin");
  await page.goBack();
  await expect(page.getByLabel("Título", { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Recuperar copia de sesión" }).click();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(title);
  await page.getByRole("tab", { name: "Pruebas", exact: true }).click();
  await expect(page.getByLabel("Casos de prueba en JSON")).toHaveValue("[{incompleto");
  page.once("dialog", dialog => dialog.accept());
  await page.reload();
  await page.getByRole("button", { name: "Recuperar copia de sesión" }).click();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(title);
});

test("la confirmación identifica la versión guardada y no publica cambios pendientes", async ({ page, entry }) => {
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  await page.getByRole("button", { name: "Validar y publicar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Se validará y publicará la versión 1 guardada");
  await expect(dialog).toContainText("versión publicada de mayor número");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Validar y publicar", exact: true })).toBeFocused();
  await page.getByLabel("Título", { exact: true }).fill("No publicar esta edición sin guardarla");
  await expect(page.getByRole("button", { name: "Validar y publicar", exact: true })).toBeDisabled();
  expect(await db.auditLog.count({ where: { userId: entry.userId, action: "exercise.version.published" } })).toBe(0);
  await mkdir(".local/screenshots", { recursive: true });
  await page.getByRole("group", { name: "Proceso de publicación", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: ".local/screenshots/editorial-safety-light.png", animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.getByRole("group", { name: "Proceso de publicación", exact: true }).scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".local/screenshots/editorial-safety-dark-mobile.png", animations: "disabled" });
});

test("un almacenamiento de sesión denegado muestra el riesgo y permite descargar los cambios", async ({ page, entry }) => {
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException("No disponible", "SecurityError"); }; });
  const title = "Copia editorial descargable";
  await page.getByLabel("Título", { exact: true }).fill(title);
  await expect(page.getByRole("alert").filter({ hasText: "No se pudo conservar la copia de sesión" })).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar cambios editoriales" }).click();
  const file = await downloaded;
  expect(JSON.parse(await readFile((await file.path())!, "utf8")).title).toBe(title);
  expect(await page.evaluate(() => window.dispatchEvent(new Event("beforeunload", { cancelable: true })))).toBe(false);
});

test("la navegación de historial conserva una copia sin aplicarla sobre otra versión", async ({ page, entry }) => {
  await page.goto("/admin");
  await page.locator(`a[href="/admin/ejercicios/${entry.slug}"]`).click();
  const title = "Cambios pendientes al volver atrás";
  await page.getByLabel("Título", { exact: true }).fill(title);
  await page.goBack();
  await expect(page).toHaveURL("/admin");
  const current = await db.exerciseVersion.findFirstOrThrow({ where: { exerciseId: entry.id }, orderBy: { number: "desc" }, select: { id: true, title: true } });
  // Una actualización externa no autoriza sustituir automáticamente la ficha remota.
  await db.exerciseVersion.update({ where: { id: current.id }, data: { title: "Título remoto actualizado" } });
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue("Título remoto actualizado");
  await page.getByRole("button", { name: "Recuperar copia de sesión" }).click();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(title);
  expect((await db.exerciseVersion.findUniqueOrThrow({ where: { id: current.id } })).title).toBe("Título remoto actualizado");
});

test("una copia pendiente se descarga o descarta explícitamente sin tocar otras fichas", async ({ page, entry }) => {
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  const title = "Copia que requiere una decisión explícita";
  await page.getByLabel("Título", { exact: true }).fill(title);
  const unrelated = "itera:editorial:otra-cuenta:otra-ficha";
  await page.evaluate(key => sessionStorage.setItem(key, "conservar"), unrelated);
  page.once("dialog", dialog => dialog.accept());
  await page.reload();
  await expect(page.getByLabel("Título", { exact: true })).toBeDisabled();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar copia de sesión", exact: true }).click();
  expect(JSON.parse(await readFile((await (await downloaded).path())!, "utf8")).title).toBe(title);
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Descartar copia de sesión", exact: true }).click();
  await expect(page.getByLabel("Título", { exact: true })).toBeDisabled();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Descartar copia de sesión", exact: true }).click();
  await expect(page.getByLabel("Título", { exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Recuperar copia de sesión" })).toHaveCount(0);
  expect(await page.evaluate(key => sessionStorage.getItem(key), unrelated)).toBe("conservar");
});

for (const visible of [false, true]) for (const published of [false, true]) {
  test(`visibilidad ${visible} y publicación de versión ${published} se muestran por separado`, async ({ page, entry }) => {
    await db.exercise.update({ where: { id: entry.id }, data: { published: visible } });
    await db.exerciseVersion.updateMany({ where: { exerciseId: entry.id }, data: { published } });
    await page.goto(`/admin/ejercicios/${entry.slug}`);
    const process = page.getByRole("group", { name: "Proceso de publicación", exact: true });
    await expect(process.getByRole("heading", { name: published ? "Versión publicada" : "Versión guardada en borrador", exact: true })).toBeVisible();
    await expect(process).toContainText(visible ? "Visible en el catálogo" : "Oculto del catálogo");
    if (visible) await expect(page.getByLabel("Categoría", { exact: true })).toBeDisabled();
    else await expect(page.getByLabel("Categoría", { exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Ocultar", exact: true })).toHaveCount(visible ? 1 : 0);
    await page.goto("/admin");
    const row = page.locator(`a[href="/admin/ejercicios/${entry.slug}"]`);
    await expect(row).toContainText(visible ? "Visible en el catálogo" : "Oculto del catálogo");
    await expect(row).toContainText(published ? "Versión publicada" : "Versión guardada en borrador");
  });
}

test("un borrador nuevo no se anuncia publicado y permite ocultar sin modificar versiones", async ({ page, entry }) => {
  await db.exercise.update({ where: { id: entry.id }, data: { published: true } });
  await db.exerciseVersion.updateMany({ where: { exerciseId: entry.id }, data: { published: true } });
  await page.goto(`/admin/ejercicios/${entry.slug}`);
  const title = "Nuevo borrador sobre una versión visible";
  await page.getByLabel("Título", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Guardar versión", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  const process = page.getByRole("group", { name: "Proceso de publicación", exact: true });
  await expect(process.getByRole("heading", { name: "Versión guardada en borrador", exact: true })).toBeVisible();
  await expect(process).toContainText("Visible en el catálogo");
  const versions = await db.exerciseVersion.findMany({ where: { exerciseId: entry.id }, orderBy: { number: "asc" }, select: { id: true, number: true, published: true } });
  expect(versions.map(version => version.published)).toEqual([true, false]);
  await mkdir(".local/screenshots", { recursive: true });
  await process.scrollIntoViewIfNeeded();
  await page.screenshot({ path: ".local/screenshots/editorial-status-light.png", animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await process.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".local/screenshots/editorial-status-dark-mobile.png", animations: "disabled" });
  await page.getByRole("button", { name: "Ocultar", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Ocultar ejercicio", exact: true }).click();
  await expect(process).toContainText("Oculto del catálogo");
  await expect(process.getByRole("heading", { name: "Versión guardada en borrador", exact: true })).toBeVisible();
  expect(await db.exerciseVersion.findMany({ where: { exerciseId: entry.id }, orderBy: { number: "asc" }, select: { id: true, number: true, published: true } })).toEqual(versions);
  await expect(page.getByRole("button", { name: "Ocultar", exact: true })).toHaveCount(0);
  await expect(page.getByText("No hay cambios sin guardar.", { exact: true })).toBeVisible();
});

test("un diagnóstico inconcluso reciente conserva el nivel declarado y no rescata la sugerencia anterior", async ({ page, entry }) => {
  await db.learningProfile.create({ data: { userId: entry.userId, language: "python", declaredLevel: "BEGINNER" } });
  await db.diagnostic.create({ data: { userId: entry.userId, language: "python", declaredLevel: "BEGINNER", suggestedLevel: "INTERMEDIATE", reason: "Sugerencia anterior para avanzar.", createdAt: new Date("2026-10-24"), finishedAt: new Date("2026-10-24") } });
  const current = await db.diagnostic.create({ data: { userId: entry.userId, language: "python", declaredLevel: "BEGINNER", suggestedLevel: null, reason: "Conservamos tu nivel declarado; no hay dos ejercicios evaluados.", createdAt: new Date("2026-10-25"), finishedAt: new Date("2026-10-25") } });
  await page.goto(`/diagnostico/${current.id}`);
  const summary = page.getByRole("region", { name: "Ruta recomendada", exact: true });
  await expect(summary).toContainText("Sin resultado concluyente");
  await expect(summary).toContainText(current.reason!);
  await expect(summary.getByRole("heading", { name: learningPaths.find(path => path.level === "BEGINNER")!.title, exact: true })).toBeVisible();
  await db.learningProfile.update({ where: { userId_language: { userId: entry.userId, language: "python" } }, data: { declaredLevel: "ADVANCED" } });
  await page.reload();
  await expect(summary).toContainText("Sin diagnóstico");
  await expect(summary).not.toContainText(current.reason!);
  await expect(summary.getByRole("heading", { name: learningPaths.find(path => path.level === "ADVANCED")!.title, exact: true })).toBeVisible();
  expect(await db.progress.count({ where: { userId: entry.userId } })).toBe(0);
});
