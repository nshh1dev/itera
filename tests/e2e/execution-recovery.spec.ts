import "dotenv/config";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { mkdir } from "node:fs/promises";
import { test as base, expect, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "./auth-request";
import { openSimpleEditor } from "../workspace";
import type { ExecutionRequest } from "../../src/lib/execution-tracker";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const exerciseUrl = "/ejercicios/logica-dos-parametros?lenguaje=python";
let piston: Server;
const test = base.extend<{ account: { userId: string; variantId: string } }>({
  account: async ({ page }, runTest) => {
    const email = `ejecucion-${randomUUID()}@example.test`;
    try {
      expect((await postAuth(page.request, "/api/auth/sign-up/email", { name: "Recuperación de intentos", email, password: "Itera-ejecucion-local-63821" })).ok()).toBe(true);
      const user = await db.user.findUniqueOrThrow({ where: { email } });
      const exercise = await db.exercise.findUniqueOrThrow({ where: { slug: "logica-dos-parametros", published: true }, select: { versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: { variants: { where: { language: "python" }, select: { id: true } } } } } });
      const variantId = exercise.versions[0].variants[0].id;
      await runTest({ userId: user.id, variantId });
    } finally { await db.user.deleteMany({ where: { email } }); }
  },
});
test.beforeAll(async () => {
  // Doble HTTP: no interpreta ni ejecuta el código recibido.
  piston = createServer(async (request, response) => {
    for await (const _chunk of request) { void _chunk; }
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(request.url?.endsWith("/runtimes")
      ? [{ language: "python", version: "3.11.0", aliases: [] }]
      : { run: { stdout: "0", stderr: "", code: 0, signal: null } }));
  });
  await new Promise<void>((resolve, reject) => { piston.once("error", reject); piston.listen(2001, "127.0.0.1", resolve); });
});
test.afterAll(async () => { await db.$disconnect(); if (piston?.listening) await new Promise<void>(resolve => piston.close(() => resolve())); });

async function uncertainConnection(page: Page) {
  const network = { loseResponse: true, failQueries: true, bodies: [] as ExecutionRequest[] };
  await page.route("**/api/executions", async route => {
    network.bodies.push(route.request().postDataJSON());
    const response = await route.fetch();
    if (network.loseResponse) await route.abort("connectionfailed");
    else await route.fulfill({ response });
  });
  await page.route("**/api/executions/*", async route => {
    if (network.failQueries) await route.fulfill({ status: 503, json: { error: "Consulta temporalmente interrumpida." } });
    else await route.continue();
  });
  return network;
}

test("recarga y consulta fallida conservan una única reserva y la instantánea original de práctica", async ({ page, account }) => {
  await page.goto(exerciseUrl); await openSimpleEditor(page);
  const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
  const original = "def solve(data):\n    return 101\n";
  await editor.fill(original);
  const network = await uncertainConnection(page);
  await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Conservamos el intento" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toBeDisabled();
  await editor.fill("def solve(data):\n    return 202\n");
  expect(await db.submission.count({ where: { userId: account.userId } })).toBe(1);
  network.loseResponse = false;
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Consulta temporalmente interrumpida" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Comprobar solución", exact: true })).toBeDisabled();
  expect(network.bodies.length).toBeGreaterThanOrEqual(2);
  for (const body of network.bodies) expect(body).toEqual(network.bodies[0]);
  expect(network.bodies[0].code).toBe(original);
  await mkdir(".local/screenshots", { recursive: true });
  await page.screenshot({ path: ".local/screenshots/execution-recovery-light.png", animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.getByRole("button", { name: "Resultados", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".local/screenshots/execution-recovery-dark-mobile.png", animations: "disabled" });
  network.failQueries = false;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toBeEnabled();
  expect(await db.submission.count({ where: { userId: account.userId } })).toBe(1);
  expect(await page.evaluate(key => localStorage.getItem(key), `itera:execution:${account.userId}:${account.variantId}`)).toBeNull();
  expect((await db.submission.findFirstOrThrow({ where: { userId: account.userId } })).code).toBe(original);
  expect(await db.progress.count({ where: { userId: account.userId } })).toBe(0);
});

