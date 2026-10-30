import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { mkdir } from "node:fs/promises";
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "./auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const password = "Itera-cuenta-12345";
const origin = "http://127.0.0.1:3000";
const ids: string[] = [];

async function register(request: APIRequestContext) {
  const email = `cuenta-${randomUUID()}@example.test`;
  // La creación de fixtures no consume el cupo de registros que verifica la suite de acceso.
  const user = await db.user.create({ data: { id: randomUUID(), name: "Prueba de cuenta", email } });
  ids.push(user.id);
  await db.account.create({ data: { id: randomUUID(), userId: user.id, accountId: user.id, providerId: "credential", password: await hashPassword(password) } });
  const response = await signIn(request, email);
  expect(response.ok(), await response.text()).toBeTruthy();
  return { id: user.id as string, email };
}

async function signIn(request: APIRequestContext, email: string, credential = password) {
  return postAuth(request, "/api/auth/sign-in/email", { email, password: credential });
}

async function openSettings(page: Page) {
  await page.goto("/inicio");
  await page.getByRole("button", { name: "Mi cuenta", exact: true }).click();
  await page.getByRole("menuitem", { name: "Configuración", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Configuración", exact: true })).toBeVisible();
}

test.afterEach(async () => {
  await db.auditLog.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  ids.length = 0;
});
test.afterAll(async () => { await db.$disconnect(); });

for (const theme of ["light", "dark"] as const) {
  test(`menú accesible y preferencias persistentes en ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: theme === "light" ? 1440 : 320, height: 900 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    const user = await register(page.request);
    await page.goto("/inicio");
    const avatar = page.getByRole("button", { name: "Mi cuenta", exact: true });
    await avatar.focus(); await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toContainText(user.email);
    await page.keyboard.press("Escape"); await expect(avatar).toBeFocused();
    await avatar.click(); await page.getByRole("menuitem", { name: "Configuración", exact: true }).click();
    const settings = page.getByRole("main");
    const sections = page.getByRole("navigation", { name: "Secciones de configuración" });
    for (const name of ["Mi cuenta", "Aprendizaje", "Apariencia"]) await expect(sections.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(sections.getByRole("link")).toHaveCount(3);
    await settings.getByLabel("Nombre", { exact: true }).fill("Nombre actualizado");
    await settings.getByRole("button", { name: "Guardar nombre" }).click();
    await expect(settings.getByRole("status")).toHaveText("Tu nombre está actualizado.");
    await sections.getByRole("link", { name: "Aprendizaje", exact: true }).click();
    await settings.getByLabel("Lenguaje preferido").selectOption("typescript");
    await settings.getByRole("radio", { name: /Avanzado/ }).check();
    await settings.getByRole("button", { name: "Guardar preferencias" }).click();
    await expect(settings.getByRole("status").filter({ visible: true })).toHaveText("Tus preferencias están guardadas. Tu progreso no ha cambiado.");
    expect(await db.userPreference.findUnique({ where: { userId: user.id } })).toMatchObject({ language: "typescript", level: "ADVANCED" });
    await sections.getByRole("link", { name: "Apariencia", exact: true }).click();
    await settings.getByRole("button", { name: "Oscuro", exact: true }).click();
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await sections.getByRole("link", { name: "Mi cuenta", exact: true }).click();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Nombre actualizado");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole("button", { name: "Cambiar contraseña", exact: true }).click();
    const passwordDialog = page.getByRole("dialog", { name: "Cambiar contraseña", exact: true });
    await expect(passwordDialog.getByLabel("Contraseña actual")).toBeVisible();
    await mkdir(".local/screenshots", { recursive: true });
    await page.screenshot({ path: `.local/screenshots/account-password-${theme}.png`, animations: "disabled" });
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const geometry = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, overflow: Array.from(document.querySelectorAll<HTMLElement>("body *")).filter(node => node.getClientRects().length && node.getBoundingClientRect().right > innerWidth).map(node => ({ tag: node.tagName, class: node.className, width: node.getBoundingClientRect().width, text: node.textContent?.slice(0, 60) })) }));
    expect(geometry.width, JSON.stringify(geometry.overflow)).toBeLessThanOrEqual(geometry.viewport);
    await passwordDialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(passwordDialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cambiar contraseña", exact: true })).toBeFocused();
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await expect(page).toHaveURL(`${origin}/`);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.user.findUnique({ where: { id: user.id } })).not.toBeNull();
  });
}

test("los enlaces antiguos de cuenta conservan foco, edición pendiente e historial de navegación", async ({ page }) => {
  await register(page.request);
  for (const [section, heading] of [["seguridad", "Acceso y seguridad"], ["privacidad", "Datos y desactivación"]]) {
    await page.goto(`/configuracion?seccion=${section}`);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeFocused();
    await expect(page.getByRole("navigation", { name: "Secciones de configuración" }).getByRole("link", { name: "Mi cuenta", exact: true })).toHaveAttribute("aria-current", "page");
    await page.getByLabel("Nombre", { exact: true }).fill("Edición pendiente");
    await page.getByRole("navigation", { name: "Secciones de configuración" }).getByRole("link", { name: "Aprendizaje", exact: true }).click();
    await page.goBack();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeFocused();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Edición pendiente");
    await page.goForward();
    await expect(page.getByRole("heading", { name: "Aprendizaje", exact: true })).toBeVisible();
    await page.goBack();
    await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue("Edición pendiente");
  }
});

test("cambiar correo exige contraseña, evita duplicados y revoca otras sesiones", async ({ page, playwright }) => {
  const user = await register(page.request);
  const other = await playwright.request.newContext({ baseURL: origin });
  try {
    const duplicate = await register(other);
    const login = await signIn(other, user.email);
    expect(login.ok()).toBeTruthy();
    await openSettings(page);
    await page.getByRole("button", { name: "Cambiar correo", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Cambiar correo", exact: true });
    const email = `nuevo-${randomUUID()}@example.test`;
    await dialog.getByLabel("Nuevo correo electrónico").fill(email);
    await dialog.getByLabel("Contraseña actual").fill("incorrecta");
    await dialog.getByRole("button", { name: "Cambiar correo", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText("No se pudo verificar");
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).email).toBe(user.email);
    await dialog.getByLabel("Nuevo correo electrónico").fill(duplicate.email);
    await dialog.getByLabel("Contraseña actual").fill(password);
    await dialog.getByRole("button", { name: "Cambiar correo", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText("No se puede utilizar este correo");
    await dialog.getByLabel("Nuevo correo electrónico").fill(email);
    await dialog.getByRole("button", { name: "Cambiar correo", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Mi cuenta", exact: true }).getByText(email, { exact: true })).toBeVisible();
    expect(await db.user.findUnique({ where: { id: user.id } })).toMatchObject({ email, emailVerified: false });
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
    expect(await (await other.get("/api/auth/get-session")).json()).toBeNull();
    const stored = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
    expect(stored).not.toContain(password);
    expect((await signIn(other, user.email)).ok()).toBeFalsy();
    expect((await signIn(other, email)).ok()).toBeTruthy();
  } finally { await other.dispose(); }
});

test("cambio de contraseña valida confirmación y actual, guarda hash y revoca sesiones", async ({ page, playwright }) => {
  const user = await register(page.request);
  const other = await playwright.request.newContext({ baseURL: origin });
  try {
    expect((await signIn(other, user.email)).ok()).toBeTruthy();
    await openSettings(page);
    await page.getByRole("button", { name: "Cambiar contraseña", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Cambiar contraseña", exact: true });
    const next = "Itera-renovada-67890";
    await dialog.getByLabel("Contraseña actual").fill("incorrecta");
    await dialog.getByLabel("Nueva contraseña", { exact: true }).fill(next);
    await dialog.getByLabel("Confirmar nueva contraseña").fill("no-coincide-123");
    await dialog.getByRole("button", { name: "Cambiar contraseña", exact: true }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Las contraseñas no coinciden.");
    await dialog.getByLabel("Confirmar nueva contraseña").fill(next);
    await dialog.getByRole("button", { name: "Cambiar contraseña", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText("No se pudo cambiar la contraseña");
    await dialog.getByLabel("Contraseña actual").fill(password);
    await dialog.getByRole("button", { name: "Cambiar contraseña", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const credential = await db.account.findFirstOrThrow({ where: { userId: user.id, providerId: "credential" } });
    expect(credential.password).not.toBe(next);
    expect(credential.password).not.toBe(password);
    const stored = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
    expect(stored).not.toContain(password);
    expect(stored).not.toContain(next);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
    expect(await (await other.get("/api/auth/get-session")).json()).toBeNull();
    expect((await signIn(other, user.email)).ok()).toBeFalsy();
    expect((await signIn(other, user.email, next)).ok()).toBeTruthy();
  } finally { await other.dispose(); }
});

test("desactivar conserva datos, bloquea acceso y permite reactivación solo administrativa", async ({ page, browser }) => {
  const user = await register(page.request);
  const variant = await db.exerciseVariant.findFirstOrThrow({ where: { language: "python", version: { published: true, exercise: { published: true } } }, include: { version: true } });
  await db.draft.create({ data: { userId: user.id, variantId: variant.id, code: "# borrador conservado" } });
  await db.progress.create({ data: { userId: user.id, exerciseId: variant.version.exerciseId, language: "python", attempts: 1 } });
  await db.submission.create({ data: { userId: user.id, variantId: variant.id, code: "# intento conservado", mode: "submit", status: "FAILED", idempotencyKey: randomUUID() } });
  const oldCookies = await page.context().cookies();
  await openSettings(page);
  await page.getByRole("button", { name: "Desactivar cuenta", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Desactivar cuenta", exact: true });
  await expect(dialog).toContainText("No se eliminará ningún dato ni ejercicio");
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).disabledAt).toBeNull();
  await page.getByRole("button", { name: "Desactivar cuenta", exact: true }).click();
  await dialog.getByLabel("Contraseña actual").fill("incorrecta");
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Desactivar cuenta", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("No se pudo verificar");
  await dialog.getByLabel("Contraseña actual").fill(password);
  await dialog.getByRole("button", { name: "Desactivar cuenta", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/`);
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).disabledAt).not.toBeNull();
  expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  expect(await db.draft.count({ where: { userId: user.id } })).toBe(1);
  expect(await db.progress.count({ where: { userId: user.id } })).toBe(1);
  expect(await db.submission.count({ where: { userId: user.id } })).toBe(1);
  const denied = await signIn(page.request, user.email);
  expect(denied.status()).toBe(403);
  expect(await denied.json()).toMatchObject({ code: "ACCOUNT_DISABLED" });
  const adminContext = await browser.newContext({ baseURL: origin });
  try {
    const admin = await register(adminContext.request);
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/admin/cuentas");
    await expect(adminPage).toHaveURL(/\/inicio$/);
    await db.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    await adminPage.goto(`/admin/cuentas/${user.id}`);
    await adminPage.getByRole("button", { name: "Reactivar cuenta", exact: true }).click();
    const reactivation = adminPage.getByRole("dialog", { name: "Reactivar cuenta" });
    await reactivation.getByLabel("Tu contraseña actual").fill(password);
    await reactivation.getByRole("checkbox").check();
    await reactivation.getByRole("button", { name: "Reactivar cuenta", exact: true }).click();
    await expect(reactivation).toHaveCount(0);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).disabledAt).toBeNull();
    await page.context().addCookies(oldCookies);
    expect(await (await page.request.get("/api/auth/get-session")).json()).toBeNull();
    expect((await signIn(page.request, user.email)).ok()).toBeTruthy();
    await page.goto("/inicio");
    expect(await db.draft.count({ where: { userId: user.id } })).toBe(1);
  } finally { await adminContext.close(); }
});

test("el límite de reautenticación persiste y no modifica el correo", async ({ page }) => {
  const user = await register(page.request);
  await page.goto("/configuracion");
  await page.getByRole("button", { name: "Cambiar correo", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Cambiar correo", exact: true });
  await dialog.getByLabel("Nuevo correo electrónico").fill("otro@example.test");
  await dialog.getByLabel("Contraseña actual").fill("incorrecta");
  for (let i = 0; i < 5; i++) {
    await dialog.getByRole("button", { name: "Cambiar correo", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText("No se pudo verificar");
  }
  await dialog.getByLabel("Contraseña actual").fill(password);
  await dialog.getByRole("button", { name: "Cambiar correo", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Demasiados intentos");
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).email).toBe(user.email);
});
