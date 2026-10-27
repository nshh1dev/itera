import { learningPaths } from "./learning-paths";

// El orden editorial es compartido con el catálogo. Los ejercicios administrativos
// ajenos a las rutas mantienen su orden persistido, después de esas rutas.
export function prerequisiteIssue(slug: string, prerequisites: string[], entries: { slug: string; order: number }[], sequence?: readonly string[]): string | undefined {
  const curriculum = [...new Set(sequence ?? learningPaths.flatMap(path => path.slugs ?? []))];
  const rank = (entry: { slug: string; order: number }) => {
    const index = curriculum.indexOf(entry.slug);
    return index < 0 ? curriculum.length + entry.order : index;
  };
  const current = entries.find(entry => entry.slug === slug);
  const position = current ? rank(current) : Math.max(curriculum.length, ...entries.map(rank)) + 1;
  for (const prerequisite of prerequisites) {
    if (prerequisite === slug) return "Un ejercicio no puede recomendarse a sí mismo como conocimiento previo.";
    const entry = entries.find(item => item.slug === prerequisite);
    if (!entry) return `El ejercicio previo ${prerequisite} no está publicado o no existe.`;
    if (rank(entry) >= position) return `El ejercicio previo ${prerequisite} debe aparecer antes en la progresión.`;
  }
}
