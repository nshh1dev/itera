import "server-only";
import { db } from "./db";
import { effectiveLevel } from "@/lib/learning-profile";
import { learningPaths } from "@/lib/learning-paths";
import type { Language } from "@/lib/types";

export async function getLearningSummary(userId: string, language: Language) {
  const [profile, diagnostic] = await Promise.all([
    db.learningProfile.findUnique({ where: { userId_language: { userId, language } } }),
    db.diagnostic.findFirst({ where: { userId, language, finishedAt: { not: null } }, orderBy: [{ finishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }] }),
  ]);
  const level = effectiveLevel(profile?.declaredLevel, diagnostic);
  const applicable = diagnostic?.declaredLevel === profile?.declaredLevel ? diagnostic : null;
  return {
    language, declaredLevel: profile?.declaredLevel ?? null, suggestedLevel: applicable?.suggestedLevel ?? null,
    reason: applicable?.reason ?? (profile ? "Partimos del nivel que elegiste. Puedes ajustar tus preferencias o probar el diagnóstico cuando quieras." : "Te proponemos empezar por las bases. Puedes elegir tu nivel o hacer un diagnóstico en Aprendizaje."),
    path: learningPaths.find(path => path.level === level)!,
    diagnosticDate: applicable?.finishedAt?.toISOString() ?? null,
  };
}