test("el diagnóstico recupera su petición perdida sin duplicar ni completar práctica", async ({ page, account }) => {
  const code = "def solve(data):\n    return 303\n";
  const diagnostic = await db.diagnostic.create({ data: { userId: account.userId, language: "python", declaredLevel: "BEGINNER", items: { create: [0, 1, 2].map(position => ({ variantId: account.variantId, code, position })) } }, include: { items: { orderBy: { position: "asc" } } } });
  await page.goto(`/diagnostico/${diagnostic.id}`);
  const network = await uncertainConnection(page);
  await page.getByRole("button", { name: "Probar ejemplos", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Conservamos el intento" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Siguiente reto", exact: true })).toBeDisabled();
  network.loseResponse = false;
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Consulta temporalmente interrumpida" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Terminar sin continuar", exact: true })).toBeDisabled();
  expect(network.bodies.length).toBeGreaterThanOrEqual(2);
  for (const body of network.bodies) expect(body).toEqual(network.bodies[0]);
  expect(network.bodies[0].diagnosticItemId).toBe(diagnostic.items[0].id);
  expect(await db.submission.count({ where: { userId: account.userId } })).toBe(1);
  network.failQueries = false;
  await expect(page.getByRole("button", { name: "Probar ejemplos", exact: true })).toBeEnabled();
  expect(await db.submission.count({ where: { userId: account.userId } })).toBe(1);
  expect(await db.progress.count({ where: { userId: account.userId } })).toBe(0);
  expect(await page.evaluate(key => localStorage.getItem(key), `itera:diagnostic-execution:${account.userId}:${diagnostic.items[0].id}:${account.variantId}`)).toBeNull();
});

test("si falla almacenar el id aceptado se sigue consultando y no se oculta el resultado", async ({ page, account }) => {
  await page.goto(exerciseUrl); await openSimpleEditor(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("itera:execution:") && JSON.parse(value).id) throw new DOMException("Sin espacio", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  const network = await uncertainConnection(page); network.loseResponse = false;
  await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "No cierres esta página" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toBeDisabled();
  network.failQueries = false;
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toBeEnabled();
  const submission = await db.submission.findFirstOrThrow({ where: { userId: account.userId } });
  expect(submission.status).not.toBe("RUNNING");
  await expect(page.getByRole("region", { name: "Resultados de ejecución", exact: true })).not.toContainText("No pudimos ejecutar el programa");
  expect(network.bodies).toHaveLength(1);
});

test("sin persistencia previa no envía; un rechazo explícito permite corregir y reintentar", async ({ page, account }) => {
  await page.goto(exerciseUrl); await openSimpleEditor(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { if (key.startsWith("itera:execution:")) throw new DOMException("Sin espacio", "QuotaExceededError"); original.call(this, key, value); };
  });
  await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
  await expect(page.getByText("No se ha enviado el programa. Habilita el almacenamiento y vuelve a intentarlo.", { exact: true })).toBeVisible();
  expect(await db.submission.count({ where: { userId: account.userId } })).toBe(0);
  await page.reload();
  let calls = 0;
  await page.route("**/api/executions", async route => { calls++; await route.fulfill({ status: 503, json: { error: "Ejecutor desconectado temporalmente." } }); });
  await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
  await expect(page.getByText("Ejecutor desconectado temporalmente.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toBeEnabled();
  expect(calls).toBe(1);
  expect(await page.evaluate(key => localStorage.getItem(key), `itera:execution:${account.userId}:${account.variantId}`)).toBeNull();
  await page.unroute("**/api/executions");
  await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
  await expect.poll(() => db.submission.count({ where: { userId: account.userId } })).toBe(1);
  await expect(page.getByRole("button", { name: "Ejecutar ejemplos", exact: true })).toBeEnabled();
});
