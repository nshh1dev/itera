import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonRecordVocabulary } from "./python-record-vocabulary-baseline";

export const previousCapacityExamples = [
  "Con capacidad 9 se reparte en dos días.",
  "Capacidad 6 completa la ruta en tres días.",
] as const;

// Restaura solo las dos explicaciones públicas de capacidad, no casos ocultos.
export function beforePythonFinalExamples(slug: string, content: VersionContent): VersionContent {
  content = beforePythonRecordVocabulary(slug, content);
  if (slug !== "logica-capacidad") return content;
  return { ...content, variants: content.variants.map(variant => ({
    ...variant, tests: variant.tests.map(item => item.visible && (item.order === 0 || item.order === 1)
      ? { ...item, explanation: previousCapacityExamples[item.order] } : item),
  })) };
}
