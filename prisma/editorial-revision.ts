import { isDeepStrictEqual } from "node:util";
import { createHash } from "node:crypto";
import { exercises, starter, type SeedExercise } from "./content";
import type { Level, RuntimeMode } from "../src/lib/types";
import { languages } from "../src/lib/types";
import { statementForLanguage } from "./lesson-statements";
import { logicExercises } from "./logic-content";
import { Prisma } from "../src/generated/prisma/client";

export type VersionContent = {
  title: string; description: string; statement: string; constraints: string[]; hints: string[]; level: Level; minutes: number;
  objective: string; prerequisites: string[];
  practiceGoals: string[]; prerequisiteSlugs: string[]; activityType: string;
  runtimeMode: RuntimeMode;
  conceptRule?: string;
  complexity: string; commonErrors: string[];
  variants: { language: string; starter: string; solution: string; explanation: string; statement?: string; typeContract?: string; project?: Prisma.InputJsonValue; solutionFiles?: Prisma.InputJsonValue;
     tests: { input: unknown; expected: unknown; expectedFiles?: Prisma.InputJsonValue; expectedPersistence?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput; explanation?: string; visible: boolean; order: number }[] }[];
};

export function catalogRevision(slug: string): SeedExercise | undefined {
  return logicExercises.find(exercise => exercise.slug === slug) ?? exercises.find(exercise => exercise.slug === slug);
}

export function seedVersionContent(exercise: SeedExercise): VersionContent {
  return {
    title: exercise.title, description: exercise.description, statement: exercise.statement,
    objective: exercise.objective ?? "", prerequisites: exercise.prerequisites ?? [],
    practiceGoals: exercise.practiceGoals ?? [], prerequisiteSlugs: exercise.prerequisiteSlugs ?? [], activityType: exercise.activityType ?? "PRACTICE",
    runtimeMode: exercise.runtimeMode ?? "FUNCTION",
    conceptRule: exercise.conceptRule ?? "",
    complexity: exercise.complexity ?? "", commonErrors: exercise.commonErrors ?? [],
    constraints: exercise.constraints, hints: exercise.hints, level: exercise.level, minutes: exercise.minutes,
    variants: languages.map(language => ({
      language, statement: statementForLanguage(exercise, language), typeContract: language === "typescript" ? exercise.typescriptContract ?? "" : "", starter: exercise.starters?.[language] ?? starter[language], solution: exercise[language]!, explanation: exercise.explanations?.[language] ?? exercise.explanation,
      ...(exercise.projects?.[language] ? { project: exercise.projects[language] as Prisma.InputJsonValue } : {}),
      ...(exercise.projectSolutions?.[language] ? { solutionFiles: exercise.projectSolutions[language] as Prisma.InputJsonValue } : {}),
      tests: exercise.tests.map(({ expectedPersistence, ...test }, order) => ({ ...test, ...(test.expectedFiles ? { expectedFiles: test.expectedFiles as Prisma.InputJsonValue } : {}), ...(expectedPersistence !== undefined ? { expectedPersistence: expectedPersistence === null ? Prisma.JsonNull : expectedPersistence as Prisma.InputJsonValue } : {}), explanation: test.explanation ?? "", order, visible: test.visible ?? order < 2 })),
    })),
  };
}

type ComparableTest = Omit<VersionContent["variants"][number]["tests"][number], "expectedFiles" | "expectedPersistence"> & { expectedFiles?: unknown; expectedPersistence?: unknown };
type ComparableVariant = Omit<VersionContent["variants"][number], "project" | "solutionFiles" | "tests"> & { project?: unknown; solutionFiles?: unknown; tests: ComparableTest[] };
type ComparableVersion = Omit<VersionContent, "variants"> & { variants: ComparableVariant[] };

function normalized(version: ComparableVersion) {
  return {
    title: version.title, description: version.description, statement: version.statement,
    objective: version.objective, prerequisites: version.prerequisites,
    practiceGoals: version.practiceGoals, prerequisiteSlugs: version.prerequisiteSlugs, activityType: version.activityType,
    runtimeMode: version.runtimeMode,
    conceptRule: version.conceptRule ?? "",
    complexity: version.complexity, commonErrors: version.commonErrors,
    constraints: version.constraints, hints: version.hints, level: version.level, minutes: version.minutes,
    variants: version.variants.map(variant => ({
      language: variant.language, statement: variant.statement ?? "", typeContract: variant.typeContract ?? "", starter: variant.starter, solution: variant.solution, explanation: variant.explanation,
      project: variant.project ?? null, solutionFiles: variant.solutionFiles ?? null,
      tests: variant.tests.map(test => ({ input: test.input, expected: test.expected, expectedFiles: test.expectedFiles ?? null, ...((variant.project as { verifyPersistence?: unknown } | undefined)?.verifyPersistence === true ? { expectedPersistence: test.expectedPersistence === Prisma.JsonNull ? null : test.expectedPersistence ?? null } : {}), explanation: test.explanation ?? "", visible: test.visible, order: test.order })).sort((a, b) => a.order - b.order),
    })).sort((a, b) => a.language.localeCompare(b.language)),
  };
}

type RevisionSnapshot = ComparableVersion & { id: string; published: boolean };

export function catalogRevisionFingerprint(version: ComparableVersion) {
  const canonical = JSON.stringify(normalized(version), (_key, value) => value && typeof value === "object" && !Array.isArray(value)
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value);
  return createHash("sha256").update(canonical).digest("hex");
}

export function catalogRevisionDecision(current: RevisionSnapshot, source: VersionContent, expectedVersionId: string): "unchanged" | "stale" | "draft" | "create" {
  // Repetir una importación idéntica no crea versiones ni eventos duplicados.
  if (isDeepStrictEqual(normalized(current), normalized(source))) return "unchanged";
  if (current.id !== expectedVersionId) return "stale";
  // No poner una importación por encima de un borrador editorial ajeno.
  return current.published ? "create" : "draft";
}
