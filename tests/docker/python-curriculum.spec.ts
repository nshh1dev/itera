import { test, expect } from "@playwright/test";
import { pythonCatalog } from "../../prisma/python-content";
import { pythonCurriculumUnits } from "../../src/lib/python-curriculum";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { openSimpleEditor } from "../workspace";

test("Python publicado ofrece sus puentes y otros lenguajes conservan su ruta", async ({ page }) => {
  await page.goto("/rutas/desde-cero?lenguaje=python");
  const count = pythonCatalog.filter(entry => entry.content.level === "INITIATION").length;
  await expect(page.getByText(`0 de ${count} completados`, { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /Nombres que expresan una constante/ })).toBeVisible();
  for (const language of ["javascript", "typescript"]) {
    await page.goto(`/rutas/desde-cero?lenguaje=${language}`);
    await expect(page.getByText("0 de 30 completados", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: /Nombres que expresan una constante/ })).toHaveCount(0);
  }
});

test("las rutas y el espacio Python presentan el orden anterior/siguiente correcto", async ({ page }) => {
  await page.goto("/ejercicios/python-constante?lenguaje=python&ruta=desde-cero");
  await expect(page.getByRole("heading", { name: "Calcula con una equivalencia constante", exact: true })).toBeVisible();
  await expect(page.locator('a[href*="/ejercicios/logica-parentesis"]').first()).toBeVisible();
  await expect(page.locator('a[href*="/ejercicios/logica-lee-nombre"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: "JavaScript · ir a su ruta", exact: true })).toHaveAttribute("href", "/rutas/desde-cero?lenguaje=javascript");
  await page.goto("/ejercicios/python-constante?lenguaje=javascript&ruta=desde-cero");
  await expect(page.getByRole("heading", { name: /no está disponible en JavaScript/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Python", exact: true })).toBeVisible();
});

test("una actividad exclusiva reanuda borrador y ruta y solo el envío correcto concede progreso Python", async ({ page, baseURL }) => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const email = `python-recorrido-${Date.now()}@example.test`;
  try {
    const response = await page.request.post("/api/auth/sign-up/email", { headers: { origin: baseURL! }, data: { name: "Prueba Python", email, password: "Recorrido-Python-local-654321" } });
    expect(response.ok()).toBe(true);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    const exercise = await db.exercise.findUniqueOrThrow({ where: { slug: "python-centinela" } });
    const code = "def solve(data):\n    salida = []\n    for n in data:\n        if n == 0:\n            break\n        salida.append(n)\n    return salida\n";
    await page.goto("/ejercicios/python-centinela?lenguaje=python&ruta=primeros-pasos");
    await openSimpleEditor(page);
    await page.getByRole("textbox", { name: "Editor sencillo de Python", exact: true }).fill(code);
    await expect.poll(async () => (await db.draft.findFirst({ where: { userId: user.id, variant: { version: { exerciseId: exercise.id } } } }))?.code).toBe(code);
    await expect.poll(async () => (await db.practiceContext.findFirst({ where: { userId: user.id, exerciseId: exercise.id, language: "python" } }))?.pathSlug).toBe("primeros-pasos");
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Editor sencillo de Python", exact: true })).toHaveValue(code);
    await page.getByRole("button", { name: "Ejecutar ejemplos", exact: true }).click();
    await expect(page.getByText("2 / 2 pruebas", { exact: false })).toBeVisible({ timeout: 40000 });
    expect(await db.progress.count({ where: { userId: user.id, exerciseId: exercise.id, firstPassedAt: { not: null } } })).toBe(0);
    await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
    await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible({ timeout: 40000 });
    const progress = await db.progress.findMany({ where: { userId: user.id, firstPassedAt: { not: null } } });
    expect(progress.map(entry => entry.language)).toEqual(["python"]);
    expect(progress[0].exerciseId).toBe(exercise.id);
  } finally {
    await db.user.deleteMany({ where: { email } });
    await db.$disconnect();
  }
});

for (const colorScheme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`los módulos Python se leen en ${colorScheme} a ${width}px sin desbordamiento`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/rutas/pensar-en-soluciones?lenguaje=python");
      const first = pythonCurriculumUnits.find(unit => unit.path === "pensar-en-soluciones")!;
      await expect(page.getByRole("button", { name: new RegExp(first.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("A");
      await page.screenshot({ path: `.local/screenshots/python-ruta-${colorScheme}-${width}.png` });
    });
  }
}
