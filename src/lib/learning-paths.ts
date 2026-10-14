import type { Language, Level } from "./types";

export const introductorySteps = ["tu-primer-resultado", "cambia-un-numero", "devuelve-la-entrada", "suma-uno", "el-doble", "guarda-un-resultado", "lee-un-dato-con-nombre", "suma-de-dos-numeros"];
export const foundationSteps = [
  "compara-con-cero", "elige-con-una-condicion", "compara-igualdad", "tres-caminos", "resto-entre-dos", "par-o-impar",
  "primer-elemento", "cuenta-los-elementos", "suma-del-arreglo", "el-mayor-de-tres",
  "construye-una-lista", "repite-cada-letra", "invertir-cadena",
  "texto-en-minusculas", "reconoce-una-vocal", "contar-vocales",
  "numeros-del-uno-al-n", "producto-de-una-lista", "factorial", "dos-condiciones-a-la-vez", "fizzbuzz",
];

export const intermediateSteps = [
  "pertenece-al-conjunto", "cuenta-valores-distintos", "sin-duplicados",
  "guarda-con-una-clave", "incrementa-contadores", "frecuencia-caracteres",
  "quita-los-espacios", "filtra-letras-y-digitos", "compara-dos-textos", "palindromo",
  "compara-contadores", "anagramas", "segundo-mayor", "busqueda-binaria", "rotar-arreglo", "parentesis-equilibrados",
];

// No deducir el nivel a partir de la posición: puede haber varias rutas del mismo nivel.
export const learningPaths: { slug: string; title: string; description: string; level: Level; order: number; slugs?: string[] }[] = [
  { slug: "desde-cero", title: "Desde cero", description: "No necesitas experiencia. Ejecuta, cambia un valor y aprende a usar entradas antes de sumar dos números.", level: "BEGINNER", order: -1, slugs: introductorySteps },
  { slug: "primeros-pasos", title: "Construye tus bases", description: "Después de Desde cero: aprende comparaciones, condiciones, listas y bucles con actividades guiadas antes de combinar las ideas.", level: "BEGINNER", order: 0, slugs: foundationSteps },
  { slug: "pensar-en-soluciones", title: "Conecta las ideas", description: "Después de Construye tus bases: practica conjuntos, mapas, filtros y comparación de textos antes de sus retos. Los retos de máximos, búsqueda, rotación y pilas aún requieren más conceptos.", level: "INTERMEDIATE", order: 1, slugs: intermediateSteps },
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
