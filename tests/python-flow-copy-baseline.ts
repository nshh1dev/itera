import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonReferenceCopy } from "./python-reference-copy-baseline";

export const previousFlowCopy = {
  "logica-dos-requisitos": { hints: ["No basta con que se cumpla una sola condición.", "Ambas comparaciones ya están guardadas en variables.", "Combina los dos booleanos con la conjunción lógica del lenguaje seleccionado."] },
  "python-condicional": { description: "Elegir entre dos valores mediante una expresión condicional." },
  "python-centinela": { description: "Terminar un recorrido cuando aparece un centinela." },
  "python-omite-negativos": { description: "Omitir una vuelta sin terminar el recorrido." },
  "python-ordena-numeros": { description: "Ordenar una copia sin modificar la lista recibida." },
  "python-recorta": { description: "Extraer una rebanada con límite superior exclusivo." },
  "python-une-palabras": { description: "Separar y reconstruir texto con una normalización precisa." },
  "python-desempaqueta": { description: "Desempaquetar una pareja antes de intercambiar sus valores." },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonFlowCopy(slug: string, content: VersionContent): VersionContent {
  content = beforePythonReferenceCopy(slug, content);
  const previous = previousFlowCopy[slug as keyof typeof previousFlowCopy];
  return previous ? { ...content, ...previous } : content;
}
