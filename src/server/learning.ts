import "server-only";
import { db } from "./db";
import { effectiveLevel } from "@/lib/learning-profile";
import { learningPaths } from "@/lib/learning-paths";
import type { Language } from "@/lib/types";
import { pythonCurriculumMarker } from "@/lib/python-curriculum";
import { pythonPathCopy } from "@/lib/python-route-copy";

export async function getLearningSummary(userId: string, language: Language) {
  const [profile, diagnostic, pythonCurriculum] = await Promise.all([
    db.learningProfile.findUnique({ where: { userId_language: { userId, language } } }),
    db.diagnostic.findFirst({ where: { userId, language, finishedAt: { not: null } }, orderBy: [{ finishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }] }),
    language === "python" ? db.exercise.findFirst({ where: { slug: pythonCurriculumMarker, published: true, versions: { some: { published: true, variants: { some: { language: "python" } } } } }, select: { id: true } }) : null,
  ]);
  const level = effectiveLevel(profile?.declaredLevel, diagnostic);
  const applicable = diagnostic?.declaredLevel === profile?.declaredLevel ? diagnostic : null;
  const path = learningPaths.find(path => path.level === level)!;
  return {
    language, declaredLevel: profile?.declaredLevel ?? null, suggestedLevel: applicable?.suggestedLevel ?? null,
    reason: applicable?.reason ?? (profile ? "Partimos del nivel que elegiste. Puedes ajustar tus preferencias o probar el diagnóstico cuando quieras." : "Te proponemos empezar por las bases. Puedes elegir tu nivel o hacer un diagnóstico en Aprendizaje."),
    path: pythonCurriculum ? { ...path, ...pythonPathCopy[path.slug] } : path,
    diagnosticDate: applicable?.finishedAt?.toISOString() ?? null,
  };
}
