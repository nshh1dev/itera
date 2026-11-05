import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium, test, expect, type Page, type Worker } from "@playwright/test";
import { PrismaClient, Prisma } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { modulesForPath } from "../../src/lib/learning-modules";
import { openSimpleEditor } from "../workspace";
import { postAuth } from "./auth-request";
import { pythonCatalog } from "../../prisma/python-content";
import type { ProjectFile } from "../../src/lib/project";

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

  test(`archivos históricos Python con zoom real al 200 %: ${theme}`, async () => {
    test.setTimeout(180000);
    const tempRoot = process.platform === "win32" && process.env.LOCALAPPDATA
      ? join(process.env.LOCALAPPDATA, "Temp", "opencode") : tmpdir();
    await mkdir(tempRoot, { recursive: true });
    await mkdir(".local/screenshots", { recursive: true });
    const profile = await mkdtemp(join(tempRoot, "itera-historical-zoom-"));
    const slug = `python-historical-zoom-${randomUUID()}`;
    const email = `${slug}@example.test`;
    const extension = resolve("tests/fixtures/browser-zoom");
    const context = await chromium.launchPersistentContext(profile, {
      channel: "chromium", headless: true, baseURL,
      viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1,
      colorScheme: theme, reducedMotion: "reduce",
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
      const signup = await postAuth(context.request, "/api/auth/sign-up/email", { email, name: "Prueba de histórico ampliado", password: "Itera-historical-zoom-27643" });
      expect(signup.ok(), await signup.text()).toBe(true);
      const user = await db.user.findUniqueOrThrow({ where: { email } });
      const files: ProjectFile[] = [
        { path: "anterior.py", content: "# Trabajo histórico\ndef solve(data):\n    return data['valor']\n" },
        { path: "reglas.py", content: "# Auxiliar histórico conservado\n" },
        { path: "estado.json", content: '{"revision":"anterior"}', readOnly: true },
      ];
      const title = "Contrato histórico multarchivo ampliado";
      const content = { title, description: "Fixture de consulta histórica.", statement: "Devuelve valor.", level: "INITIATION" as const, minutes: 5, constraints: [], hints: [], published: true };
      const exercise = await db.exercise.create({ data: { slug, category: "Prueba de histórico", order: 20000,
        versions: { create: [
          { ...content, number: 1, variants: { create: [{ language: "python", starter: files[0].content, solution: files[0].content, explanation: "Referencia privada anterior.",
            project: { version: 1, entrypoint: "anterior.py", files } as unknown as Prisma.InputJsonValue,
          }] } },
          { ...content, number: 2, title: "Contrato actual", variants: { create: [{ language: "python", starter: "def solve(data):\n    return 0\n", solution: "def solve(data):\n    return 0\n", explanation: "Referencia actual." }] } },
        ] },
      }, include: { versions: { orderBy: { number: "asc" }, include: { variants: true } } } });
      const variantId = exercise.versions[0].variants[0].id;
      await db.draft.create({ data: { userId: user.id, variantId, code: "", files: files as unknown as Prisma.InputJsonValue, revision: 7 } });
      // Envío simulado para consulta; no acredita ejecución ni progreso.
      await db.submission.create({ data: { userId: user.id, variantId, code: "", files: files as unknown as Prisma.InputJsonValue, mode: "submit", status: "PASSED", passedCount: 1, totalCount: 1, idempotencyKey: randomUUID(), finishedAt: new Date() } });
      const snapshot = async () => ({
        drafts: await db.draft.findMany({ where: { userId: user.id }, orderBy: { id: "asc" } }),
        submissions: await db.submission.findMany({ where: { userId: user.id }, orderBy: { id: "asc" } }),
        progress: await db.progress.findMany({ where: { userId: user.id } }),
      });
      const before = await snapshot();
      const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
      const page = context.pages()[0];
      const errors: string[] = [];
      const executions: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("request", request => { if (request.method() === "POST" && new URL(request.url()).pathname === "/api/executions") executions.push(request.url()); });
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      await page.goto("/progreso?lenguaje=python");
      expect(await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio }))).toEqual({ width: 1440, dpr: 1 });
      for (const width of [1440, 780, 640]) {
        await setZoom(worker, page, width);
        await page.goto("/progreso?lenguaje=python");
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        const archive = page.getByRole("button", { name: "Borradores de versiones anteriores", exact: true });
        await archive.focus(); await archive.press("Enter");
        const version = page.getByRole("button", { name: `${title} · Versión 1`, exact: true });
        await version.focus(); await version.press("Enter");
        const historical = page.getByLabel(`Borrador de ${title}, versión 1`, { exact: true });
        for (const file of files) await expect(historical).toContainText(`${file.path}${file.readOnly ? " · lectura" : ""}\n${file.content}`);
        await historical.focus();
        await expect(historical).toBeFocused();
        expect(await historical.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe("none");
        await historical.scrollIntoViewIfNeeded();
        await expect(historical).toBeInViewport();
        if (await historical.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await historical.press("ArrowRight");
          await expect.poll(() => historical.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
          await historical.press("ArrowLeft");
          await expect.poll(() => historical.evaluate(node => node.scrollLeft)).toBe(0);
        }
        await fits(page, `archivos históricos ${theme} ${width / 2}px`);
        await capture(page, `.local/screenshots/python-historical-zoom-${theme}-${width}.png`);
        await version.press("Enter");
        await expect(version).toHaveAttribute("aria-expanded", "false");
        await expect(historical).not.toBeVisible();
        await expect(version).toBeFocused();
      }
      await db.exercise.update({ where: { id: exercise.id }, data: { published: false } });
      await page.goto("/progreso?lenguaje=python");
      const retired = page.getByRole("button", { name: "Tu catálogo anterior", exact: true });
      await retired.focus(); await retired.press("Enter");
      for (const [kind, label] of [["Borrador", "Código guardado de"], ["Intento", "Código enviado a"]]) {
        const toggle = page.getByRole("button", { name: `${kind} · ${title} · Python`, exact: true });
        await toggle.focus(); await toggle.press("Enter");
        const code = page.getByLabel(`${label} ${title}`, { exact: true });
        for (const file of files) await expect(code).toContainText(file.content);
        await code.focus();
        await expect(code).toBeFocused();
        await code.scrollIntoViewIfNeeded();
        await fits(page, `archivo retirado ${kind} ${theme}`);
        await capture(page, `.local/screenshots/python-historical-retired-zoom-${kind.toLowerCase()}-${theme}.png`);
        await toggle.press("Enter");
        await expect(code).not.toBeVisible();
        await expect(toggle).toBeFocused();
      }
      expect(await snapshot()).toEqual(before);
      expect(before.progress).toEqual([]);
      expect(executions).toEqual([]);
      expect(errors).toEqual([]);
    } finally {
      try { await context.close(); }
      finally {
        try { await db.exercise.deleteMany({ where: { slug } }); }
        finally {
          try { await db.user.deleteMany({ where: { email } }); }
          finally { await rm(profile, { recursive: true, force: true }); }
        }
      }
    }
  });

  test(`encabezados y ayudas Python con zoom real al 200 %: ${theme}`, async () => {
    test.setTimeout(180000);
    const tempRoot = process.platform === "win32" && process.env.LOCALAPPDATA
      ? join(process.env.LOCALAPPDATA, "Temp", "opencode") : tmpdir();
    await mkdir(tempRoot, { recursive: true });
    await mkdir(".local/screenshots", { recursive: true });
    const profile = await mkdtemp(join(tempRoot, "itera-python-zoom-"));
    const slug = `python-zoom-${randomUUID()}`;
    const email = `${slug}@example.test`;
    const extension = resolve("tests/fixtures/browser-zoom");
    const context = await chromium.launchPersistentContext(profile, {
      channel: "chromium", headless: true, baseURL,
      viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1,
      colorScheme: theme, reducedMotion: "reduce",
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
      // Texto sintético de presentación: prueba opciones que no se deben insertar
      // en contenido del propietario para hacerlas aparecer en el navegador.
      const { variants, ...version } = pythonCatalog.find(entry => entry.slug === "logica-dos-parametros")!.content;
      const statement = "Antes de resolver\nConsulta `data` sin interpretar <script>window.editorialInjected = true</script>.\n\nEntrada y resultado\nDevuelve `data['a'] + data['b']`. Conserva literales las marcas ``dobles`` y `incompleta.";
      const json = (value: unknown) => value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
      await db.exercise.create({ data: { slug, category: "Prueba de presentación", order: 20000,
        versions: { create: { ...version, statement, prerequisiteSlugs: [], published: true,
          variants: { create: variants.map(({ tests, ...variant }) => ({ ...variant, statement,
            tests: { create: tests.map(fixture => ({ ...fixture, input: json(fixture.input), expected: json(fixture.expected) })) },
          })) } } },
      } });
      const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
      const page = context.pages()[0];
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      const checkStatement = async () => {
        const statementPanel = page.locator("#exercise-statement");
        for (const name of ["Antes de resolver", "Entrada y resultado"]) await expect(statementPanel.getByRole("heading", { name, exact: true })).toBeVisible();
        await expect(statementPanel.locator("code")).toHaveText(["data", "data['a'] + data['b']"]);
        await expect(statementPanel).toContainText("<script>window.editorialInjected = true</script>");
        await expect(statementPanel).toContainText("``dobles`` y `incompleta.");
        await expect(statementPanel.locator("script")).toHaveCount(0);
        expect(await page.evaluate(() => "editorialInjected" in window)).toBe(false);
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        await fits(page, `encabezados Python ${theme}`);
      };
      for (const width of [390, 768, 1024, 1199, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/ejercicios/${slug}?lenguaje=python`);
        await checkStatement();
        await capture(page, `.local/screenshots/python-headings-${theme}-${width}.png`);
      }
      const signup = await postAuth(context.request, "/api/auth/sign-up/email", { email, name: "Prueba de ayudas ampliadas", password: "Itera-python-zoom-27643" });
      expect(signup.ok(), await signup.text()).toBe(true);
      const user = await db.user.findUniqueOrThrow({ where: { email } });
      const variant = await db.exerciseVariant.findFirstOrThrow({ where: { language: "python", version: { published: true, exercise: { slug: "logica-dos-parametros" } } }, orderBy: { version: { number: "desc" } } });
      await db.submission.create({ data: { userId: user.id, variantId: variant.id, mode: "examples", status: "FAILED", code: "# prueba temporal", idempotencyKey: email, passedCount: 0, totalCount: 2 } });
      for (const width of [1440, 780, 640]) {
        await setZoom(worker, page, width);
        await page.goto(`/ejercicios/${slug}?lenguaje=python`);
        await checkStatement();
        await capture(page, `.local/screenshots/python-headings-zoom-${theme}-${width}.png`);
        // El ejercicio publicado aporta contexto modular real, sin modificarlo.
        await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python&ruta=desde-cero");
        await page.getByRole("button", { name: "Código", exact: true }).click();
        await openSimpleEditor(page);
        const editor = page.getByRole("textbox", { name: "Editor sencillo de Python" });
        const code = "def solve(data):\n    return data['a'] + data['b']\n";
        await editor.fill(code);
        await page.getByRole("button", { name: "Enunciado", exact: true }).click();
        const help = page.locator(".workspace-reference");
        const theory = help.getByRole("button", { name: "Teoría y objetivos", exact: true });
        await expect(theory).toHaveAttribute("aria-expanded", "false");
        await theory.focus(); await theory.press("Space");
        const moduleTheory = help.getByRole("region", { name: "Teoría y ejemplo", exact: true });
        await expect(moduleTheory).toBeVisible();
        await expect(moduleTheory.locator("pre")).not.toBeEmpty();
        await fits(page, `teoría Python ${theme} ${width / 2}px`);
        await moduleTheory.scrollIntoViewIfNeeded();
        await capture(page, `.local/screenshots/python-theory-zoom-${theme}-${width}.png`);
        await theory.press("Space");
        await expect(theory).toBeFocused();
        const hints = page.getByRole("region", { name: "Pistas", exact: true });
        await hints.getByRole("button", { name: "Mostrar una pista", exact: true }).click();
        await expect(hints.getByRole("heading", { name: "Pista 1", exact: true })).toBeVisible();
        const solution = page.getByRole("button", { name: "Ver solución explicada", exact: true });
        await solution.focus(); await solution.press("Enter");
        const dialog = page.getByRole("dialog", { name: "Solución explicada", exact: true });
        await expect(dialog.locator("pre")).toBeVisible();
        await expect(dialog).toContainText("Leerla no marca el ejercicio como resuelto.");
        expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
        await capture(page, `.local/screenshots/python-solution-zoom-${theme}-${width}.png`);
        await dialog.locator("pre").scrollIntoViewIfNeeded();
        await expect(dialog.locator("pre")).toBeInViewport();
        await capture(page, `.local/screenshots/python-solution-code-zoom-${theme}-${width}.png`);
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(solution).toBeFocused();
        await expect(hints.getByRole("heading", { name: "Pista 1", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Código", exact: true }).click();
        await expect(editor).toHaveValue(code);
        await fits(page, `editor Python ${theme} ${width / 2}px`);
      }
      expect(await db.progress.count({ where: { userId: user.id } })).toBe(0);
      expect(errors).toEqual([]);
    } finally {
      try { await context.close(); }
      finally {
        try { await db.user.deleteMany({ where: { email } }); }
        finally {
          try { await db.exercise.deleteMany({ where: { slug } }); }
          finally { await rm(profile, { recursive: true, force: true }); }
        }
      }
    }
  });
}
