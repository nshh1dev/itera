import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonIntroCopy } from "./python-intro-copy-baseline";

export const previousPrerequisiteVocabulary: Record<string, string[]> = {
  "logica-dos-parametros": ["Acceder a propiedades", "Sumar números", "Utilizar variables y return"],
  "logica-opcional": ["Propiedades de objetos y tratamiento de ausencia."],
  "logica-ventana-fija": ["Subarreglos contiguos", "Actualización incremental"],
  "logica-mochila": ["Programación dinámica", "Arreglos"],
};

export function beforePythonPrerequisiteVocabulary(slug: string, content: VersionContent): VersionContent {
  content = beforePythonIntroCopy(slug, content);
  const prerequisites = previousPrerequisiteVocabulary[slug];
  return prerequisites ? { ...content, prerequisites } : content;
}
