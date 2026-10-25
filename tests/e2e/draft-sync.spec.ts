import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile, mkdir } from "node:fs/promises";
import { test as base, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { openSimpleEditor } from "../workspace";
import { postAuth } from "./auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const exerciseUrl = "/ejercicios/logica-dos-parametros?lenguaje=python";
const test = base.extend<{ account: { userId: string; variantId: string } }>({
  account: async ({ page }, runTest) => {
    const email = `autoguardado-${randomUUID()}@example.test`;
    try {
      const response = await postAuth(page.request, "/api/auth/sign-up/email", { name: "Prueba de autoguardado", email, password: "Itera-autoguardado-local-63821" });
      expect(response.ok(), await response.text()).toBe(true);
      const user = await db.user.findUniqueOrThrow({ where: { email } });
      const exercise = await db.exercise.findUniqueOrThrow({ where: { slug: "logica-dos-parametros", published: true }, select: { versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: { variants: { where: { language: "python" }, select: { id: true } } } } } });
      const variantId = exercise.versions[0]?.variants[0]?.id;
      expect(variantId).toBeTruthy();
      await runTest({ userId: user.id, variantId: variantId! });
    } finally { await db.user.deleteMany({ where: { email } }); }
  },
});
test.afterAll(async () => { await db.$disconnect(); });

test("el autoguardado se recupera sin recargar tras dos fallos de red y limpia el aviso", async ({ page, account }) => {
  await page.goto(exerciseUrl);
  await openSimpleEditor(page);
  let requests = 0;
  const marker = `autoguardado-${randomUUID()}`;
  await page.route("**/ejercicios/logica-dos-parametros?*", async route => {
    const request = route.request();
    if (request.method() === "POST" && request.headers()["next-action"] && request.postData()?.includes(marker)) {
      requests++;
      if (requests <= 2) { await route.abort("connectionfailed"); return; }
    }
    await route.continue();
  });
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
  await editor.fill(`# ${marker}\ndef solve(data):\n    return 10\n`);
  const notice = page.locator("#workspace-code").getByRole("alert");
  await expect(notice).toContainText("Volveremos a intentarlo automáticamente");
  const latest = `# ${marker}\ndef solve(data):\n    return 20\n`;
  await editor.fill(latest);
  const where = { userId_variantId: account };
  await expect.poll(async () => (await db.draft.findUnique({ where }))?.code).toBe(latest);
  expect(requests).toBe(3);
  await expect(notice).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: /^Borrador:/ })).toHaveText("Borrador: Guardado");
  await expect(editor).toHaveValue(latest);
});

test("un conflicto real no sobrescribe el borrador remoto y conserva las ediciones locales", async ({ page, account }) => {
  await page.goto(exerciseUrl);
  await openSimpleEditor(page);
  const remote = "# Otra pestaña\ndef solve(data):\n    return 30\n";
  await db.draft.create({ data: { ...account, code: remote } });
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
  await editor.fill("# Mi edición pendiente\ndef solve(data):\n    return 40\n");
  await expect(page.locator("#workspace-code").getByRole("alert")).toContainText("Ya existe un borrador guardado");
  const latest = "# Conservar también esta edición\ndef solve(data):\n    return 50\n";
  await editor.fill(latest);
  await expect(editor).toHaveValue(latest);
  await expect(page.getByRole("status").filter({ hasText: /^Borrador:/ })).toContainText("Ya existe un borrador guardado");
  expect((await db.draft.findUniqueOrThrow({ where: { userId_variantId: account } })).code).toBe(remote);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).code, `itera:draft:${account.userId}:${account.variantId}`)).toBe(latest);
});

