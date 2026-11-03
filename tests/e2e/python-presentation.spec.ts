import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { PrismaClient, Prisma } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pythonCatalog } from "../../prisma/python-content";
import { logicExercises } from "../../prisma/logic-content";
import { seedVersionContent } from "../../prisma/editorial-revision";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const prefix = `python-presentation-${Date.now()}`;
const matrixSlug = `${prefix}-matriz`;
const programSlug = `${prefix}-programa`;
const json = (value: unknown) => value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
const genericCondition = "Usa únicamente los datos y límites descritos en el enunciado.";

test.beforeAll(async () => {
  await mkdir(".local/screenshots", { recursive: true });
  // Versiones temporales: la presentación no requiere activar el catálogo Python
  // ni modificar las identidades publicadas del propietario.
  const pythonMatrix = pythonCatalog.find(exercise => exercise.slug === "logica-copia-anidada")!.content;
  const sharedMatrix = seedVersionContent(logicExercises.find(exercise => exercise.slug === "logica-copia-anidada")!);
  const program = pythonCatalog.find(exercise => exercise.slug === "logica-saludo")!.content;
  for (const [slug, content] of [
    [matrixSlug, { ...pythonMatrix, constraints: [...pythonMatrix.constraints, genericCondition], variants: [...pythonMatrix.variants, ...sharedMatrix.variants.filter(variant => variant.language !== "python")] }],
    [programSlug, program],
  ] as const) {
    const { variants, ...version } = content;
    await db.exercise.create({ data: {
      slug, category: "Prueba de presentación", order: 20000,
      versions: { create: { ...version, constraints: [...version.constraints], prerequisiteSlugs: [], published: true, variants: { create: variants.map(({ tests, ...variant }) => ({
        ...variant, tests: { create: tests.map(fixture => ({ ...fixture, input: json(fixture.input), expected: json(fixture.expected) })) },
      })) } } },
    } });
  }
});
test.afterAll(async () => {
  await db.exercise.deleteMany({ where: { slug: { in: [matrixSlug, programSlug] } } });
  await db.$disconnect();
});

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 768, 1024, 1199, 1440]) {
    test(`JSON Python anidado conserva lectura y anchura: ${theme}, ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      await page.addInitScript(value => localStorage.setItem("theme", value), theme);
      await page.goto(`/ejercicios/${matrixSlug}?lenguaje=python`);
      const example = page.locator(".example-panel").first();
      await expect(example).toBeVisible();
      await expect(page.getByText(genericCondition, { exact: true })).toHaveCount(0);
      await expect(page.getByRole("region", { name: "Condiciones del ejercicio", exact: true })).toContainText("La aplicación proporciona data");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      const input = example.locator("pre").nth(0);
      const output = example.locator("pre").nth(1);
      await expect(input).toContainText('"matriz"');
      const inputText = (await input.textContent())!;
      const outputText = (await output.textContent())!;
      expect(inputText).toBe(JSON.stringify(JSON.parse(inputText), null, 2));
      expect(outputText).toBe(JSON.stringify(JSON.parse(outputText), null, 2));
      expect(JSON.parse(outputText)).toHaveProperty("original");
      expect(JSON.parse(outputText)).toHaveProperty("copia");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await example.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      await expect(page.getByRole("button", { name: "Mostrar una pista", exact: true })).toBeVisible();
      await example.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `.local/screenshots/python-json-${theme}-${width}.png` });
      if (width === 1024 || width === 1199) {
        const statementWidth = await page.locator("#workspace-statement").evaluate(node => node.clientWidth);
        await page.getByRole("button", { name: "Código", exact: true }).click();
        const code = page.locator("#workspace-code");
        await expect(code).toBeVisible();
        await expect(code.locator(".monaco-editor")).toBeVisible();
        const codeWidth = await code.evaluate(node => node.clientWidth);
        console.info(JSON.stringify({ theme, viewport: width, statementWidth, codeWidth, layout: "pestañas" }));
        expect(codeWidth).toBeGreaterThan(600);
        await page.screenshot({ path: `.local/screenshots/python-code-${theme}-${width}.png` });
      }
    });
  }
}

for (const language of ["javascript", "typescript"] as const) {
  test(`los ejemplos de ${language} mantienen el JSON compacto`, async ({ page }) => {
    await page.goto(`/ejercicios/${matrixSlug}?lenguaje=${language}`);
    const input = page.locator(".example-panel").first().locator("pre").first();
    await expect(input).toBeVisible();
    await expect(page.getByRole("region", { name: "Condiciones del ejercicio", exact: true }).getByText(genericCondition, { exact: true })).toBeVisible();
    const text = (await input.textContent())!;
    expect(text).toBe(JSON.stringify(JSON.parse(text)));
  });
}

test("PROGRAM Python conserva salida literal sin comillas ni formato JSON", async ({ page }) => {
  await page.goto(`/ejercicios/${programSlug}?lenguaje=python`);
  const output = page.getByRole("region", { name: "Salida esperada", exact: true }).locator("pre");
  await expect(output).toBeVisible();
  expect(await output.textContent()).toBe("Hola, mundo!\n");
});
