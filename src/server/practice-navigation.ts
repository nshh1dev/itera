import "server-only";
import { db } from "./db";
import { getCatalog } from "./catalog";
import { languages, type Language } from "@/lib/types";
import { personalizedPractice } from "@/lib/practice-navigation";
import { getLearningSummary } from "./learning";
import { dashboardOverview } from "@/lib/dashboard";

export async function getPracticeNavigation(userId: string | undefined, preferred: Language) {
  const [catalogs, contexts, paths, learning] = await Promise.all([
    Promise.all(languages.map(language => getCatalog(userId, language))),
    userId ? db.practiceContext.findMany({ where: { userId, exercise: { published: true } }, orderBy: { visitedAt: "desc" } }) : [],
    db.learningPath.findMany({ orderBy: { order: "asc" }, select: { slug: true, title: true, items: { orderBy: { position: "asc" }, select: { exerciseId: true } } } }),
    userId ? getLearningSummary(userId, preferred) : null,
  ]);
  const entries = catalogs.flatMap((catalog, index) => catalog.map(exercise => {
    const language = languages[index];
    const context = contexts.find(item => item.exerciseId === exercise.id && item.language === language);
    const routes = paths.filter(path => path.items.some(item => item.exerciseId === exercise.id)).map(path => path.slug);
    return { exercise, language, pathSlug: context?.pathSlug && routes.includes(context.pathSlug) ? context.pathSlug : undefined, routes, date: [exercise.lastActivityAt, context?.visitedAt.toISOString()].filter(Boolean).sort().at(-1) };
  }));
  const recommendation = personalizedPractice(entries, preferred, learning?.path.slug);
  if (recommendation && !entries.some(entry => entry.date)) recommendation.pathSlug = paths.find(path => path.items.some(item => item.exerciseId === recommendation.exercise.id))?.slug;
  const language = recommendation?.language ?? preferred;
  const catalog = catalogs[languages.indexOf(language)];
  const lastPath = contexts.find(context => context.language === preferred && context.pathSlug && paths.some(path => path.slug === context.pathSlug));
  // Una ruta completada sigue siendo la ruta actual: no ocultar su finalización
  // sustituyéndola automáticamente por otra con ejercicios pendientes.
  const overview = dashboardOverview({ catalog, paths, recommendation, currentPathSlug: lastPath?.pathSlug ?? learning?.path.slug });
  return { recommendation, language, catalog, ...overview };
}
