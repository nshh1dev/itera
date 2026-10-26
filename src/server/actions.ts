"use server";

import { currentUser, requireUser } from "./auth";
import { db } from "./db";
import { draftSchema, languageSchema } from "@/lib/validation";
import { z } from "zod";
import { temporaryDraftFailure, type DraftSaveResult } from "@/lib/draft-sync";

export async function saveDraft(input: unknown): Promise<DraftSaveResult> {
  try {
    const user = await currentUser();
    if (!user) return { error: "Inicia sesión para sincronizar tu borrador.", kind: "auth" };
    const parsed = draftSchema.safeParse(input);
    if (!parsed.success) return { error: "El borrador no es válido.", kind: "invalid" };
    const { variantId, code, revision } = parsed.data;
    const variant = await db.exerciseVariant.findFirst({ where: { id: variantId, version: { published: true, exercise: { published: true } } }, select: { id: true } });
    if (!variant) return { error: "El ejercicio ya no está disponible. Copia tu código antes de salir.", kind: "unavailable" };
    if (revision === 0) {
      try {
        const draft = await db.draft.create({ data: { userId: user.id, variantId, code } });
        return { revision: draft.revision };
      } catch (error) {
        // Solo una colisión de la clave única confirma un borrador concurrente.
        // Una caída de la base no debe bloquear los reintentos del navegador.
        if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
          return { error: "Ya existe un borrador guardado. Copia tu código y recarga para recuperar la última versión.", kind: "conflict" };
        }
        throw error;
      }
    }
    const updated = await db.draft.updateMany({ where: { userId: user.id, variantId, revision }, data: { code, revision: { increment: 1 } } });
    if (!updated.count) return { error: "Este borrador cambió en otra pestaña. Copia tu código y recarga para recuperar la última versión.", kind: "conflict" };
    return { revision: revision + 1 };
  } catch { return temporaryDraftFailure; }
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

export async function rememberPractice(input: unknown) {
  const user = await currentUser();
  if (!user) return;
  const parsed = z.object({ variantId: z.string().min(1).max(100), language: languageSchema, pathSlug: z.string().regex(/^[a-z0-9-]+$/).max(100).optional() }).safeParse(input);
  if (!parsed.success) return;
  const { variantId, language, pathSlug } = parsed.data;
  const variant = await db.exerciseVariant.findFirst({ where: { id: variantId, language, version: { published: true, exercise: { published: true } } }, select: { version: { select: { exerciseId: true } } } });
  if (!variant) return;
  const exerciseId = variant.version.exerciseId;
  const path = pathSlug ? await db.learningPath.findFirst({ where: { slug: pathSlug, items: { some: { exerciseId } } }, select: { slug: true } }) : null;
  const key = { userId: user.id, exerciseId, language };
  await db.practiceContext.upsert({ where: { userId_exerciseId_language: key }, create: { ...key, pathSlug: path?.slug }, update: { pathSlug: path?.slug ?? null, visitedAt: new Date() } });
}

export async function getExerciseAttempts(input: unknown) {
  const user = await requireUser();
  const parsed = z.object({ exerciseId: z.string().min(1).max(100), language: languageSchema, page: z.number().int().min(0).max(100000) }).safeParse(input);
  if (!parsed.success) return { error: "No pudimos identificar el historial.", entries: [], more: false };
  const { exerciseId, language, page } = parsed.data;
  const entries = await db.submission.findMany({
    where: { userId: user.id, diagnosticItemId: null, variant: { language, version: { exerciseId, exercise: { published: true } } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: page * 10, take: 11,
    select: { id: true, code: true, status: true, mode: true, passedCount: true, totalCount: true, createdAt: true, variant: { select: { version: { select: { number: true } } } } },
  });
  // El historial solo necesita el resultado global; nunca envía casos ocultos.
  return { entries: entries.slice(0, 10).map(entry => ({ ...entry, createdAt: entry.createdAt.toISOString() })), more: entries.length > 10 };
}
