import type { VersionContent } from "../prisma/editorial-revision";

export const previousExceptionTheoryTasks: Record<string, string> = {
  "logica-localiza-error": "Localiza un error sin provocarlo: el fragmento conceptual consulta valores[indice] sin comprobar límites. La plantilla solo prepara solve(data); escribe la comprobación antes de consultar la posición.",
  "logica-conserva-regresion": "Implementa un descuento y conserva pruebas de sus límites. La plantilla solo prepara solve(data), no contiene una implementación defectuosa. Añade aserciones para total 10, limite 10 → 8 y total 0, limite 0 → 0.",
};

// Reconstruye solo Tu tarea de las dos variantes Python; contratos intactos.
export function beforePythonExceptionTheory(slug: string, content: VersionContent): VersionContent {
  if (!(slug in previousExceptionTheoryTasks)) return content;
  const restore = (text: string) => {
    const index = text.indexOf("\n\nEntrada\n");
    if (index < 0) throw new Error(`Falta Entrada en ${slug}`);
    return `Tu tarea\n${previousExceptionTheoryTasks[slug]}${text.slice(index)}`;
  };
  return { ...content, statement: restore(content.statement), variants: content.variants.map(variant => {
    if (!variant.statement) throw new Error(`Falta el enunciado Python de ${slug}`);
    return { ...variant, statement: restore(variant.statement) };
  }) };
}
