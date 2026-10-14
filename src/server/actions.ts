"use server";

import { revalidatePath } from "next/cache";
import { currentUser, requireUser } from "./auth";
import { db } from "./db";
import { draftSchema, preferenceSchema } from "@/lib/validation";
import { z } from "zod";

export async function savePreferences(input: unknown) {
  const user = await requireUser();
  const parsed = preferenceSchema.safeParse(input);
  if (!parsed.success) return { error: "Revisa tu nombre y tus preferencias." };
  const { name, language, level } = parsed.data;
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { name } }),
    db.userPreference.upsert({ where: { userId: user.id }, create: { userId: user.id, language, level }, update: { language, level } }),
  ]);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveDraft(input: unknown) {
  const user = await currentUser();
  if (!user) return { error: "Inicia sesión para sincronizar tu borrador.", kind: "auth" as const };
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return { error: "El borrador no es válido.", kind: "invalid" as const };
  const { variantId, code, revision } = parsed.data;
  const variant = await db.exerciseVariant.findFirst({ where: { id: variantId, version: { published: true, exercise: { published: true } } }, select: { id: true } });
  if (!variant) return { error: "El ejercicio ya no está disponible.", kind: "invalid" as const };
  try {
    if (revision === 0) {
      const draft = await db.draft.create({ data: { userId: user.id, variantId, code } });
      return { revision: draft.revision };
    }
    const updated = await db.draft.updateMany({ where: { userId: user.id, variantId, revision }, data: { code, revision: { increment: 1 } } });
    if (!updated.count) return { error: "Este borrador cambió en otra pestaña. Copia tu código y recarga para recuperar la última versión.", kind: "conflict" as const };
    return { revision: revision + 1 };
  } catch {
    return { error: "No se pudo sincronizar. Tu copia local sigue disponible; si abriste otra pestaña, copia tu código antes de recargar.", kind: "conflict" as const };
  }
}

export async function recordHint(variantId: string, index: number) {
  const user = await currentUser();
  if (!user) return;
  if (!z.string().max(100).safeParse(variantId).success || !Number.isInteger(index) || index < 0 || index > 9) return;
  const variant = await db.exerciseVariant.findFirst({ where: { id: variantId, version: { published: true, exercise: { published: true } } }, select: { language: true, version: { select: { exerciseId: true, hints: true } } } });
  if (!variant || index >= variant.version.hints.length) return;
  const key = { userId: user.id, exerciseId: variant.version.exerciseId, language: variant.language, kind: `hint:${index}` };
  await db.helpUsage.upsert({ where: { userId_exerciseId_language_kind: key }, create: key, update: {} });
}

export async function revealSolution(variantId: string) {
  const user = await currentUser();
  if (!user) return { error: "Inicia sesión para consultar la solución y registrar tu aprendizaje." };
  if (!z.string().min(1).max(100).safeParse(variantId).success) return { error: "Ejercicio inválido." };
  const variant = await db.exerciseVariant.findFirst({ where: { id: variantId, version: { published: true, exercise: { published: true } } }, select: { solution: true, explanation: true, language: true, version: { select: { exerciseId: true } } } });
  if (!variant) return { error: "No encontramos esta solución." };
  const key = { userId: user.id, exerciseId: variant.version.exerciseId, language: variant.language, kind: "solution" };
  await db.helpUsage.upsert({ where: { userId_exerciseId_language_kind: key }, create: key, update: {} });
  return { code: variant.solution, explanation: variant.explanation };
}
