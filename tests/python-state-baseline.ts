import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent, type VersionContent } from "../prisma/editorial-revision";
import { pythonStateExplanations } from "../prisma/python-state-explanations";
import { beforePythonSearch } from "./python-search-baseline";

// Solo reconstrucción de prosa para huellas anteriores al lote, sin publicación.
export function beforePythonState(slug: string, content: VersionContent): VersionContent {
  content = beforePythonSearch(slug, content);
  if (!(slug in pythonStateExplanations)) return content;
  const exercise = logicExercises.find(exercise => exercise.slug === slug);
  if (!exercise) throw new Error(`Falta el ejercicio original de ${slug}`);
  const previous = seedVersionContent(exercise).variants.find(variant => variant.language === "python");
  if (!previous) throw new Error(`Falta la variante Python original de ${slug}`);
  return { ...content, variants: content.variants.map(variant => ({ ...variant, explanation: previous.explanation })) };
}
