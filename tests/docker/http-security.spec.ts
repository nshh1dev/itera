import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { setTimeout as backoff } from "node:timers/promises";
import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { composeArgs, dockerCommand } from "../../scripts/docker-command.mjs";
import { postAuth } from "../e2e/auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const origin = "http://127.0.0.1:3000";
const emails: string[] = [];

// Los contadores locales son compartidos por ruta. Respetar Retry-After permite
// repetir el recorrido sin desactivar protecciones ni reiniciar la app.
async function submitAuth(page: Page, path: string, button: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const pending = page.waitForResponse(response => new URL(response.url()).pathname === path);
    await page.getByRole("button", { name: button, exact: true }).click();
    const response = await pending;
    if (response.status() !== 429 || attempt === 2) return response;
    expect((await response.allHeaders())["cache-control"]).toBe("no-store");
    const seconds = Number((await response.allHeaders())["retry-after"] ?? 10);
    await backoff((Number.isFinite(seconds) ? Math.max(1, seconds) : 10) * 1000);
  }
  throw new Error("Se agotaron los reintentos de autenticación.");
}

// Solo lee o elimina correo dirigido a nuestra cuenta aleatoria. El enlace no se
// imprime explícitamente; las trazas de fallo deben mantenerse privadas. Los
// demás archivos del volumen se conservan.
function recoveryMail(email: string, remove = false): string {
  const script = `const fs = require("node:fs");
const email = process.argv[1], remove = process.argv[2] === "remove";
let link = "";
for (const name of fs.readdirSync(".local/mail").sort()) {
  if (!name.endsWith(".txt")) continue;
  const file = ".local/mail/" + name;
  const text = fs.readFileSync(file, "utf8");
  if (!text.startsWith("Para: " + email + "\\n")) continue;
  link = text.split("\\n").map(line => line.trim()).find(line => line.startsWith("http://") || line.startsWith("https://")) || "";
  if (remove) fs.unlinkSync(file);
}
if (!remove) process.stdout.write(link);`;
  const [command, args] = dockerCommand(composeArgs(["exec", "-T", "app", "node", "-e", script, email, remove ? "remove" : "read"]));
  if (typeof command !== "string" || !Array.isArray(args)) throw new Error("Comando Docker inválido.");
  const result = spawnSync(command, args, { timeout: 15000, maxBuffer: 1024 * 1024 });
  if (result.status !== 0) throw new Error("No se pudo consultar o limpiar el correo temporal de la prueba.");
  return result.stdout.toString("utf8");
}

test.afterEach(async () => {
  for (const email of emails) {
    try { recoveryMail(email, true); }
    finally {
      const user = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (user) {
        await db.verification.deleteMany({ where: { value: user.id, identifier: { startsWith: "reset-password:" } } });
        await db.auditLog.deleteMany({ where: { userId: user.id } });
        await db.user.delete({ where: { id: user.id } });
      }
    }
  }
  emails.length = 0;
});
test.afterAll(async () => { await db.$disconnect(); });

test("el navegador recibe las cabeceras y omite Referer entre rutas locales", async ({ page }) => {
  const response = await page.goto("/iniciar-sesion?marca=synthetic-test-only");
  expect(response?.status()).toBe(200);
  const headers = await response!.allHeaders();
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-powered-by"]).toBeUndefined();
  const devices = await page.evaluate(() => {
    const policy = (document as Document & { featurePolicy: { allowsFeature(name: string): boolean } }).featurePolicy;
    return ["camera", "microphone", "geolocation"].map(name => policy.allowsFeature(name));
  });
  expect(devices).toEqual([false, false, false]);
  const pending = page.waitForRequest(request => new URL(request.url()).pathname === "/api/auth/ok");
  const status = await page.evaluate(async () => (await fetch("/api/auth/ok")).status);
  expect(status).toBe(200);
  expect((await (await pending).allHeaders()).referer).toBeUndefined();
  const session = await page.request.get("/api/auth/get-session");
  expect(session.headers()["cache-control"]).toBe("no-store");
  const missing = await page.request.get("/api/auth/does-not-exist");
  expect(missing.status()).toBe(404);
  expect(missing.headers()["cache-control"]).toBe("no-store");
});

test("registro, acceso y recuperación conservan cookies y no almacenan respuestas sensibles", async ({ page }) => {
  const email = `http-security-${randomUUID()}@example.test`;
  emails.push(email);
  const password = "tres faros junto al bosque";
  const nextPassword = "dos trenes llegan al amanecer";
  await page.goto("/registro");
  await page.getByLabel("Tu nombre").fill("Prueba HTTP");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "menos predecible" })).toBeVisible();
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  const signup = await submitAuth(page, "/api/auth/sign-up/email", "Crear cuenta");
  expect(signup.status()).toBe(200);
  expect((await signup.allHeaders())["cache-control"]).toBe("no-store");
  await expect(page.getByRole("heading", { name: "Aprende a tu manera" })).toBeVisible();
  const cookie = (await page.context().cookies()).find(cookie => cookie.name.endsWith("session_token"));
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  expect((await postAuth(page.request, "/api/auth/sign-out", {})).ok()).toBeTruthy();

  async function login(credential: string, expectedStatus: number) {
    await page.goto("/iniciar-sesion?volver=%2Fejercicios");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(credential);
    const response = await submitAuth(page, "/api/auth/sign-in/email", "Iniciar sesión");
    expect(response.status()).toBe(expectedStatus);
    expect((await response.allHeaders())["cache-control"]).toBe("no-store");
    expect((await response.request().allHeaders()).referer).toBeUndefined();
    if (expectedStatus === 200) await expect(page).toHaveURL(`${origin}/ejercicios`);
    else await expect(page.getByRole("alert").filter({ hasText: "no coinciden" })).toBeVisible();
  }

  await login(password, 200);
  await page.goto("/recuperar-cuenta");
  await page.getByLabel("Correo electrónico").fill(email);
  const recovery = await submitAuth(page, "/api/auth/request-password-reset", "Crear enlace");
  expect(recovery.status()).toBe(200);
  expect((await recovery.allHeaders())["cache-control"]).toBe("no-store");
  await expect(page.getByRole("status")).toContainText("Solicitud recibida.");
  let link = "";
  await expect.poll(() => { link = recoveryMail(email); return Boolean(link); }).toBe(true);
  expect(new URL(link).origin).toBe(origin);
  await page.goto(link);
  const token = new URL(page.url()).searchParams.get("token");
  expect(Boolean(token)).toBe(true);
  await page.getByLabel("Contraseña", { exact: true }).fill(nextPassword);
  const reset = await submitAuth(page, "/api/auth/reset-password", "Guardar contraseña");
  expect(reset.status()).toBe(200);
  expect((await reset.allHeaders())["cache-control"]).toBe("no-store");
  expect((await reset.request().allHeaders()).referer).toBeUndefined();
  await expect(page.getByRole("status")).toContainText("Tu contraseña fue actualizada.");
  const user = await db.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
  expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
  await login(password, 401);
  await login(nextPassword, 200);
  const reused = await postAuth(page.request, "/api/auth/reset-password", { token, newPassword: password });
  expect(reused.status()).toBe(400);
  expect(reused.headers()["cache-control"]).toBe("no-store");
});
