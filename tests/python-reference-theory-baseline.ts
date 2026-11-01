import type { VersionContent } from "../prisma/editorial-revision";

export const previousReferenceTheoryTasks: Record<string, string> = {
  "logica-parametro-exterior": "Escribe dentro de solve(data) una auxiliar llamada doble que utilice su parámetro, no el valor exterior. La plantilla solo prepara solve(data): añade las operaciones y la auxiliar del reto.",
  "logica-copia-plana": "Copia la lista recibida con list(valores) y añade nuevo solo al final de la copia. Practica una copia independiente, no un alias.",
  "logica-valida-divisor": "Valida el divisor antes de calcular un cociente. Distingue un divisor cero de un total cero válido.",
};
export const previousReferenceTheoryHints: Record<string, { index: number; text: string }> = {
  "logica-parametro-exterior": { index: 0, text: "El argumento se copia al parámetro al llamar." },
  "logica-registro-compartido": { index: 1, text: "Cambia la propiedad, no reasignes alias." },
};

export function beforePythonReferenceTheory(slug: string, content: VersionContent): VersionContent {
  if (slug in previousReferenceTheoryTasks) {
    const restore = (text: string) => {
      const index = text.indexOf("\n\nEntrada\n");
      if (index < 0) throw new Error(`Falta Entrada en ${slug}`);
      return `Tu tarea\n${previousReferenceTheoryTasks[slug]}${text.slice(index)}`;
    };
    content = { ...content, statement: restore(content.statement), variants: content.variants.map(variant => {
      if (!variant.statement) throw new Error(`Falta el enunciado Python de ${slug}`);
      return { ...variant, statement: restore(variant.statement) };
    }) };
  }
  const hint = previousReferenceTheoryHints[slug];
  return hint ? { ...content, hints: content.hints.map((text, index) => index === hint.index ? hint.text : text) } : content;
}
