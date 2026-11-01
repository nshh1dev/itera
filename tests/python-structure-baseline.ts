import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent, type VersionContent } from "../prisma/editorial-revision";
import { pythonStructureExplanations } from "../prisma/python-structure-explanations";
import { beforePythonOptimization } from "./python-optimization-baseline";

const previousIntervals = "Empieza con prefijos = [0] y añade cada suma acumulada. La consulta [inicio, fin] tiene extremos incluidos: resta prefijos[inicio] a prefijos[fin + 1]. for inicio, fin in consultas desempaqueta cada pareja. La comprensión construye una respuesta por consulta; también puedes usar un bucle con append. La consulta vacía produce [].";
const previousTreeNote = "\n\nEn Python, cada nodo usa las claves value (entero), left y right (otro nodo o None). No uses v, izq o der en esta variante.";
const trees = new Set(["logica-altura", "logica-preorden", "logica-niveles"]);

// Solo prosa histórica: conserva el puente previo de prefijos y la nota de claves
// Python añadida a los tres árboles, sin modificar fuentes ni datos persistidos.
export function beforePythonStructures(slug: string, content: VersionContent): VersionContent {
  content = beforePythonOptimization(slug, content);
  if (!(slug in pythonStructureExplanations)) return content;
  const exercise = logicExercises.find(exercise => exercise.slug === slug);
  if (!exercise) throw new Error(`Falta el ejercicio original de ${slug}`);
  const previous = seedVersionContent(exercise).variants.find(variant => variant.language === "python");
  if (!previous) throw new Error(`Falta la variante Python original de ${slug}`);
  const explanation = slug === "logica-intervalos-suma" ? previousIntervals : previous.explanation + (trees.has(slug) ? previousTreeNote : "");
  return { ...content, variants: content.variants.map(variant => ({ ...variant, explanation })) };
}