test("recuperar la conexión no oculta un fallo independiente del almacenamiento local", async ({ page, account }) => {
  await page.goto(exerciseUrl);
  await openSimpleEditor(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("itera:draft:")) throw new DOMException("Almacenamiento lleno", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  const marker = `almacenamiento-${randomUUID()}`;
  let requests = 0;
  await page.route("**/ejercicios/logica-dos-parametros?*", async route => {
    const request = route.request();
    if (request.method() === "POST" && request.headers()["next-action"] && request.postData()?.includes(marker)) {
      requests++;
      if (requests === 1) { await route.abort("connectionfailed"); return; }
    }
    await route.continue();
  });
  const code = `# ${marker}\ndef solve(data):\n    return 60\n`;
  await page.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(code);
  const notice = page.locator("#workspace-code").getByRole("alert");
  await expect(notice).toContainText("No se pudo guardar la copia local");
  await expect(notice).toContainText("Volveremos a intentarlo automáticamente");
  await expect.poll(async () => (await db.draft.findUnique({ where: { userId_variantId: account } }))?.code).toBe(code);
  await expect(notice).not.toContainText("Volveremos a intentarlo automáticamente");
  await expect(notice).toContainText("No se pudo guardar la copia local");
});

test("una copia antigua se compara, se descarga y sigue disponible después de elegir la remota y editar", async ({ page, account }) => {
  const local = "# Copia local pendiente\ndef solve(data):\n    return 70\n";
  const remote = "# Guardado en otra computadora\ndef solve(data):\n    return 80\n";
  await db.draft.create({ data: { ...account, code: remote, revision: 3 } });
  await page.goto(exerciseUrl);
  const key = `itera:draft:${account.userId}:${account.variantId}`;
  await page.evaluate(({ key, local }) => localStorage.setItem(key, JSON.stringify({ code: local, revision: 1 })), { key, local });
  await page.reload();
  await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
  await expect(editor).not.toBeEditable();
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox", { name: /Copia de la cuenta/ })).toHaveValue(remote);
  await expect(dialog.getByRole("textbox", { name: /Copia de este navegador/ })).toHaveValue(local);
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Descargar todas las copias" }).click();
  const download = await downloadPromise;
  const copies = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(copies.map((copy: { code: string }) => copy.code)).toEqual([remote, local]);
  await mkdir(".local/screenshots", { recursive: true });
  await page.screenshot({ path: ".local/screenshots/draft-recovery-desktop-light.png" });
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.screenshot({ path: ".local/screenshots/draft-recovery-mobile-dark.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await dialog.getByRole("button", { name: /Usar esta copia: Copia de la cuenta/ }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toHaveCount(0);
  // El diálogo devuelve el foco a su disparador y la elección no elimina la copia local.
  await expect(page.getByRole("button", { name: "Comparar borradores" })).toBeFocused();
  const edited = `${remote}# Edición posterior\n`;
  await editor.fill(edited);
  await expect.poll(async () => (await db.draft.findUniqueOrThrow({ where: { userId_variantId: account } })).code).toBe(edited);
  await page.reload();
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  await expect(page.getByRole("dialog").getByRole("textbox").nth(1)).toHaveValue(local);
});

test("restaurar una copia antigua usa la revisión remota actual y conserva la alternativa", async ({ page, account }) => {
  const remote = "# Remoto\n";
  const local = "# Local recuperado\n";
  await db.draft.create({ data: { ...account, code: remote, revision: 5 } });
  await page.goto(exerciseUrl);
  await page.evaluate(({ account, local }) => localStorage.setItem(`itera:draft:${account.userId}:${account.variantId}`, JSON.stringify({ code: local, revision: 1 })), { account, local });
  await page.reload();
  await openSimpleEditor(page);
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Usar esta copia: Copia de este navegador/ }).click();
  await expect.poll(async () => (await db.draft.findUniqueOrThrow({ where: { userId_variantId: account } })).revision).toBe(6);
  expect((await db.draft.findUniqueOrThrow({ where: { userId_variantId: account } })).code).toBe(local);
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toBeEditable();
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  await expect(page.getByRole("dialog").getByRole("textbox", { name: /Copia de la cuenta/ })).toHaveValue(remote);
});

test("dos pestañas conservan el código desplazado aunque una encuentre un conflicto", async ({ page, context, account }) => {
  await page.goto(exerciseUrl);
  await openSimpleEditor(page);
  const other = await context.newPage();
  try {
    await other.goto(exerciseUrl);
    await openSimpleEditor(other);
    const codeA = "# Primera pestaña\n";
    const codeB = "# Segunda pestaña\n";
    await other.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(codeB);
    await expect.poll(async () => (await db.draft.findUnique({ where: { userId_variantId: account } }))?.code).toBe(codeB);
    await page.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(codeA);
    await expect(page.locator("#workspace-code").getByRole("alert")).toContainText("Ya existe un borrador guardado");
    await page.reload();
    await page.getByRole("button", { name: "Comparar borradores" }).click();
    const codes = await page.getByRole("dialog").getByRole("textbox").evaluateAll(fields => fields.map(field => (field as HTMLTextAreaElement).value));
    expect(codes).toContain(codeA); expect(codes).toContain(codeB);
  } finally { await other.close(); }
});

test("el diagnóstico compara la copia antigua y la restaura sobre la revisión del servidor", async ({ page, account }) => {
  const local = "# Diagnóstico local pendiente\n";
  const remote = "# Diagnóstico remoto\n";
  const diagnostic = await db.diagnostic.create({ data: { userId: account.userId, language: "python", declaredLevel: "BEGINNER", items: { create: [0, 1, 2].map(position => ({ variantId: account.variantId, code: remote, revision: 4, position })) } }, include: { items: { orderBy: { position: "asc" } } } });
  await page.goto(`/diagnostico/${diagnostic.id}`);
  const item = diagnostic.items[0];
  await page.evaluate(({ userId, itemId, local }) => {
    localStorage.setItem("itera:workspace", JSON.stringify({ simple: true }));
    localStorage.setItem(`itera:diagnostic:${userId}:${itemId}`, JSON.stringify({ code: local, revision: 1 }));
  }, { userId: account.userId, itemId: item.id, local });
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Código del diagnóstico" })).not.toBeEditable();
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Usar esta copia: Copia de este navegador/ }).click();
  await expect.poll(async () => (await db.diagnosticItem.findUniqueOrThrow({ where: { id: item.id } })).revision).toBe(5);
  expect((await db.diagnosticItem.findUniqueOrThrow({ where: { id: item.id } })).code).toBe(local);
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Código del diagnóstico" })).toHaveValue(local);
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  await expect(page.getByRole("dialog").getByRole("textbox", { name: /Copia de la cuenta/ })).toHaveValue(remote);
  expect(await db.draft.count({ where: account })).toBe(0);
});

