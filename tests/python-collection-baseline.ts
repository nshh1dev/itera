import type { VersionContent } from "../prisma/editorial-revision";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonCollectionExplanations } from "../prisma/python-collection-explanations";
import { beforePythonRecords } from "./python-record-baseline";

// Solo para huellas anteriores al lote de colecciones. Las lecciones originales
// se conservan y permiten reconstruir la prosa previa sin tocar el catálogo.
export function beforePythonCollections(slug: string, content: VersionContent): VersionContent {
  content = beforePythonRecords(slug, content);
  if (!(slug in pythonCollectionExplanations)) return content;
  const lesson = pythonLessons.get(slug);
  if (!lesson) throw new Error(`Falta la lección original de ${slug}`);
  return { ...content, variants: content.variants.map(variant => ({
    ...variant, explanation: `${lesson.theory}\n\n${lesson.explanation}`,
  })) };
}
