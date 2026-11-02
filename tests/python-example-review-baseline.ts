import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonCollectionExamples } from "./python-collection-example-baseline";

// Solo estas tres posiciones públicas cambian en el segundo bloque de ejemplos.
export const previousReviewedExamples: Record<string, { order: number; text: string }> = {
  "python-condicional": { order: 0, text: "Dieciocho pertenece a la rama adulto." },
  "logica-filtra-lista": { order: 0, text: "El 5 entra porque iguala el mínimo." },
  "python-ordena-numeros": { order: 1, text: "Las dos listas del resultado pueden estar vacías." },
};

export function beforePythonExampleReview(slug: string, content: VersionContent): VersionContent {
  content = beforePythonCollectionExamples(slug, content);
  const previous = previousReviewedExamples[slug];
  if (!previous) return content;
  return { ...content, variants: content.variants.map(variant => ({
    ...variant, tests: variant.tests.map(item => item.visible && item.order === previous.order
      ? { ...item, explanation: previous.text } : item),
  })) };
}