test("si el almacenamiento se llena al elegir, ambas copias siguen accesibles y descargables", async ({ page, account }) => {
  const local = "# Local sin espacio\n";
  const remote = "# Remoto sin espacio\n";
  await db.draft.create({ data: { ...account, code: remote, revision: 2 } });
  await page.goto(exerciseUrl);
  await page.evaluate(({ account, local }) => localStorage.setItem(`itera:draft:${account.userId}:${account.variantId}`, JSON.stringify({ code: local, revision: 1 })), { account, local });
  await page.reload();
  await openSimpleEditor(page);
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException("Lleno", "QuotaExceededError"); }; });
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Usar esta copia: Copia de la cuenta/ }).click();
  await expect(page.locator("#workspace-code").getByRole("alert")).toContainText("descárgalas antes de cerrar");
  await page.getByRole("button", { name: "Comparar borradores" }).click();
  await expect(page.getByRole("dialog").getByRole("textbox", { name: /Copia de este navegador/ })).toHaveValue(local);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar todas las copias" }).click();
  expect(JSON.parse(await readFile((await (await downloaded).path())!, "utf8")).map((copy: { code: string }) => copy.code)).toEqual([remote, local]);
});

test("transferir el código de invitado no toca los borradores de otras cuentas o variantes", async ({ page, account }) => {
  const guest = "# Código de invitado transferido\n";
  const unrelated = "itera:draft:otra-cuenta:otra-variante";
  await page.goto(exerciseUrl);
  await page.evaluate(({ account, guest, unrelated }) => {
    sessionStorage.setItem(`itera:transfer:${account.variantId}`, guest);
    localStorage.setItem(`itera:draft:guest:${account.variantId}`, JSON.stringify({ code: guest, revision: 0 }));
    localStorage.setItem(unrelated, "no modificar");
  }, { account, guest, unrelated });
  await page.reload();
  await openSimpleEditor(page);
  await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).toHaveValue(guest);
  await expect.poll(async () => (await db.draft.findUnique({ where: { userId_variantId: account } }))?.code).toBe(guest);
  expect(await page.evaluate(key => localStorage.getItem(key), unrelated)).toBe("no modificar");
  expect(await page.evaluate(key => sessionStorage.getItem(key), `itera:transfer:${account.variantId}`)).toBeNull();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).code, `itera:draft:guest:${account.variantId}`)).toBe(guest);
});

