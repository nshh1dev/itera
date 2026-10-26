import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium, test, expect, type Page, type Worker } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { modulesForPath } from "../../src/lib/learning-modules";
import { openSimpleEditor } from "../workspace";
import { postAuth } from "./auth-request";

const baseURL = "http://127.0.0.1:3000";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
test.afterAll(async () => { await db.$disconnect(); });

type ZoomAPI = { tabs: {
  query(query: { url: string }): Promise<{ id: number }[]>;
  setZoom(id: number, factor: number): Promise<void>;
  getZoom(id: number): Promise<number>;
} };

async function setZoom(worker: Worker, page: Page, width: number) {
  await page.setViewportSize({ width, height: 1000 });
  expect(await worker.evaluate(async origin => {
    const { chrome } = globalThis as typeof globalThis & { chrome: ZoomAPI };
    const [tab] = await chrome.tabs.query({ url: `${origin}/*` });
    await chrome.tabs.setZoom(tab.id, 2);
    return chrome.tabs.getZoom(tab.id);
  }, baseURL)).toBe(2);
  await expect.poll(() => page.evaluate(() => innerWidth)).toBe(width / 2);
  await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(2);
  // No sustituir el zoom por CSS zoom, pinch zoom o font-size: 200%.
  await expect(page.locator("html")).toHaveCSS("font-size", "16px");
}

async function fits(page: Page, label: string) {
  await expect.poll(() => page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - innerWidth;
    return Math.max(0, overflow);
  }), { message: `${label}: sin desplazamiento horizontal de página` }).toBe(0);
}

async function capture(page: Page, path: string) {
  // Evitar clips de Playwright calculados en CSS px: con zoom real pueden recortar
  // la imagen o capturar una zona vacía tras desplazarse a un ancla.
  const session = await page.context().newCDPSession(page);
  let png: Buffer;
  try {
    const { data } = await session.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    png = Buffer.from(data, "base64");
  } finally { await session.detach(); }
  expect(png.readUInt32BE(16)).toBe(page.viewportSize()!.width);
  await writeFile(path, png);
}

