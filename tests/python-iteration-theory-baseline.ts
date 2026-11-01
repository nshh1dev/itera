import type { VersionContent } from "../prisma/editorial-revision";

export const previousIterationTheoryTasks: Record<string, string> = {
  "python-recorre-pares": "Recorre las parejas de un diccionario. items ofrece parejas; keys y values ofrecen vistas de claves y valores. sorted(d.items()) ordena primero por clave; puedes desempaquetar cada pareja durante el recorrido.",
  "python-subconjunto": "Comprueba si todos los requisitos están disponibles. Para conjuntos, A <= B incluye la igualdad; A < B exige además que no sean iguales. El conjunto vacío es subconjunto de cualquier conjunto.",
  "python-map": "Practica map con una función auxiliar. map(funcion, valores) aplica la función a cada elemento y devuelve un iterador; pasa la función por nombre, sin llamarla. list materializa los valores para devolver JSON.",
};

// Solo restaura tres párrafos previos; mantiene los contratos actuales para que
// una modificación ajena a teoría siga rompiendo las huellas históricas.
export function beforePythonIterationTheory(slug: string, content: VersionContent): VersionContent {
  if (!(slug in previousIterationTheoryTasks)) return content;
  const restore = (text: string) => {
    const index = text.indexOf("\n\nEntrada\n");
    if (index < 0) throw new Error(`Falta Entrada en ${slug}`);
    return `Tu tarea\n${previousIterationTheoryTasks[slug]}${text.slice(index)}`;
  };
  return { ...content, statement: restore(content.statement), variants: content.variants.map(variant => {
    if (!variant.statement) throw new Error(`Falta el enunciado Python de ${slug}`);
    return { ...variant, statement: restore(variant.statement) };
  }) };
}