test("otra sesión del navegador no invalida silenciosamente una copia pendiente", async ({ page, browser, context, account }) => {
  await page.goto(exerciseUrl);
  const local = "# Pendiente en la primera sesión\n";
  await page.evaluate(({ account, local }) => localStorage.setItem(`itera:draft:${account.userId}:${account.variantId}`, JSON.stringify({ code: local, revision: 0 })), { account, local });
  const authState = await context.storageState();
  const otherContext = await browser.newContext({ baseURL: "http://127.0.0.1:3000", storageState: { cookies: authState.cookies, origins: [] } });
  try {
    const other = await otherContext.newPage();
    await other.goto(exerciseUrl);
    await openSimpleEditor(other);
    const remote = "# Guardado en la segunda sesión\n";
    await other.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(remote);
    await expect.poll(async () => (await db.draft.findUnique({ where: { userId_variantId: account } }))?.code).toBe(remote);
    await page.reload();
    await openSimpleEditor(page);
    await expect(page.getByRole("textbox", { name: "Editor sencillo de Python" })).not.toBeEditable();
    await page.getByRole("button", { name: "Comparar borradores" }).click();
    const codes = await page.getByRole("dialog").getByRole("textbox").evaluateAll(fields => fields.map(field => (field as HTMLTextAreaElement).value));
    expect(codes).toContain(local); expect(codes).toContain(remote);
  } finally { await otherContext.close(); }
});

test("si no se pueden leer las copias locales, avisa y permite guardar en la cuenta", async ({ page, account }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string) {
      if (key.startsWith("itera:draft:")) throw new DOMException("Acceso denegado", "SecurityError");
      return original.call(this, key);
    };
  });
  await page.goto(exerciseUrl);
  await openSimpleEditor(page);
  await expect(page.locator("#workspace-code").getByRole("alert")).toContainText("No se pudieron leer las copias");
  const code = "# Guardado sin acceso local\n";
  await page.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(code);
  await expect.poll(async () => (await db.draft.findUnique({ where: { userId_variantId: account } }))?.code).toBe(code);
  await expect(page.locator("#workspace-code").getByRole("alert")).toContainText("No se pudo guardar la copia local");
});

test("cerrar una pestaña sin conexión no pierde su edición desplazada por otra pestaña", async ({ page, context, account }) => {
  await page.goto(exerciseUrl);
  await openSimpleEditor(page);
  const other = await context.newPage();
  try {
    await other.goto(exerciseUrl);
    await openSimpleEditor(other);
    const local = "# Sin conexión en la primera pestaña\n";
    await page.route("**/ejercicios/logica-dos-parametros?*", async route => {
      if (route.request().headers()["next-action"] && route.request().postData()?.includes(local.trim())) { await route.abort("connectionfailed"); return; }
      await route.continue();
    });
    await page.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(local);
    await expect(page.locator("#workspace-code").getByRole("alert")).toContainText("automáticamente");
    const remote = "# La segunda pestaña guarda otra versión\n";
    await other.getByRole("textbox", { name: "Editor sencillo de Python" }).fill(remote);
    await expect.poll(async () => (await db.draft.findUnique({ where: { userId_variantId: account } }))?.code).toBe(remote);
    const key = `itera:draft:${account.userId}:${account.variantId}`;
    await expect.poll(() => other.evaluate(({ key, local }) => JSON.parse(localStorage.getItem(key)!).copies.some((copy: { code: string }) => copy.code === local), { key, local })).toBe(true);
    await page.close();
    await other.reload();
    await other.getByRole("button", { name: "Comparar borradores" }).click();
    expect(await other.getByRole("dialog").getByRole("textbox").evaluateAll(fields => fields.map(field => (field as HTMLTextAreaElement).value))).toContain(local);
  } finally { await other.close(); }
});
