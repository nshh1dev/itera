// Requiere la app ya activa; no inicia servidores ni crea/modifica cuentas.
import { chromium, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";

const production = process.argv.includes("--production");
const baseURL = "http://127.0.0.1:3000";
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ baseURL });
  context.setDefaultTimeout(15000);
  const page = await context.newPage();
  await expect.poll(async () => {
    try { return (await context.request.get("/iniciar-sesion", { timeout: 10000 })).status(); }
    catch { return 0; }
  }, { timeout: 120000 }).toBe(200);
  await page.goto("/iniciar-sesion?volver=%2Fejercicios");
  const button = page.getByRole("button", { name: "Entrar con mi cuenta" });
  if (production) {
    await expect(button).toHaveCount(0);
    const response = await context.request.post("/api/development-login", { headers: { origin: baseURL } });
    expect(response.status()).toBe(404);
    console.log("Compilado: botón ausente y endpoint deshabilitado (404).");
  } else {
    await expect(button).toBeVisible();
    for (const headers of [{}, { origin: "https://example.com" }, { origin: baseURL, "sec-fetch-site": "cross-site" }]) {
      expect((await context.request.post("/api/development-login", { headers })).status()).toBe(403);
    }
    await mkdir(".local/screenshots", { recursive: true });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(value => { localStorage.setItem("theme", value); }, theme);
      await page.reload();
      for (const width of [390, 1365]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(button).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await button.focus();
        await expect(button).toBeFocused();
        await page.screenshot({ path: `.local/screenshots/quick-login-${theme}-${width}.png`, fullPage: true });
      }
    }
    const credentials = JSON.parse(await readFile(".local/dev-login/credentials.json", "utf8"));
    const responsePromise = page.waitForResponse(response => response.url().endsWith("/api/development-login") && response.request().method() === "POST");
    await button.press("Enter");
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    console.log("Botón: autenticación aceptada.");
    await expect(page).toHaveURL(`${baseURL}/ejercicios`);
    const session = await (await context.request.get("/api/auth/get-session")).json();
    expect(session.user.email).toBe(credentials.email.trim().toLowerCase());
    expect((await context.cookies()).some(cookie => cookie.name.includes("session_token") && cookie.httpOnly)).toBe(true);
    const signOut = await context.request.post("/api/auth/sign-out", { headers: { origin: baseURL }, data: {} });
    expect(signOut.status()).toBe(200);
    expect(await (await context.request.get("/api/auth/get-session")).json()).toBeNull();
    console.log("Desarrollo: origen protegido, ambos temas/tamaños, teclado, acceso real, cookie HttpOnly y retorno al catálogo aprobados. Sesión cerrada.");
  }
  await context.close();
} finally { await browser.close(); }
