import "dotenv/config";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const prefix = `archivo-e2e-${Date.now()}`;
const emails = [`${prefix}@example.test`, `otro-${prefix}@example.test`];
const password = "Archivo-local-12345";
test.afterAll(async () => {
  await db.user.deleteMany({ where: { email: { in: emails } } });
  await db.exercise.deleteMany({ where: { slug: prefix } });
  await db.$disconnect();
});

test("el historial anterior conserva el código propio sin sumar progreso nuevo ni revelar código ajeno", async ({ page }) => {
  for (const email of emails) {
    const response = await page.request.post("/api/auth/sign-up/email", { headers: { origin: "http://127.0.0.1:3000" }, data: { name: "Prueba Archivo", email, password } });
    expect(response.ok()).toBeTruthy();
  }
  const users = await Promise.all(emails.map(email => db.user.findUniqueOrThrow({ where: { email } })));
  const exercise = await db.exercise.create({ data: { slug: prefix, category: "Fundamentos", order: 20000, published: false,
    versions: { create: { title: "Reto archivado de prueba", description: "Contenido anterior conservado.", statement: "Contenido anterior conservado.", constraints: [], hints: [], level: "BEGINNER", minutes: 5,
      variants: { create: { language: "python", starter: "", solution: "", explanation: "" } },
    } },
  }, include: { versions: { include: { variants: true } } } });
  const variantId = exercise.versions[0].variants[0].id;
  for (const [index, user] of users.entries()) {
    const code = index === 0 ? "# mi-codigo-archivado\nreturn 1" : "# MARCADOR_PRIVADO_OTRA_PERSONA";
    await db.draft.create({ data: { userId: user.id, variantId, code } });
    await db.submission.create({ data: { userId: user.id, variantId, code, mode: "submit", status: "PASSED", idempotencyKey: `${prefix}-${index}`, passedCount: 3, totalCount: 3 } });
    await db.progress.create({ data: { userId: user.id, exerciseId: exercise.id, language: "python", firstPassedAt: new Date(), attempts: 1 } });
  }
  await page.request.post("/api/auth/sign-out", { headers: { origin: "http://127.0.0.1:3000" } });
  const login = await page.request.post("/api/auth/sign-in/email", { headers: { origin: "http://127.0.0.1:3000" }, data: { email: emails[0], password } });
  expect(login.ok()).toBeTruthy();
  await page.goto("/progreso");
  const archive = page.getByRole("region", { name: "Tu catálogo anterior" });
  await expect(archive.getByText(/Resueltos en el catálogo anterior: 1 en Python/)).toBeVisible();
  await archive.getByRole("button", { name: /Borrador · Reto archivado/ }).click();
  await expect(archive.getByLabel("Código guardado de Reto archivado de prueba")).toContainText("mi-codigo-archivado");
  expect(await page.content()).not.toContain("MARCADOR_PRIVADO_OTRA_PERSONA");
  await expect(page.locator('.progress-summary dd').first()).toHaveText(/0\s*\/\s*\d+/);
  expect((await page.request.get(`/ejercicios/${prefix}`)).status()).toBe(404);
});
