import { isDeepStrictEqual } from "node:util";
import { exercises, starter, type SeedExercise } from "./content";
import type { Level, RuntimeMode } from "../src/lib/types";
import { languages } from "../src/lib/types";
import { statementForLanguage } from "./lesson-statements";

type VersionContent = {
  title: string; description: string; statement: string; constraints: string[]; hints: string[]; level: Level; minutes: number;
  objective: string; prerequisites: string[];
  practiceGoals: string[]; prerequisiteSlugs: string[]; activityType: string;
  runtimeMode: RuntimeMode;
  complexity: string; commonErrors: string[];
  variants: { language: string; starter: string; solution: string; explanation: string; statement?: string; typeContract?: string;
    tests: { input: unknown; expected: unknown; explanation?: string; visible: boolean; order: number }[] }[];
};

export function catalogRevision(slug: string): SeedExercise | undefined {
  return exercises.find(exercise => exercise.slug === slug);
}

export function seedVersionContent(exercise: SeedExercise): VersionContent {
  return {
    title: exercise.title, description: exercise.description, statement: exercise.statement,
    objective: exercise.objective ?? "", prerequisites: exercise.prerequisites ?? [],
    practiceGoals: exercise.practiceGoals ?? [], prerequisiteSlugs: exercise.prerequisiteSlugs ?? [], activityType: exercise.activityType ?? "PRACTICE",
    runtimeMode: exercise.runtimeMode ?? "FUNCTION",
    complexity: exercise.complexity ?? "", commonErrors: exercise.commonErrors ?? [],
    constraints: exercise.constraints, hints: exercise.hints, level: exercise.level, minutes: exercise.minutes,
    variants: languages.map(language => ({
      language, statement: statementForLanguage(exercise, language), typeContract: language === "typescript" ? exercise.typescriptContract ?? "" : "", starter: exercise.starters?.[language] ?? starter[language], solution: exercise[language]!, explanation: exercise.explanations?.[language] ?? exercise.explanation,
      tests: exercise.tests.map((test, order) => ({ ...test, explanation: test.explanation ?? "", order, visible: order < 2 })),
    })),
  };
}

function normalized(version: VersionContent): VersionContent {
  return {
    title: version.title, description: version.description, statement: version.statement,
    objective: version.objective, prerequisites: version.prerequisites,
    practiceGoals: version.practiceGoals, prerequisiteSlugs: version.prerequisiteSlugs, activityType: version.activityType,
    runtimeMode: version.runtimeMode,
    complexity: version.complexity, commonErrors: version.commonErrors,
    constraints: version.constraints, hints: version.hints, level: version.level, minutes: version.minutes,
    variants: version.variants.map(variant => ({
      language: variant.language, statement: variant.statement ?? "", typeContract: variant.typeContract ?? "", starter: variant.starter, solution: variant.solution, explanation: variant.explanation,
      tests: variant.tests.map(test => ({ input: test.input, expected: test.expected, explanation: test.explanation ?? "", visible: test.visible, order: test.order })).sort((a, b) => a.order - b.order),
    })).sort((a, b) => a.language.localeCompare(b.language)),
  };
}

export function catalogRevisionDecision(current: VersionContent & { id: string; published: boolean }, source: VersionContent, expectedVersionId: string): "unchanged" | "stale" | "draft" | "create" {
  // Repetir una importación idéntica no crea versiones ni eventos duplicados.
  if (isDeepStrictEqual(normalized(current), normalized(source))) return "unchanged";
  if (current.id !== expectedVersionId) return "stale";
  // No poner una importación por encima de un borrador editorial ajeno.
  return current.published ? "create" : "draft";
}
