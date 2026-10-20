import { curriculumSlug, curriculumUnits } from "./curriculum-v2";
import type { Language } from "./types";

export type LearningModule = {
  slug: string; path: string; title: string; objective: string; theory: string;
  examples: Record<Language, string>; readiness: string[]; slugs: string[];
};

export const learningModules: LearningModule[] = curriculumUnits.map(unit => ({
  slug: unit.slug, path: unit.path, title: unit.title,
  objective: unit.readiness.map(goal => goal.replace(/^Puedo /, "")).join(" · "),
  theory: unit.theory, examples: unit.examples, readiness: unit.readiness,
  slugs: unit.steps.map(step => curriculumSlug(step.key)),
}));
export function modulesForPath(path: string) { return learningModules.filter(unit => unit.path === path); }
export function moduleForExercise(slug: string) { return learningModules.find(unit => unit.slugs.includes(slug)); }
export function stepsForPath(path: string) { return modulesForPath(path).flatMap(unit => unit.slugs); }
