import type { VersionContent } from "../prisma/editorial-revision";

export const previousCommonTheoryTasks: Record<string, string> = {
  "logica-igualdad": "Completa la comparación de igualdad. La plantilla ya prepara los números y el formato de salida; conserva ambas partes.",
  "logica-retorno": "Practica cómo entregar un resultado desde solve(data) usando return.",
  "logica-imprimir-devolver": "Corrige la plantilla: calcula el número recibido más uno, pero lo imprime y devuelve cero. Distingue mostrar un valor de devolverlo.",
};

// Solo reconstruye los párrafos anteriores de la proyección Python; mantiene
// intactos los contratos actuales y las fuentes de los otros lenguajes.
export function beforePythonCommonTheory(slug: string, content: VersionContent): VersionContent {
  if (!(slug in previousCommonTheoryTasks)) return content;
  const restore = (text: string) => {
    const index = text.indexOf("\n\nEntrada\n");
    if (index < 0) throw new Error(`Falta Entrada en ${slug}`);
    return `Tu tarea\n${previousCommonTheoryTasks[slug]}${text.slice(index)}`;
  };
  return { ...content, statement: restore(content.statement), variants: content.variants.map(variant => {
    if (!variant.statement) throw new Error(`Falta el enunciado Python de ${slug}`);
    return { ...variant, statement: restore(variant.statement) };
  }) };
}
