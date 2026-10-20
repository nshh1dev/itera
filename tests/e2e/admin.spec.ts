import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { hashPassword } from "better-auth/crypto";
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "./auth-request";
import { languages, languageNames } from "../../src/lib/types";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const ids: string[] = [];
async function fixture(request: APIRequestContext, role: "ADMIN" | "USER" = "USER") {
  const password = randomBytes(24).toString("base64url");
  const id = randomUUID();
  const email = `admin-test-${id}@example.test`;
  await db.user.create({ data: { id, email, name: "Cuenta administrativa temporal", role, accounts: { create: { id: randomUUID(), providerId: "credential", accountId: id, password: await hashPassword(password) } } } });
  ids.push(id);
  expect((await postAuth(request, "/api/auth/sign-in/email", { email, password })).ok()).toBeTruthy();
  return { id, email, password };
}
async function confirm(page: Page, label: string, password: string) {
  await page.getByRole("button", { name: label, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: label, exact: true });
  await dialog.getByLabel("Tu contraseña actual").fill(password);
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: label, exact: true }).click();
  return dialog;
}
test.afterEach(async () => {
  await db.auditLog.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  ids.length = 0;
});
test.afterAll(async () => { await db.$disconnect(); });

test("usuarios normales no acceden ni pueden asignarse ADMIN con Better Auth", async ({ page }) => {
  const user = await fixture(page.request);
  for (const route of ["/admin", "/admin/cuentas", `/admin/cuentas/${user.id}`, "/admin/ejercicios/nuevo"]) {
    await page.goto(route); await expect(page).toHaveURL(/\/inicio$/);
  }
  await postAuth(page.request, "/api/auth/update-user", { role: "ADMIN", disabledAt: null });
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe("USER");
  const email = `role-injection-${randomUUID()}@example.test`;
  await postAuth(page.request, "/api/auth/sign-up/email", { name: "Inyección de rol", email, password: randomBytes(24).toString("base64url"), role: "ADMIN" });
  const registered = await db.user.findUnique({ where: { email } });
  if (registered) { ids.push(registered.id); expect(registered.role).toBe("USER"); }
});

