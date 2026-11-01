import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonReferenceTheory } from "./python-reference-theory-baseline";

export const previousFlowTheoryTasks: Record<string, string> = {
  "logica-dos-requisitos": "Completa el retorno de la plantilla para combinar dos requisitos que deben cumplirse al mismo tiempo. Las dos comparaciones ya están calculadas; conserva su estructura.",
  "logica-alternativas": "Decide si una persona puede acceder: basta con tener invitación o entrada comprada, pero el bloqueo impide siempre el acceso. Practica cómo combinar alternativas y negar una condición.",
};

// Reconstruye solo Tu tarea de las dos variantes Python; contratos intactos.
export function beforePythonFlowTheory(slug: string, content: VersionContent): VersionContent {
  content = beforePythonReferenceTheory(slug, content);
  if (!(slug in previousFlowTheoryTasks)) return content;
  const restore = (text: string) => {
    const index = text.indexOf("\n\nEntrada\n");
    if (index < 0) throw new Error(`Falta Entrada en ${slug}`);
    return `Tu tarea\n${previousFlowTheoryTasks[slug]}${text.slice(index)}`;
  };
  return { ...content, statement: restore(content.statement), variants: content.variants.map(variant => {
    if (!variant.statement) throw new Error(`Falta el enunciado Python de ${slug}`);
    return { ...variant, statement: restore(variant.statement) };
  }) };
}