for (const theme of ["light", "dark"] as const) {
  test(`interacción global con zoom real al 200 %: ${theme}`, async () => {
    test.setTimeout(180000);
    const tempRoot = process.platform === "win32" && process.env.LOCALAPPDATA
      ? join(process.env.LOCALAPPDATA, "Temp", "opencode") : tmpdir();
    await mkdir(tempRoot, { recursive: true });
    const profile = await mkdtemp(join(tempRoot, "itera-zoom-"));
    const extension = resolve("tests/fixtures/browser-zoom");
    const email = `zoom-${randomUUID()}@example.test`;
    const context = await chromium.launchPersistentContext(profile, {
      channel: "chromium", headless: true, baseURL,
      viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1,
      colorScheme: theme, reducedMotion: "reduce",
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
      const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
      const page = context.pages()[0];
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/inicio");
      expect(await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio }))).toEqual({ width: 1440, dpr: 1 });
      for (const width of [1440, 780, 640]) {
        await setZoom(worker, page, width);
        for (const path of ["/", "/inicio", "/ejercicios", "/rutas", "/rutas/desde-cero", "/progreso", "/iniciar-sesion", "/registro", "/recuperar-cuenta", "/restablecer-contrasena"]) {
          await page.goto(path);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await expect(page.locator("html")).toHaveClass(new RegExp(theme));
          await fits(page, `${theme} ${path} ${width / 2}px útiles`);
        }
        await page.goto("/ejercicios/logica-dos-parametros?lenguaje=typescript&ruta=desde-cero");
        await page.getByRole("button", { name: "Código", exact: true }).click();
        await openSimpleEditor(page);
        const editor = page.getByRole("textbox", { name: "Editor sencillo de TypeScript" });
        const code = "function solve(data: { a: number; b: number }): number { return data.a + data.b; }";
        await editor.fill(code);
        await page.getByRole("button", { name: "Resultados", exact: true }).click();
        await page.getByRole("button", { name: "Código", exact: true }).click();
        await expect(editor).toHaveValue(code);
        await expect(page.getByRole("button", { name: "Comprobar solución", exact: true })).toBeVisible();
        await fits(page, `taller ${theme} ${width / 2}px útiles`);
        if (width === 640) {
          await mkdir(".local/screenshots", { recursive: true });
          await capture(page, `.local/screenshots/global-zoom-workspace-${theme}.png`);
        }
      }

      await page.goto("/inicio");
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Saltar al contenido" });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#main-content$/);
      const navigation = page.getByRole("button", { name: "Abrir navegación" });
      await navigation.focus();
      await navigation.press("Enter");
      const drawer = page.getByRole("dialog", { name: "Navegación de Itera" });
      await expect(drawer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(drawer).not.toBeVisible();
      await expect(navigation).toBeFocused();
      const outline = await navigation.evaluate(el => ({ width: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle }));
      expect(outline.width).not.toBe("0px");
      expect(outline.style).not.toBe("none");

      const signup = await postAuth(context.request, "/api/auth/sign-up/email", { email, name: "Prueba de zoom", password: "Itera-zoom-local-27643" });
      expect(signup.ok(), await signup.text()).toBe(true);
      const user = await db.user.findUniqueOrThrow({ where: { email } });
      const path = await db.learningPath.findUniqueOrThrow({ where: { slug: "desde-cero" }, select: { items: { select: { exerciseId: true } } } });
      await db.progress.createMany({ data: path.items.map(item => ({ userId: user.id, exerciseId: item.exerciseId, language: "python", attempts: 1, firstPassedAt: new Date() })) });
      const count = await db.progress.count({ where: { userId: user.id } });
      await page.goto("/rutas/desde-cero?lenguaje=python");
      await expect(page.getByRole("heading", { name: "Ruta completada en Python" })).toBeVisible();
      const reviewLink = page.getByRole("link", { name: "Repasar lo aprendido", exact: true });
      await reviewLink.focus(); await reviewLink.press("Enter");
      const review = page.getByRole("button", { name: "Repasar por módulo", exact: true });
      await expect(page.getByRole("heading", { name: "Pon en práctica lo aprendido", exact: true })).toBeFocused();
      await expect(page.getByRole("heading", { name: "Pon en práctica lo aprendido", exact: true })).toBeInViewport();
      await page.keyboard.press("Tab");
      await expect(review).toBeFocused();
      await expect(review).toBeInViewport();
      await review.press("Enter");
      await expect(review).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByText(modulesForPath("desde-cero")[0].readiness[0], { exact: true })).toBeVisible();
      await fits(page, `cierre ${theme}`);
      await capture(page, `.local/screenshots/global-zoom-path-${theme}.png`);
      await page.getByRole("navigation", { name: "Lenguaje de la ruta" }).getByRole("link", { name: "JavaScript", exact: true }).click();
      await expect(page.getByRole("heading", { name: /Ruta completada en/ })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Continuar con Construye tus bases", exact: true })).toBeVisible();
      expect(await db.progress.count({ where: { userId: user.id } })).toBe(count);

      for (const path of ["/inicio", "/progreso", "/configuracion", "/configuracion?seccion=aprendizaje", "/configuracion?seccion=seguridad"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await fits(page, `${theme} cuenta ${path}`);
      }
      const password = page.getByRole("button", { name: "Cambiar contraseña", exact: true });
      await password.focus(); await password.press("Enter");
      const dialog = page.getByRole("dialog", { name: "Cambiar contraseña", exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("transform", "none");
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(password).toBeFocused();
      await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      for (const path of ["/admin", "/admin/cuentas", `/admin/cuentas/${user.id}`, "/admin/ejercicios/logica-dos-parametros"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
        await fits(page, `${theme} administración ${path}`);
      }
      expect(errors).toEqual([]);
    } finally {
      // El runner ya administra trace/screenshot, también en contextos persistentes.
      try { await context.close(); }
      finally {
        try {
          await db.auditLog.deleteMany({ where: { user: { email } } });
          await db.user.deleteMany({ where: { email } });
        } finally { await rm(profile, { recursive: true, force: true }); }
      }
    }
  });
}
