import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent, type VersionContent } from "../prisma/editorial-revision";
import { pythonSearchExplanations } from "../prisma/python-search-explanations";
import { beforePythonStructures } from "./python-structure-baseline";

// Solo reconstrucción histórica de diez textos, sin cambiar fuentes ni catálogo.
export function beforePythonSearch(slug: string, content: VersionContent): VersionContent {
  content = beforePythonStructures(slug, content);
  if (!(slug in pythonSearchExplanations)) return content;
  const exercise = logicExercises.find(exercise => exercise.slug === slug);
  if (!exercise) throw new Error(`Falta el ejercicio original de ${slug}`);
  const previous = seedVersionContent(exercise).variants.find(variant => variant.language === "python");
  if (!previous) throw new Error(`Falta la variante Python original de ${slug}`);
  return { ...content, variants: content.variants.map(variant => ({ ...variant, explanation: previous.explanation })) };
}
