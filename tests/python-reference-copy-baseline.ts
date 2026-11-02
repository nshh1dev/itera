import type { VersionContent } from "../prisma/editorial-revision";

export const previousReferenceCopy = {
  "python-enumera": { description: "Recorrer índice y valor mediante enumerate." },
  "python-empareja": { description: "Emparejar secuencias con el comportamiento de zip." },
  "python-retorno-multiple": { description: "Entregar y desempaquetar varios resultados de una auxiliar." },
  "logica-ficha-producto": { objective: "Seleccionar el valor numérico de una propiedad por su nombre." },
  "logica-opcional": { practiceGoals: ["Distinguir propiedad ausente y cantidad cero."] },
  "python-identidad": { description: "Distinguir igualdad de contenido, identidad y efectos de mutar un alias." },
  "python-opcional-seguro": { description: "Crear el contenedor predeterminado dentro de cada llamada." },
  "python-actualiza-diccionario": { description: "Añadir y reemplazar claves de una copia de diccionario." },
  "python-borra-clave": { description: "Eliminar una clave ausente sin provocar KeyError." },
  "python-recorre-pares": { description: "Recorrer claves y valores con un orden de salida explícito." },
  "python-lista-registros": { description: "Combinar un recorrido de lista con acceso a un campo." },
  "logica-valida-divisor": { hints: ["Comprueba el divisor antes de operar.", "Cero en total sí es válido.", "Devuelve ausencia solo cuando divisor vale cero; consulta su representación en la explicación de tu lenguaje."] },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonReferenceCopy(slug: string, content: VersionContent): VersionContent {
  const previous = previousReferenceCopy[slug as keyof typeof previousReferenceCopy];
  return previous ? { ...content, ...previous } : content;
}
