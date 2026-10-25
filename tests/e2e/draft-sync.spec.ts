import "dotenv/config";
import { randomUUID } from "node:crypto";
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
  await expect(notice).toContainText("El navegador no pudo guardar la copia local");
  await expect(notice).toContainText("Volveremos a intentarlo automáticamente");
  await expect.poll(async () => (await db.draft.findUnique({ where: { userId_variantId: account } }))?.code).toBe(code);
  await expect(notice).not.toContainText("Volveremos a intentarlo automáticamente");
  await expect(notice).toContainText("no se pudo actualizar la copia del navegador");
});
