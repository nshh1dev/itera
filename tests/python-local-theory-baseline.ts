import type { VersionContent } from "../prisma/editorial-revision";

// Párrafos vigentes antes del primer lote de teoría local. La reconstrucción
// mantiene Entrada/Resultado esperado actuales: cualquier cambio allí rompe
// también la huella histórica, pues este lote no los autoriza.
export const previousLocalTheoryTasks: Record<string, string> = {
  "python-retorno-multiple": "Define una función auxiliar que reciba dos enteros y devuelva juntos su suma y su producto. Un return con valores separados por coma devuelve una tupla, que puede desempaquetarse en la llamada; no son dos retornos separados, pues solo se ejecuta el primer return de una llamada.",
  "python-identidad": "Compara contenido e identidad: == compara contenido; is pregunta si es el mismo objeto. Construye original = list(data['valores']), alias = original y copia = list(original). Conserva antes = list(original) y añade nuevo solo al alias. list(...) crea otra lista; asignar alias no la copia.",
  "python-actualiza-diccionario": "Actualiza una copia de un diccionario sin cambiar el original. dict(original) copia un diccionario plano; asignar copia[clave] sirve tanto para insertar como para reemplazar, sin eliminar primero la clave.",
};

export function localTheoryContract(statement: string): string {
  const index = statement.indexOf("\n\nEntrada\n");
  if (index < 0) throw new Error("Falta la sección Entrada del enunciado Python.");
  return statement.slice(index);
}

export function beforePythonLocalTheory(slug: string, content: VersionContent): VersionContent {
  if (!(slug in previousLocalTheoryTasks)) return content;
  const restore = (text: string) => `Tu tarea\n${previousLocalTheoryTasks[slug]}${localTheoryContract(text)}`;
  return { ...content, statement: restore(content.statement), variants: content.variants.map(variant => {
    if (!variant.statement) throw new Error(`Falta el enunciado Python de ${slug}`);
    return { ...variant, statement: restore(variant.statement) };
  }) };
}
