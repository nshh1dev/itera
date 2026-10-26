import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { languages, languageNames } from "../../src/lib/types";
import { exerciseHref } from "../../src/lib/learning-paths";
import { postAuth } from "./auth-request";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
test.afterAll(async () => { await db.$disconnect(); });

test("Inicio conserva recomendaciones y progreso propios al cambiar lenguaje y cuenta", async ({ page }) => {
  const emails = [0, 1].map(() => `catalogo-${randomUUID()}@example.test`);
  try {
    const path = await db.learningPath.findUniqueOrThrow({ where: { slug: "desde-cero" }, select: { items: { orderBy: { position: "asc" }, select: { exercise: { select: { id: true, slug: true, published: true, versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: { variants: { select: { id: true, language: true, starter: true } } } } } } } } } });
    const exercises = path.items.map(item => item.exercise).filter(exercise => exercise.published && exercise.versions.length);
    expect(exercises.length).toBeGreaterThanOrEqual(3);
    expect((await postAuth(page.request, "/api/auth/sign-up/email", { name: "Catálogo temporal", email: emails[0], password: "Itera-catalogo-local-76342" })).ok()).toBe(true);
    const user = await db.user.findUniqueOrThrow({ where: { email: emails[0] } });
    await db.progress.create({ data: { userId: user.id, exerciseId: exercises[0].id, language: "python", firstPassedAt: new Date(), attempts: 1 } });
    for (const [language, index] of [["javascript", 1], ["typescript", 2]] as const) {
      const variant = exercises[index].versions[0].variants.find(variant => variant.language === language)!;
      await db.draft.create({ data: { userId: user.id, variantId: variant.id, code: variant.starter } });
    }
    for (const language of languages) {
      await db.learningProfile.upsert({ where: { userId_language: { userId: user.id, language } }, create: { userId: user.id, language, declaredLevel: "INITIATION" }, update: { declaredLevel: "INITIATION" } });
      await db.userPreference.upsert({ where: { userId: user.id }, create: { userId: user.id, language, level: "INITIATION" }, update: { language, level: "INITIATION" } });
      await page.goto("/inicio");
      const next = page.getByRole("region", { name: "Tu siguiente paso", exact: true });
      const index = language === "typescript" ? 2 : 1;
      const label = language === "python" ? "Empezar ejercicio" : "Continuar ejercicio";
      await expect(next.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", exerciseHref(exercises[index].slug, language, language === "python" ? "desde-cero" : undefined));
      await expect(next).toContainText(languageNames[language]);
      await expect(page.getByRole("region", { name: "Tu ruta", exact: true })).toContainText(`${language === "python" ? 1 : 0} de ${exercises.length}`);
    }
    expect(await db.progress.count({ where: { userId: user.id } })).toBe(1);
    await page.context().clearCookies();
    expect((await postAuth(page.request, "/api/auth/sign-up/email", { name: "Otra cuenta temporal", email: emails[1], password: "Itera-catalogo-local-97531" })).ok()).toBe(true);
    await page.goto("/inicio");
    await expect(page.getByRole("region", { name: "Tu siguiente paso", exact: true }).getByRole("link", { name: "Empezar ejercicio", exact: true })).toHaveAttribute("href", exerciseHref(exercises[0].slug, "python", "desde-cero"));
    await expect(page.getByRole("region", { name: "Tu ruta", exact: true })).toContainText(`0 de ${exercises.length}`);
    await expect(page.getByText("Cuando practiques, verás aquí tus últimos ejercicios resueltos y pendientes.", { exact: true })).toBeVisible();
  } finally { await db.user.deleteMany({ where: { email: { in: emails } } }); }
});
