import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent, type VersionContent } from "../prisma/editorial-revision";
import { pythonPathExplanations } from "../prisma/python-path-explanations";
import { beforePythonLocalTheory } from "./python-local-theory-baseline";

// Reconstrucción de seis textos; no cambia las fuentes ni el catálogo activo.
export function beforePythonPaths(slug: string, content: VersionContent): VersionContent {
  content = beforePythonLocalTheory(slug, content);
  if (!(slug in pythonPathExplanations)) return content;
  const exercise = logicExercises.find(exercise => exercise.slug === slug);
  if (!exercise) throw new Error(`Falta el ejercicio original de ${slug}`);
  const previous = seedVersionContent(exercise).variants.find(variant => variant.language === "python");
  if (!previous) throw new Error(`Falta la variante Python original de ${slug}`);
  return { ...content, variants: content.variants.map(variant => ({ ...variant, explanation: previous.explanation })) };
}
