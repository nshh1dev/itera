import type { Language, Level } from "./types";

export const introductorySteps = ["tu-primer-resultado", "cambia-un-numero", "devuelve-la-entrada", "suma-uno", "el-doble", "guarda-un-resultado", "lee-un-dato-con-nombre", "suma-de-dos-numeros"];
export const foundationSteps = [
  "compara-con-cero", "elige-con-una-condicion", "resto-entre-dos", "par-o-impar",
  "primer-elemento", "cuenta-los-elementos", "suma-del-arreglo", "el-mayor-de-tres",
  "construye-una-lista", "invertir-cadena", "contar-vocales", "factorial", "fizzbuzz",
];

// No deducir el nivel a partir de la posición: puede haber varias rutas del mismo nivel.
export const learningPaths: { slug: string; title: string; description: string; level: Level; order: number; slugs?: string[] }[] = [
  { slug: "desde-cero", title: "Desde cero", description: "No necesitas experiencia. Ejecuta, cambia un valor y aprende a usar entradas antes de sumar dos números.", level: "BEGINNER", order: -1, slugs: introductorySteps },
  { slug: "primeros-pasos", title: "Construye tus bases", description: "Después de Desde cero: aprende comparaciones, condiciones, listas y bucles con actividades guiadas antes de combinar las ideas.", level: "BEGINNER", order: 0, slugs: foundationSteps },
  { slug: "pensar-en-soluciones", title: "Conecta las ideas", description: "Combina lo que sabes. Encuentra patrones y elige la estructura adecuada para cada problema.", level: "INTERMEDIATE", order: 1 },
  { slug: "un-paso-mas", title: "Ve un paso más allá", description: "Ventanas, grafos y programación dinámica. Problemas que invitan a mirar desde otro ángulo.", level: "ADVANCED", order: 2 },
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
