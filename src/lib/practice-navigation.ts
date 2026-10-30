import { levels, type ExerciseCard, type Language } from "./types";

export function exerciseState(exercise: Pick<ExerciseCard, "solved" | "started">) {
  return exercise.solved ? "Resuelto" : exercise.started ? "En progreso" : "Sin empezar";
}

export function relatedExercise(catalog: ExerciseCard[], current: ExerciseCard) {
  const candidates = catalog.filter(item => item.id !== current.id && !item.solved);
  return candidates.find(item => item.category === current.category && item.level === current.level && item.order > current.order)
    ?? candidates.find(item => item.category === current.category && item.level === current.level)
    ?? candidates.find(item => item.order > current.order) ?? candidates[0];
}

export function sortExercises(items: ExerciseCard[], order: string) {
  return [...items].sort((a, b) => (order === "duracion" ? a.minutes - b.minutes : order === "dificultad" ? levels.indexOf(a.level) - levels.indexOf(b.level) : 0) || a.order - b.order);
}

export function activePathExercise(exercises: ExerciseCard[]) {
  return exercises.filter(exercise => exercise.started && !exercise.solved)
    .sort((a, b) => (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""))[0]
    ?? exercises.find(exercise => !exercise.solved);
}

export type PracticeEntry = { exercise: ExerciseCard; language: Language; pathSlug?: string; routes?: string[]; date?: string };
export function personalizedPractice(entries: PracticeEntry[], preferred: Language, recommendedPath?: string) {
  const catalog = entries.filter(entry => entry.language === preferred);
  if (!catalog.some(entry => !entry.exercise.solved)) return undefined;
  const hasActivity = catalog.some(entry => entry.date);
  if (hasActivity) return nextPractice(catalog, preferred);
  const choice = catalog.find(entry => recommendedPath && entry.routes?.includes(recommendedPath) && !entry.exercise.solved)
    ?? catalog.find(entry => !entry.exercise.solved) ?? catalog[0];
  return choice ? { ...choice, pathSlug: recommendedPath && choice.routes?.includes(recommendedPath) ? recommendedPath : undefined, resume: false } : undefined;
}
export function nextPractice(entries: PracticeEntry[], fallbackLanguage: Language) {
  const recent = entries.filter(entry => entry.date).sort((a, b) => b.date!.localeCompare(a.date!));
  const unfinished = recent.find(entry => entry.exercise.started && !entry.exercise.solved);
  if (unfinished) return { ...unfinished, resume: true };
  const last = recent[0];
  if (last && !last.exercise.solved) return { ...last, resume: false };
  const language = last?.language ?? fallbackLanguage;
  const catalog = entries.filter(entry => entry.language === language);
  const next = last?.pathSlug
    ? catalog.find(entry => entry.routes?.includes(last.pathSlug!) && !entry.exercise.solved)
    : last ? catalog.slice(catalog.findIndex(entry => entry.exercise.id === last.exercise.id) + 1).find(entry => !entry.exercise.solved) : undefined;
  const choice = next ?? catalog.find(entry => !entry.exercise.solved) ?? catalog[0];
  return choice ? { ...choice, pathSlug: last?.pathSlug && choice.routes?.includes(last.pathSlug) ? last.pathSlug : undefined, resume: false } : undefined;
}
