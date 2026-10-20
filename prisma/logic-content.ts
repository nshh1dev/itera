import { exercises as historicalExercises, type SeedExercise } from "./content";
import { statementForLanguage } from "./lesson-statements";
import { logicLessons } from "./logic-lessons";
import { curriculumSlug, curriculumUnits } from "../src/lib/curriculum-v2";
import { languages } from "../src/lib/types";

// Se reutilizan referencias algorítmicas verificadas cuando el contrato coincide.
// Nunca se reutiliza la identidad ni se atribuye progreso del catálogo anterior.
const historical = new Map(historicalExercises.map(exercise => [exercise.slug, exercise]));
let previous: string | undefined;
export const logicExercises: SeedExercise[] = curriculumUnits.flatMap(unit => unit.steps.map(step => {
  const source = logicLessons.get(step.key) ?? (step.source ? historical.get(step.source) : undefined);
  if (!source) throw new Error(`Falta la lección de lógica: ${step.key}`);
  const slug = curriculumSlug(step.key);
  const prerequisites = previous ? [previous] : [];
  previous = slug;
  const statements = Object.fromEntries(languages.map(language => [language, statementForLanguage(source, language)])) as Record<typeof languages[number], string>;
  return {
    ...source, slug, title: step.title, level: unit.level,
    category: ["arboles", "prioridades", "estado-recursion"].includes(unit.slug) ? "Estructuras" : unit.slug === "grafos" ? "Grafos" : unit.slug === "textos" ? "Cadenas" : unit.slug === "matrices" || unit.slug === "listas" ? "Arreglos" : unit.level === "ADVANCED" || unit.level === "INTERMEDIATE" ? "Algoritmos" : source.category,
    minutes: logicLessons.has(step.key) ? unit.level === "ADVANCED" ? 25 : unit.level === "INTERMEDIATE" ? 15 : unit.level === "INITIATION" ? 5 : 10 : source.minutes,
    statements, statement: statements.python,
    prerequisiteSlugs: prerequisites,
    prerequisites: unit.slug.startsWith("integracion") ? ["Los bloques anteriores de esta etapa."] : [],
    objective: source.objective || `${step.title} utilizando los datos y reglas del problema.`,
    practiceGoals: source.practiceGoals?.length ? source.practiceGoals : [step.title],
    activityType: unit.slug.startsWith("integracion") ? "INTEGRATION" : unit.level === "INITIATION" ? "GUIDED" : "PRACTICE",
  } satisfies SeedExercise;
}));