test("administrador filtra cuentas, consulta estadísticas y confirma cambios de rol", async ({ page, browser }) => {
  const admin = await fixture(page.request, "ADMIN");
  const other = await browser.newContext({ baseURL: "http://127.0.0.1:3000" });
  try {
    const user = await fixture(other.request);
    await page.goto("/admin");
    const count = await db.user.count();
    await expect(page.getByText("Usuarios registrados", { exact: true }).locator("..").locator("dd")).toHaveText(String(count));
    await page.getByRole("link", { name: "Gestionar usuarios" }).click();
    await page.goto("/admin/cuentas?q=uno&q=dos&rol=ADMIN&rol=USER");
    await expect(page.getByRole("heading", { name: "Gestión de usuarios", exact: true })).toBeVisible();
    await page.getByLabel("Buscar por nombre o correo").fill(user.email);
    await page.getByLabel("Rol", { exact: true }).selectOption("USER");
    await page.getByLabel("Estado", { exact: true }).selectOption("activas");
    await page.getByRole("button", { name: "Filtrar", exact: true }).click();
    const row = page.getByRole("listitem").filter({ hasText: user.email });
    await expect(row).toHaveCount(1); await row.getByRole("link").click();
    await expect(page.getByRole("heading", { name: "Progreso del catálogo actual" })).toBeVisible();
    await page.getByRole("button", { name: "Asignar ADMIN", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Asignar ADMIN", exact: true });
    await dialog.getByLabel("Tu contraseña actual").fill("incorrecta"); await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: "Asignar ADMIN", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText("No se pudo verificar");
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe("USER");
    await dialog.getByLabel("Tu contraseña actual").fill(admin.password);
    await dialog.getByRole("button", { name: "Asignar ADMIN", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe("ADMIN");
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await (await other.request.get("http://127.0.0.1:3000/api/auth/get-session")).json()).toBeNull();
    await expect(await confirm(page, "Cambiar a USER", admin.password)).toHaveCount(0);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe("USER");
    expect(await db.auditLog.count({ where: { userId: admin.id, resource: user.id } })).toBe(2);
  } finally { await other.close(); }
});

test("desactivar desde administración revoca sesiones y una acción reenviada por USER se deniega", async ({ page, browser }) => {
  const admin = await fixture(page.request, "ADMIN");
  const member = await browser.newContext({ baseURL: "http://127.0.0.1:3000" });
  const attacker = await browser.newContext({ baseURL: "http://127.0.0.1:3000" });
  try {
    const user = await fixture(member.request);
    const normal = await fixture(attacker.request);
    const variant = await db.exerciseVariant.findFirstOrThrow({ where: { language: "python", version: { published: true, exercise: { published: true } } } });
    await db.draft.create({ data: { userId: user.id, variantId: variant.id, code: "# borrador privado" } });
    await page.goto(`/admin/cuentas/${user.id}`);
    const requestPromise = page.waitForRequest(request => request.method() === "POST" && !!request.headers()["next-action"]);
    await expect(await confirm(page, "Desactivar cuenta", admin.password)).toHaveCount(0);
    const captured = await requestPromise;
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    expect(await (await member.request.get("http://127.0.0.1:3000/api/auth/get-session")).json()).toBeNull();
    expect((await postAuth(member.request, "/api/auth/sign-in/email", { email: user.email, password: user.password })).status()).toBe(403);
    const replay = await attacker.request.post(captured.url(), { headers: { origin: "http://127.0.0.1:3000", "next-action": captured.headers()["next-action"], "content-type": captured.headers()["content-type"] }, data: captured.postData()!, maxRedirects: 0 });
    expect(replay.headers()["x-action-redirect"]).toContain("/inicio");
    expect(await db.auditLog.count({ where: { userId: normal.id } })).toBe(0);
    await expect(await confirm(page, "Reactivar cuenta", admin.password)).toHaveCount(0);
    expect((await postAuth(member.request, "/api/auth/sign-in/email", { email: user.email, password: user.password })).ok()).toBeTruthy();
    expect(await db.draft.count({ where: { userId: user.id } })).toBe(1);
  } finally { await member.close(); await attacker.close(); }
});

test("administración mantiene ambos temas, teclado y ancho móvil", async ({ page }) => {
  const admin = await fixture(page.request, "ADMIN");
  await mkdir(".local/screenshots", { recursive: true });
  for (const [theme, width] of [["light", 1440], ["dark", 320]] as const) {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/admin");
    await page.evaluate(value => { document.documentElement.classList.toggle("dark", value === "dark"); document.documentElement.classList.toggle("light", value === "light"); }, theme);
    await expect(page.getByRole("heading", { name: "Administración", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: `.local/screenshots/admin-${theme}.png`, fullPage: true, animations: "disabled" });
    await page.screenshot({ path: `.local/screenshots/admin-${theme}-viewport.png`, animations: "disabled" });
    await page.goto(`/admin/cuentas/${admin.id}`);
    const button = page.getByRole("button", { name: "Cambiar a USER", exact: true });
    await button.focus(); await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Cambiar a USER" });
    await expect(dialog).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.keyboard.press("Escape"); await expect(button).toBeFocused();
  }
});

test("perfiles locales inician sesión y muestran progreso coherente en las cuatro vistas", async ({ browser }) => {
  test.setTimeout(120_000);
  const local = await readFile(".local/dev-users.json", "utf8").catch(() => null);
  test.skip(!local, "Requiere ejecutar explícitamente el seed local de usuarios.");
  const { accounts } = JSON.parse(local!) as { accounts: { key: string; id: string; email: string; password: string }[] };
  for (const account of accounts) {
    const context = await browser.newContext({ baseURL: "http://127.0.0.1:3000" });
    try {
      const response = await postAuth(context.request, "/api/auth/sign-in/email", { email: account.email, password: account.password });
      expect(response.status(), `Acceso del perfil ${account.key}`).toBe(account.key === "desactivado" ? 403 : 200);
      if (account.key !== "multilenguaje") continue;
      const page = await context.newPage();
      const total = await db.exercise.count({ where: { published: true, versions: { some: { published: true } } } });
      for (const language of languages) {
        const done = await db.progress.count({ where: { userId: account.id, language, firstPassedAt: { not: null }, exercise: { published: true, versions: { some: { published: true } } } } });
        await page.goto(`/ejercicios?lenguaje=${language}&estado=resueltos`);
        await expect(page.getByRole("region", { name: "Resultados de ejercicios" }).getByRole("status")).toHaveText(`${done} ejercicios`);
        await page.goto(`/progreso?lenguaje=${language}`);
        await expect(page.getByText(`Resueltos en ${languageNames[language]}`, { exact: true }).locator("..").locator("dd")).toContainText(String(done));
        await page.goto(`/rutas?lenguaje=${language}`);
        const paths = await db.learningPath.findMany({ select: { title: true, items: { select: { exerciseId: true } } } });
        for (const path of paths) {
          const count = await db.progress.count({ where: { userId: account.id, language, firstPassedAt: { not: null }, exerciseId: { in: path.items.map(item => item.exerciseId) } } });
          await expect(page.getByRole("progressbar", { name: `Progreso en ${path.title}`, exact: true })).toHaveAttribute("aria-valuenow", String(count));
        }
        if (language === "python") { await page.goto("/inicio"); await expect(page.getByRole("heading", { name: `${done} de ${total} resueltos`, exact: true })).toBeVisible(); }
      }
    } finally { await postAuth(context.request, "/api/auth/sign-out", {}); await context.close(); }
  }
});
