import type { VersionContent } from "../prisma/editorial-revision";

export const previousDictionaryPrerequisites: Record<string, string[]> = {
  "logica-frecuencias": ["Recorrer cadenas", "Diccionarios u objetos", "Contadores"],
  "logica-delimitadores": ["Recorrer cadenas", "Pilas: añadir y retirar el último elemento", "Diccionarios u objetos", "Condiciones y salida anticipada"],
  "logica-altura": ["Recursión", "Objetos anidados"],
};

export function beforePythonDictionaryPrerequisites(slug: string, content: VersionContent): VersionContent {
  const prerequisites = previousDictionaryPrerequisites[slug];
  return prerequisites ? { ...content, prerequisites } : content;
}
