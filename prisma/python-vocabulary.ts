import type { VersionContent } from "./editorial-revision";

// Revisiones explícitas de metadatos y ayudas, nunca sustituciones dentro de
// código, ejemplos, JSON ni salidas exactas de programas.
type VocabularyRevision = Partial<Pick<VersionContent,
  "description" | "objective" | "constraints" | "hints" | "commonErrors" | "practiceGoals"
>>;

export const pythonVocabularyRevisions: Record<string, VocabularyRevision> = {
  "logica-booleano": {
    description: "Guarda True, el booleano de Python, en listo. Conserva la impresión preparada: muestra true en minúsculas, como exige este programa.",
  },
  "logica-dos-parametros": {
    objective: "Consultar dos claves de un diccionario, sumar sus valores y devolver el resultado.",
  },
  "logica-perimetro": {
    description: "Recibe un diccionario con base y altura, enteros de 1 a 1000, y calcula el perímetro del rectángulo.",
  },
  "logica-mayor-tres": {
    description: "Recibe un diccionario con a, b y c, enteros entre -1000 y 1000, y encuentra el mayor.",
  },
  "logica-alternativas": {
    constraints: ["Las tres claves siempre existen y sus valores son booleanos True o False (true o false en JSON)."],
    practiceGoals: ["Combinar alternativas con or y excluir con not.", "Agrupar condiciones para expresar una regla sin ambigüedad."],
  },
  "logica-indices": {
    hints: ["indice ya avanza de cero a la última posición válida.", "Añade el valor en esa posición, no la posición misma.", "Cambia data[0] por data[indice] en la llamada a append."],
  },
  "logica-ficha-producto": {
    hints: ["Una ficha se representa como un diccionario: cada clave identifica un valor.", "No necesitas combinar los valores de ambas claves.", "Devuelve el valor asociado a la clave precio."],
    practiceGoals: ["Consultar el valor numérico asociado a una clave de diccionario."],
  },
  "logica-ausencia": {
    constraints: ["La entrada es None (null en JSON) o un entero entre −100 y 100."],
    commonErrors: ["Tratar cero como ausencia.", "Sumar antes de comprobar si el valor es None."],
    practiceGoals: ["Tratar None sin descartar cero.", "Distinguir un número de la ausencia antes de operar."],
  },
  "logica-reasigna-o-muta": {
    hints: ["Reasignar cambia a qué lista apunta alias.", "No llames append sobre original: debes cambiar la referencia de alias, no modificar la lista compartida.", "La lista original conserva todos sus valores."],
  },
  "logica-valido-cero-ausente": {
    description: "Clasifica cantidad, un entero o None (null en JSON), sin confundir el cero válido con la ausencia.",
  },
  "logica-mediciones": {
    practiceGoals: ["Construir un diccionario de resumen con varias claves.", "Probar una lista vacía y valores negativos."],
  },
  "logica-carrito": {
    description: "Calcula el total de un carrito: items es una lista de diccionarios con precio y cantidad, enteros de 0 a 100; descuento es un entero de 0 a 100.",
  },
  "logica-frecuencias": {
    description: "Construye un diccionario y acumula las apariciones de cada letra bajo su clave.",
  },
  "logica-ordena-insercion": {
    description: "Ordena una lista insertando cada valor en la parte ya ordenada.",
  },
  "logica-combina": {
    description: "Combina dos listas ya ordenadas en una sola, también ordenada.",
  },
  "logica-prefijos": {
    description: "Construye la lista de sumas de prefijos de una lista de números.",
  },
  "logica-filas": {
    description: "Suma los valores de cada fila de una matriz y devuelve una lista con esos totales.",
  },
  "logica-suma-recursiva": {
    description: "Suma los elementos de una lista con una función que se llama a sí misma.",
  },
  "logica-une-intervalos": {
    description: "Recibe una lista de intervalos [inicio, fin] y fusiona los que se solapan o se tocan.",
  },
  "logica-suma-maxima": {
    description: "Recibe una lista no vacía y encuentra la mayor suma de un tramo contiguo no vacío.",
  },
  "logica-cuenta-nodos": {
    description: "Cuenta los nodos de un árbol binario representado por diccionarios, o None si está vacío (null en JSON).",
  },
  "logica-mezcla": {
    description: "Ordena una lista dividiéndola en mitades y combinando las partes ordenadas.",
  },
};
