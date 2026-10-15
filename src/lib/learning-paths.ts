import type { Language, Level } from "./types";
import { stepsForPath } from "./learning-modules";

export const introductorySteps = stepsForPath("desde-cero");
export const foundationSteps = stepsForPath("primeros-pasos");
export const intermediateSteps = stepsForPath("pensar-en-soluciones");
export const advancedSteps = stepsForPath("un-paso-mas");

// No deducir el nivel a partir de la posición: puede haber varias rutas del mismo nivel.
export const learningPaths: { slug: string; title: string; description: string; level: Level; order: number; slugs?: string[] }[] = [
  { slug: "desde-cero", title: "Desde cero", description: "Sin experiencia previa: instrucciones, valores, variables, entradas, operaciones y primeras funciones. Termina escribiendo y explicando una solución pequeña por tu cuenta.", level: "BEGINNER", order: -1, slugs: introductorySteps },
  { slug: "primeros-pasos", title: "Construye tus bases", description: "Después de Desde cero: aprende comparaciones, condiciones, listas, textos y bucles con actividades guiadas antes de combinar las ideas.", level: "BEGINNER", order: 0, slugs: foundationSteps },
  { slug: "pensar-en-soluciones", title: "Conecta las ideas", description: "Después de Construye tus bases: conecta conjuntos y mapas, agrega y ordena arreglos, recorre matrices y practica búsqueda, recursión, pilas, colas y ventanas.", level: "INTERMEDIATE", order: 1, slugs: intermediateSteps },
  { slug: "un-paso-mas", title: "Ve un paso más allá", description: "Recursión avanzada, programación dinámica, árboles, grafos y estrategias voraces. Problemas que invitan a mirar desde otro ángulo.", level: "ADVANCED", order: 2, slugs: advancedSteps },
];

export function learningPathLevel(slug: string): Level | undefined {
  return learningPaths.find(path => path.slug === slug)?.level;
}

export function exerciseHref(slug: string, language: Language, pathSlug?: string): string {
  const query = new URLSearchParams({ lenguaje: language });
  if (pathSlug) query.set("ruta", pathSlug);
  return `/ejercicios/${encodeURIComponent(slug)}?${query}`;
}

export function nextExerciseSlug(slug: string, slugs: string[]): string | undefined {
  const index = slugs.indexOf(slug);
  return index < 0 ? undefined : slugs[index + 1];
}

export function previousExerciseSlug(slug: string, slugs: string[]): string | undefined {
  const index = slugs.indexOf(slug);
  return index <= 0 ? undefined : slugs[index - 1];
}

// Posición 1-based dentro de la secuencia (ruta o catálogo). 0 si no pertenece.
export function exercisePosition(slug: string, slugs: string[]): { position: number; total: number } {
  const index = slugs.indexOf(slug);
  return { position: index < 0 ? 0 : index + 1, total: slugs.length };
}
