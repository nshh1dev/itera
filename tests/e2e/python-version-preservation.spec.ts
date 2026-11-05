import "dotenv/config";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "./auth-request";
import { openSimpleEditor } from "../workspace";
import type { ProjectFile } from "../../src/lib/project";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const users: string[] = [];
const exercises: string[] = [];
test.afterEach(async () => {
  await db.exercise.deleteMany({ where: { id: { in: exercises } } }); exercises.length = 0;
  await db.user.deleteMany({ where: { id: { in: users } } }); users.length = 0;
});
test.afterAll(async () => { await db.$disconnect(); });

for (const project of [false, true]) {
  test(`una revisión Python conserva versiones, borradores y envíos anteriores: ${project ? "multifichero" : "FUNCTION a PROGRAM"}`, async ({ page }) => {
    const email = `python-version-${randomUUID()}@example.test`;
    const registered = await postAuth(page.request, "/api/auth/sign-up/email", { email, name: "Conservación de versiones", password: "Itera-versiones-12345" });
    expect(registered.ok(), await registered.text()).toBe(true);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    users.push(user.id);
    const slug = `python-version-${randomUUID()}`;
    const oldTitle = `Contrato anterior ${project ? "multifichero" : "FUNCTION"}`;
    const oldCode = "# Trabajo anterior conservado\ndef solve(data):\n    return data['a']\n";
    const oldFiles: ProjectFile[] = [
      { path: "main.py", content: oldCode },
      { path: "reglas.py", content: "# Auxiliar anterior conservado\n" },
      { path: "estado.json", content: '{"revision":"anterior"}', readOnly: true },
    ];
    const content = { title: oldTitle, description: "Contrato anterior.", statement: "Entrada\nUn diccionario con a.\n\nResultado esperado\nDevuelve a.", level: "INITIATION" as const, minutes: 5, constraints: [], hints: [] };
    const exercise = await db.exercise.create({ data: {
      slug, category: "Prueba de conservación", order: 20000,
      versions: { create: { ...content, published: true, variants: { create: ["python", "javascript", "typescript"].map(language => ({
        language, starter: language === "python" ? "def solve(data):\n    return 0\n" : "function solve(data) { return 0; }",
        solution: language === "python" ? oldCode : "function solve(data) { return data.a; }", explanation: "Referencia anterior.",
        ...(project && language === "python" ? { project: { version: 1, entrypoint: "main.py", files: oldFiles } as unknown as Prisma.InputJsonValue, solutionFiles: oldFiles as unknown as Prisma.InputJsonValue } : {}),
        tests: { create: [{ order: 0, visible: true, input: { a: 7 }, expected: 7 }] },
      })) } } },
    }, include: { versions: { include: { variants: true } } } });
    exercises.push(exercise.id);
    const oldVersion = exercise.versions[0];
    const python = oldVersion.variants.find(variant => variant.language === "python")!;
    for (const variant of oldVersion.variants) await db.draft.create({ data: {
      userId: user.id, variantId: variant.id, code: variant.language === "python" ? project ? "" : oldCode : `// Borrador ${variant.language} anterior\nfunction solve(data) { return data.a; }`, revision: 4,
      ...(project && variant.language === "python" ? { files: oldFiles as unknown as Prisma.InputJsonValue } : {}),
    } });
    await db.progress.createMany({ data: oldVersion.variants.map(variant => ({ userId: user.id, exerciseId: exercise.id, language: variant.language, attempts: 2, firstPassedAt: new Date("2026-01-01T00:00:00Z") })) });
    // Histórico simulado: prueba conservación, no ejecución del programa.
    const submission = await db.submission.create({ data: {
      userId: user.id, variantId: python.id, code: project ? "" : oldCode, mode: "submit", status: "PASSED", idempotencyKey: randomUUID(), passedCount: 1, totalCount: 1, finishedAt: new Date(),
      results: [{ index: 1, visible: true, passed: true, status: "passed", input: { a: 7 }, expected: 7, actual: 7 }],
      ...(project ? { files: oldFiles as unknown as Prisma.InputJsonValue } : {}),
    } });
    const snapshot = async () => ({
      version: await db.exerciseVersion.findUniqueOrThrow({ where: { id: oldVersion.id }, include: { variants: { orderBy: { language: "asc" }, include: { tests: { orderBy: { order: "asc" } } } } } }),
      drafts: await db.draft.findMany({ where: { userId: user.id, variantId: { in: oldVersion.variants.map(variant => variant.id) } }, orderBy: { variantId: "asc" } }),
      submission: await db.submission.findUniqueOrThrow({ where: { id: submission.id } }),
      progress: await db.progress.findMany({ where: { userId: user.id }, orderBy: { language: "asc" } }),
    });
    const before = await snapshot();
    const oldResult = await (await page.request.get(`/api/executions/${submission.id}`)).json();
    const executions: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && new URL(request.url()).pathname === "/api/executions") executions.push(request.url()); });
    await page.goto(`/ejercicios/${slug}?lenguaje=python`);
    await openSimpleEditor(page);
    await expect(page.getByRole("textbox", { name: project ? "Editor sencillo de main.py" : "Editor sencillo de Python", exact: true })).toHaveValue(oldCode);
    const key = `itera:draft:${user.id}:${python.id}`;
    const local = JSON.stringify(project ? { version: 2, files: oldFiles, revision: 4, baseFiles: oldFiles } : { code: oldCode, revision: 4, baseCode: oldCode });
    await page.evaluate(({ key, local }) => localStorage.setItem(key, local), { key, local });

    const newStarter = project ? "# Nuevo manifiesto\ndef solve(data):\n    return data['valor']\n" : 'print("Revisión nueva")\n';
    const newFiles: ProjectFile[] = [
      { path: "nuevo.py", content: newStarter },
      { path: "reglas.py", content: "# Auxiliar de la revisión nueva\n" },
      { path: "estado.json", content: '{"revision":"nueva"}', readOnly: true },
    ];
    const newContent = {
      ...content, exerciseId: exercise.id, title: "Contrato nuevo solo Python", statement: project ? "Entrada\nUn diccionario con valor." : "Tu tarea\nImprime Revisión nueva.",
      runtimeMode: project ? "FUNCTION" as const : "PROGRAM" as const,
      variants: { create: [{ language: "python", starter: newStarter, solution: newStarter, explanation: "Referencia nueva.",
        ...(project ? { project: { version: 1, entrypoint: "nuevo.py", files: newFiles } as unknown as Prisma.InputJsonValue, solutionFiles: newFiles as unknown as Prisma.InputJsonValue } : {}),
        tests: { create: [{ order: 0, visible: true, input: project ? { valor: 9 } : "", expected: project ? 9 : "Revisión nueva\n" }] },
      }] },
    };
    // Publicación simulada únicamente de este fixture; no ejecuta content:python.
    const current = await db.exerciseVersion.create({ data: { ...newContent, number: 2, published: true }, include: { variants: true } });
    await db.exerciseVersion.create({ data: { ...newContent, number: 3, published: false, title: "Borrador no publicado" } });
    const currentVariant = current.variants[0];
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Contrato nuevo solo Python", exact: true })).toBeVisible();
    await openSimpleEditor(page);
    const editor = page.getByRole("textbox", { name: project ? "Editor sencillo de nuevo.py" : "Editor sencillo de Python", exact: true });
    await expect(editor).toHaveValue(newStarter);
    if (project) {
      const picker = page.getByLabel("Archivo del proyecto", { exact: true });
      await expect(picker.locator("option")).toHaveText(["nuevo.py", "reglas.py", "estado.json · lectura"]);
      await picker.selectOption("estado.json");
      await expect(page.getByRole("textbox", { name: "Editor sencillo de estado.json", exact: true })).toHaveValue(newFiles[2].content);
      await expect(page.getByRole("textbox", { name: "Editor sencillo de estado.json", exact: true })).toHaveAttribute("readonly", "");
      await picker.selectOption("nuevo.py");
    }
    const edited = `${newStarter}# Edición de la revisión nueva\n`;
    await editor.fill(edited);
    await expect.poll(async () => {
      const draft = await db.draft.findUnique({ where: { userId_variantId: { userId: user.id, variantId: currentVariant.id } } });
      return project ? (draft?.files as ProjectFile[] | null)?.find(file => file.path === "nuevo.py")?.content : draft?.code;
    }).toBe(edited);
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(local);
    expect(await snapshot()).toEqual(before);
    const result = await page.request.get(`/api/executions/${submission.id}`);
    expect(result.ok()).toBe(true);
    expect(await result.json()).toEqual(oldResult);
    await page.getByRole("button", { name: "Historial", exact: true }).click();
    const history = page.getByRole("dialog", { name: "Historial de este ejercicio", exact: true });
    await expect(history).toContainText(oldTitle);
    await expect(history).toContainText("Resuelto");
    await history.getByRole("button", { name: "Cerrar", exact: true }).click();
    for (const language of ["javascript", "typescript"]) {
      await page.goto(`/ejercicios/${slug}?lenguaje=${language}`);
      await expect(page.getByRole("heading", { level: 1, name: oldTitle, exact: true })).toBeVisible();
      await openSimpleEditor(page);
      await expect(page.getByRole("textbox", { name: `Editor sencillo de ${language === "javascript" ? "JavaScript" : "TypeScript"}`, exact: true })).toHaveValue(before.drafts.find(draft => draft.variantId === oldVersion.variants.find(variant => variant.language === language)!.id)!.code);
    }
    await page.goto("/progreso?lenguaje=python");
    const archive = page.getByRole("button", { name: "Borradores de versiones anteriores", exact: true });
    await archive.focus(); await archive.press("Enter");
    await page.getByRole("button", { name: `${oldTitle} · Versión 1`, exact: true }).click();
    await expect(page.getByLabel(`Borrador de ${oldTitle}, versión 1`, { exact: true })).toContainText(oldCode);
    if (project) for (const file of oldFiles) await expect(page.getByLabel(`Borrador de ${oldTitle}, versión 1`, { exact: true })).toContainText(file.content);
    if (project) {
      await mkdir(".local/screenshots", { recursive: true });
      for (const theme of ["light", "dark"] as const) for (const width of [390, 768, 1024, 1199, 1440]) {
        await page.evaluate(value => localStorage.setItem("theme", value), theme);
        await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.reload();
        await page.getByRole("button", { name: "Borradores de versiones anteriores", exact: true }).click();
        await page.getByRole("button", { name: `${oldTitle} · Versión 1`, exact: true }).click();
        const historical = page.getByLabel(`Borrador de ${oldTitle}, versión 1`, { exact: true });
        await historical.focus();
        await expect(historical).toBeFocused();
        await historical.scrollIntoViewIfNeeded();
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: `.local/screenshots/python-historical-${theme}-${width}.png`, animations: "disabled" });
      }
    }
    // El mismo defecto no debe reaparecer al retirar este ejercicio temporal.
    await db.exercise.update({ where: { id: exercise.id }, data: { published: false } });
    await page.goto("/progreso?lenguaje=python");
    await page.getByRole("button", { name: "Tu catálogo anterior", exact: true }).click();
    await page.getByRole("button", { name: `Borrador · ${oldTitle} · Python`, exact: true }).click();
    await page.getByRole("button", { name: `Intento · ${oldTitle} · Python`, exact: true }).click();
    for (const label of [`Código guardado de ${oldTitle}`, `Código enviado a ${oldTitle}`]) {
      await expect(page.getByLabel(label, { exact: true })).toContainText(oldCode);
      if (project) for (const file of oldFiles) await expect(page.getByLabel(label, { exact: true })).toContainText(file.content);
    }
    expect(await snapshot()).toEqual(before);
    expect(await db.submission.count({ where: { userId: user.id } })).toBe(1);
    expect(executions).toEqual([]);
  });
}
