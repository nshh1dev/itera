import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, unlink } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "./auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
test.afterAll(async () => { await db.$disconnect(); });

// Solicita dos enlaces para comparar cuentas. Para repetir sin esperar la ventana
// del limitador real, usar procesos/servidores de prueba independientes, no desactivarlo.
test("recuperación explica ambos modos, no revela cuentas y permite volver a entrar", async ({ page }) => {
  const email = `recuperacion-${randomUUID()}@example.test`;
  const unknown = `sin-cuenta-${randomUUID()}@example.test`;
  const password = "Itera-recuperacion-local-76342";
  const newPassword = "Itera-recuperacion-renovada-98531";
  const files = new Set<string>();
  try {
    expect((await postAuth(page.request, "/api/auth/sign-up/email", { name: "Recuperación temporal", email, password })).ok()).toBe(true);
    await page.context().clearCookies();
    const url = "/recuperar-cuenta?volver=%2Fconfiguracion%3Fseccion%3Dseguridad";
    await page.goto(url);
    await expect(page.getByText("El enlace solo se guarda en esta instalación. No se envía por correo.")).toBeVisible();
    const summary = page.getByText("Dónde encontrar el enlace", { exact: true });
    await expect(page.getByText("Instalación con Docker", { exact: true })).not.toBeVisible();
    await summary.focus(); await page.keyboard.press("Enter");
    await expect(summary).toBeFocused();
    await expect(page.getByText("Instalación nativa", { exact: true })).toBeVisible();
    await expect(page.getByText("Instalación con Docker", { exact: true })).toBeVisible();
    await expect(page.locator("pre").first()).toHaveText("node scripts/docker.mjs exec -T app ls -t .local/mail");
    await expect(page.locator("pre").last()).toHaveText("node scripts/docker.mjs exec -T app cat .local/mail/ARCHIVO.txt");
    const commands = await page.locator("pre").allTextContents();
    await mkdir(".local/screenshots", { recursive: true });
    for (const [theme, width] of [["light", 1440], ["dark", 390]] as const) {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.evaluate(value => { document.documentElement.classList.toggle("dark", value === "dark"); }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `.local/screenshots/recovery-help-${theme}.png`, fullPage: true, animations: "disabled" });
    }
    let message = "";
    let responseBody: unknown;
    for (const address of [unknown, email]) {
      await page.goto(url);
      await page.getByLabel("Correo electrónico").fill(address);
      const responsePromise = page.waitForResponse(response => response.url().endsWith("/api/auth/request-password-reset") && response.request().method() === "POST");
      await page.getByRole("button", { name: "Crear enlace", exact: true }).click();
      const response = await responsePromise;
      expect(response.status()).toBe(200);
      const body = await response.json();
      await expect(page.getByRole("status")).toContainText("Solicitud recibida.");
      await expect(page.getByRole("status")).toContainText("Si el correo está registrado");
      if (message) {
        expect(await page.getByRole("status").innerText()).toBe(message);
        expect(body).toEqual(responseBody);
      } else { message = await page.getByRole("status").innerText(); responseBody = body; }
      await expect(page.getByText("Dónde encontrar el enlace", { exact: true })).toBeVisible();
    }
    let link = "";
    await expect.poll(async () => {
      for (const file of await readdir(".local/mail")) {
        if (!file.endsWith(".txt")) continue;
        const content = await readFile(`.local/mail/${file}`, "utf8");
        if (!content.startsWith(`Para: ${email}\n`)) continue;
        files.add(file); link = content.match(/http:\/\/[^\s]+/)?.[0] ?? "";
      }
      return Boolean(link);
    }).toBe(true);
    await page.goto(link);
    await page.getByLabel("Contraseña", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Guardar contraseña", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Tu contraseña fue actualizada.");
    await page.getByRole("link", { name: "Volver a iniciar sesión", exact: true }).click();
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await expect(page).toHaveURL("/configuracion?seccion=seguridad");
    await page.getByText("Dónde encontrar el enlace", { exact: true }).click();
    await expect(page.getByText("Instalación con Docker", { exact: true })).toBeVisible();
    expect(await page.locator("pre").allTextContents()).toEqual(commands);
  } finally {
    await db.user.deleteMany({ where: { email } });
    for (const file of files) await unlink(`.local/mail/${file}`);
  }
});
