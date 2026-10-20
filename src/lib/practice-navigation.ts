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
    : last ? (() => { const related = relatedExercise(catalog.map(entry => entry.exercise), last.exercise); return catalog.find(entry => entry.exercise.id === related?.id); })() : undefined;
  const choice = next ?? catalog.find(entry => !entry.exercise.solved) ?? catalog[0];
  return choice ? { ...choice, pathSlug: last?.pathSlug && choice.routes?.includes(last.pathSlug) ? last.pathSlug : undefined, resume: false } : undefined;
}
