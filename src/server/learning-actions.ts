"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "./auth";
import { db } from "./db";
import { languageSchema } from "@/lib/validation";
import { levels } from "@/lib/types";
import { diagnosticExercises, diagnosticRecommendation, diagnosticRulesVersion } from "@/lib/learning-profile";
import { getLearningSummary } from "@/server/learning";

const learningSchema = z.object({ language: languageSchema, level: z.enum(levels), finishOnboarding: z.boolean().optional() });
const idSchema = z.string().min(1).max(100);

export async function saveLearningPreferences(input: unknown) {
  const user = await requireUser();
  const parsed = learningSchema.safeParse(input);
  if (!parsed.success) return { error: "Elige un lenguaje y un nivel." };
  const { language, level, finishOnboarding } = parsed.data;
  await db.$transaction([
    db.learningProfile.upsert({ where: { userId_language: { userId: user.id, language } }, create: { userId: user.id, language, declaredLevel: level }, update: { declaredLevel: level } }),
    db.userPreference.upsert({ where: { userId: user.id }, create: { userId: user.id, language, level }, update: { language, level } }),
    db.user.updateMany({ where: { id: user.id, onboardingStep: finishOnboarding ? { gt: 0 } : 2 }, data: { onboardingStep: finishOnboarding ? 0 : 3 } }),
  ]);
  revalidatePath("/", "layout");
  const pathSlug = finishOnboarding ? (await getLearningSummary(user.id, language)).path.slug : undefined;
  return { success: true, pathSlug };
}

export async function saveAccountName(input: unknown) {
  const user = await requireUser();
  const parsed = z.string().trim().min(2, "Usa al menos 2 caracteres.").max(60, "Usa como máximo 60 caracteres.").safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function finishOnboarding() {
  const user = await requireUser();
  await db.user.update({ where: { id: user.id }, data: { onboardingStep: 0 } });
  revalidatePath("/", "layout");
}

export async function skipOnboardingDiagnostic() {
  const user = await requireUser();
  await db.user.updateMany({ where: { id: user.id, onboardingStep: 3 }, data: { onboardingStep: 4 } });
  revalidatePath("/bienvenida");
}

export async function startDiagnostic(input: unknown) {
  const user = await requireUser();
  const parsed = languageSchema.safeParse(input);
  if (!parsed.success) return { error: "Elige un lenguaje válido." };
  const language = parsed.data;
  const profile = await db.learningProfile.findUnique({ where: { userId_language: { userId: user.id, language } } });
  if (!profile) return { error: "Guarda primero tu nivel para este lenguaje." };
  const slugs = diagnosticExercises[profile.declaredLevel];
   const exercises = await db.exercise.findMany({ where: { slug: { in: [...slugs] }, published: true }, select: { slug: true, versions: { where: { published: true, variants: { some: { language } } }, orderBy: { number: "desc" }, take: 1, select: { variants: { where: { language }, select: { id: true, starter: true, tests: { select: { id: true } } } } } } } });
  const variants = slugs.map(slug => exercises.find(exercise => exercise.slug === slug)?.versions[0]?.variants[0]);
  if (variants.some(variant => !variant || !variant.tests.length)) return { error: "El diagnóstico no está disponible en este catálogo. Puedes continuar sin hacerlo." };
  const diagnostic = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742901)`;
    const existing = await tx.diagnostic.findFirst({ where: { userId: user.id, language, declaredLevel: profile.declaredLevel, finishedAt: null }, orderBy: { createdAt: "desc" } });
    if (existing) return existing;
    return tx.diagnostic.create({ data: { userId: user.id, language, declaredLevel: profile.declaredLevel, rulesVersion: diagnosticRulesVersion(language), items: { create: variants.map((variant, position) => ({ variantId: variant!.id, code: variant!.starter, position })) } } });
  });
  return { id: diagnostic.id };
}

export async function saveDiagnosticDraft(input: unknown) {
  const user = await requireUser();
  const parsed = z.object({ itemId: idSchema, code: z.string().max(30000), revision: z.number().int().min(1) }).safeParse(input);
  if (!parsed.success) return { error: "El borrador no es válido." };
  const { itemId, code, revision } = parsed.data;
  const updated = await db.diagnosticItem.updateMany({ where: { id: itemId, revision, diagnostic: { userId: user.id, finishedAt: null } }, data: { code, revision: { increment: 1 } } });
  return updated.count ? { revision: revision + 1 } : { error: "El diagnóstico cambió en otra pestaña o ya terminó. Copia tu código antes de recargar." };
}

export async function finishDiagnostic(input: unknown) {
  const user = await requireUser();
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { error: "Diagnóstico inválido." };
  const result = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742901)`;
    const diagnostic = await tx.diagnostic.findFirst({ where: { id: parsed.data, userId: user.id }, include: { items: { orderBy: { position: "asc" }, include: { submissions: { where: { mode: "submit" }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1 } } } } });
    if (!diagnostic) return { error: "No encontramos este diagnóstico." };
    if (diagnostic.finishedAt) return { success: true };
    const running = await tx.submission.count({ where: { diagnosticItem: { diagnosticId: diagnostic.id }, status: "RUNNING" } });
    if (running) return { error: "Espera a que termine la evaluación antes de finalizar." };
    const recommendation = diagnosticRecommendation(diagnostic.declaredLevel, diagnostic.items.map(item => item.submissions[0]?.status ?? null), diagnostic.rulesVersion);
    await tx.diagnostic.update({ where: { id: diagnostic.id }, data: { finishedAt: new Date(), suggestedLevel: recommendation.level, reason: recommendation.reason } });
    await tx.user.updateMany({ where: { id: user.id, onboardingStep: 3 }, data: { onboardingStep: 4 } });
    return { success: true };
  });
  revalidatePath("/", "layout");
  return result;
}
