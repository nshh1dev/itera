import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent, type VersionContent } from "../prisma/editorial-revision";
import { pythonFlowExplanations } from "../prisma/python-flow-explanations";

// Reconstrucción de prosa para huellas históricas, sin cambiar fuentes comunes.
export function beforePythonFlow(slug: string, content: VersionContent): VersionContent {
  if (!(slug in pythonFlowExplanations)) return content;
  const exercise = logicExercises.find(exercise => exercise.slug === slug);
  if (!exercise) throw new Error(`Falta el ejercicio original de ${slug}`);
  const previous = seedVersionContent(exercise).variants.find(variant => variant.language === "python");
  if (!previous) throw new Error(`Falta la variante Python original de ${slug}`);
  return { ...content, variants: content.variants.map(variant => ({ ...variant, explanation: previous.explanation })) };
}
