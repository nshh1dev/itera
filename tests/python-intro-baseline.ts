import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent, type VersionContent } from "../prisma/editorial-revision";
import { pythonIntroExplanations } from "../prisma/python-intro-explanations";
import { beforePythonFlow } from "./python-flow-baseline";

// Solo para reconstruir huellas históricas. Estas doce explicaciones procedían
// sin cambios de la variante Python compartida, cuyas fuentes se conservan.
export function beforePythonIntro(slug: string, content: VersionContent): VersionContent {
  content = beforePythonFlow(slug, content);
  if (!(slug in pythonIntroExplanations)) return content;
  const exercise = logicExercises.find(exercise => exercise.slug === slug);
  if (!exercise) throw new Error(`Falta el ejercicio original de ${slug}`);
  const previous = seedVersionContent(exercise).variants.find(variant => variant.language === "python");
  if (!previous) throw new Error(`Falta la variante Python original de ${slug}`);
  return { ...content, variants: content.variants.map(variant => ({ ...variant, explanation: previous.explanation })) };
}
