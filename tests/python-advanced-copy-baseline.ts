import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonDictionaryPrerequisites } from "./python-dictionary-prerequisites-baseline";

export const previousAdvancedCopy = {
  "logica-permutaciones": { description: "Genera todas las permutaciones de un conjunto de enteros distintos en orden alfabético." },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonAdvancedCopy(slug: string, content: VersionContent): VersionContent {
  content = beforePythonDictionaryPrerequisites(slug, content);
  const previous = previousAdvancedCopy[slug as keyof typeof previousAdvancedCopy];
  return previous ? { ...content, ...previous } : content;
}
