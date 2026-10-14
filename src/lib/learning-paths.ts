import type { Level } from "./types";

// No deducir el nivel a partir de la posición: puede haber varias rutas del mismo nivel.
export const learningPaths: { slug: string; title: string; description: string; level: Level; order: number }[] = [
  { slug: "desde-cero", title: "Desde cero", description: "No necesitas experiencia. Ejecuta, cambia un valor y aprende a usar entradas antes de sumar dos números.", level: "BEGINNER", order: -1 },
  { slug: "primeros-pasos", title: "Construye tus bases", description: "Después de Desde cero: practica operaciones, condiciones, bucles y datos. Consulta las pistas cuando lo necesites.", level: "BEGINNER", order: 0 },
  { slug: "pensar-en-soluciones", title: "Conecta las ideas", description: "Combina lo que sabes. Encuentra patrones y elige la estructura adecuada para cada problema.", level: "INTERMEDIATE", order: 1 },
  { slug: "un-paso-mas", title: "Ve un paso más allá", description: "Ventanas, grafos y programación dinámica. Problemas que invitan a mirar desde otro ángulo.", level: "ADVANCED", order: 2 },
];

export function learningPathLevel(slug: string): Level | undefined {
  return learningPaths.find(path => path.slug === slug)?.level;
}
