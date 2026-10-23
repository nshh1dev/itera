import "server-only";
import { db } from "./db";
import type { Language } from "@/lib/types";

export async function getHistoryGroups(userId: string, language: Language) {
  const groups = await db.submission.groupBy({
    by: ["variantId"], where: { userId, diagnosticItemId: null, variant: { language, version: { exercise: { published: true } } } },
    _max: { createdAt: true }, _count: { _all: true },
  });
  const variants = groups.length ? await db.exerciseVariant.findMany({ where: { id: { in: groups.map(group => group.variantId) } }, select: { id: true, version: { select: { exerciseId: true } }, submissions: { where: { userId, diagnosticItemId: null }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1, select: { status: true, mode: true } } } }) : [];
  const variantMap = new Map(variants.map(variant => [variant.id, variant]));
  const exercises = new Map<string, { exerciseId: string; count: number; date: string; lastResult: string }>();
  for (const group of groups) {
    const variant = variantMap.get(group.variantId);
    const exerciseId = variant?.version.exerciseId;
    if (!exerciseId || !group._max.createdAt) continue;
    const date = group._max.createdAt.toISOString();
    const previous = exercises.get(exerciseId);
    const latest = variant?.submissions[0];
    const result = latest ? `${latest.mode === "submit" ? "Comprobación" : "Ejemplos"}: ${latest.status === "PASSED" ? "pruebas superadas" : latest.status === "FAILED" ? "pruebas no superadas" : latest.status === "RUNNING" ? "en evaluación" : "evaluación interrumpida"}` : "Sin evaluación";
    const newer = date > (previous?.date ?? "");
    exercises.set(exerciseId, { exerciseId, count: (previous?.count ?? 0) + group._count._all, date: newer ? date : previous!.date, lastResult: newer ? result : previous!.lastResult });
  }
  return [...exercises.values()].sort((a, b) => b.date.localeCompare(a.date) || a.exerciseId.localeCompare(b.exerciseId));
}
