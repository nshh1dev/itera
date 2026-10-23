import type { ExerciseCard } from "./types";
import type { PracticeEntry } from "./practice-navigation";

export type DashboardPath = { slug: string; title: string; items: { exerciseId: string }[] };
export type DashboardRecommendation = PracticeEntry & { resume: boolean };

export function dashboardOverview({ catalog, paths, recommendation, currentPathSlug }: {
  catalog: ExerciseCard[];
  paths: DashboardPath[];
  recommendation?: DashboardRecommendation;
  currentPathSlug?: string;
}) {
  const path = paths.find(item => item.slug === recommendation?.pathSlug)
    ?? paths.find(item => item.slug === currentPathSlug) ?? paths[0];
  const byId = new Map(catalog.map(exercise => [exercise.id, exercise]));
  const pathExercises = path?.items.flatMap(item => {
    const exercise = byId.get(item.exerciseId);
    return exercise ? [exercise] : [];
  }) ?? [];
  const activity = catalog.filter(exercise => exercise.lastActivityAt && (exercise.started || exercise.solved))
    .sort((a, b) => b.lastActivityAt!.localeCompare(a.lastActivityAt!) || a.order - b.order);
  const last = activity[0];
  const reason = !recommendation ? ""
    : recommendation.resume ? "Retoma el ejercicio que dejaste pendiente."
    : recommendation.pathSlug ? "Es el siguiente ejercicio pendiente en el orden de tu ruta."
    : last?.solved ? last.category === recommendation.exercise.category && last.level === recommendation.exercise.level
      ? "Tu último ejercicio está resuelto; este reto refuerza el mismo tema y nivel."
      : "Tu último ejercicio está resuelto; sigue con un nuevo reto pendiente."
    : "Un punto de partida para practicar a tu ritmo.";
  return {
    path: path ? { slug: path.slug, title: path.title, completed: pathExercises.filter(exercise => exercise.solved).length, total: pathExercises.length } : undefined,
    recent: activity.filter(exercise => exercise.id !== recommendation?.exercise.id).slice(0, 3),
    reason,
  };
}
