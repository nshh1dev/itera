import type { VersionContent } from "../prisma/editorial-revision";

export const previousCollectionCopy = {
  "python-conjunto-seguro": { description: "Actualizar un conjunto sin fallar por un elemento ausente." },
  "python-union": { description: "Construir la unión de dos conjuntos." },
  "python-interseccion": { description: "Construir la intersección de dos conjuntos." },
  "python-diferencia": { description: "Calcular faltantes respetando la dirección de la diferencia." },
  "python-simetrica": { description: "Distinguir diferencia simétrica de unión e intersección." },
  "python-subconjunto": { description: "Comprobar inclusión de conjuntos, incluido el conjunto vacío." },
  "logica-repetido": { hints: ["Necesitas recordar los valores anteriores.", "Un conjunto permite preguntar si un valor ya apareció.", "Consulta antes de añadir; si ya existe, devuelve verdadero."] },
  "logica-anagramas": { hints: ["La inicialización ya crea todas las claves: no hace falta comprobar si existen antes de aumentar sus contadores.", "Recorre a y b en minúsculas por separado; si letra es distinta de ' ', suma uno en la tabla correspondiente.", "Recorre alfabeto y devuelve falso ante cualquier contador distinto. Devuelve verdadero fuera de ese bucle, nunca en su primera vuelta."] },
  "python-crea-grupo": { description: "Prepara la lista de una categoría antes de añadir un nombre de texto." },
  "python-comprension": { description: "Traducir una transformación de lista a una comprensión." },
  "python-comprension-filtro": { description: "Combinar normalización y filtro en una comprensión." },
  "python-comprension-condicional": { description: "Distinguir transformar condicionalmente de filtrar." },
  "python-comprension-dict": { description: "Construir asociaciones mediante una comprensión de diccionario." },
  "python-iterador": { description: "Reconocer el agotamiento de un iterador." },
  "python-generador": { description: "Consumir una expresión generadora mediante agregación." },
  "python-map": { description: "Materializar una transformación mediante map." },
  "python-filter": { description: "Separar un predicado de selección de la extracción de campos." },
  "python-agrega": { description: "Aplicar agregación con una política explícita para el vacío." },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonCollectionCopy(slug: string, content: VersionContent): VersionContent {
  const previous = previousCollectionCopy[slug as keyof typeof previousCollectionCopy];
  return previous ? { ...content, ...previous } : content;
}
