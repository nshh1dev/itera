import type { VersionContent } from "../prisma/editorial-revision";

export const previousCollectionExamples: Record<string, string> = {
  "python-conjunto-seguro": "El dos repetido aparece una vez; quitar nueve no causa error.",
  "python-crea-grupo": "La categoría existente conserva a Ana antes de añadir a Bea.",
  "python-comprension-dict": "La palabra sol repetida mantiene una sola clave con longitud tres.",
  "python-agrega": "Todos los números son negativos: el máximo no puede empezar en cero.",
};

// Solo la explicación pública de orden 0; ni datos ni los demás casos.
export function beforePythonCollectionExamples(slug: string, content: VersionContent): VersionContent {
  if (!(slug in previousCollectionExamples)) return content;
  return { ...content, variants: content.variants.map(variant => ({
    ...variant, tests: variant.tests.map(item => item.visible && item.order === 0
      ? { ...item, explanation: previousCollectionExamples[slug] } : item),
  })) };
}
