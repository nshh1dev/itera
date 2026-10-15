import type { SeedExercise } from "./content";

type Lesson = Pick<SeedExercise, "slug" | "title" | "statement" | "python" | "javascript" | "starters" | "tests" | "hints" | "explanation" | "constraints">;
const lesson = (data: Lesson): SeedExercise => ({
  ...data, category: "Arreglos", level: "INTERMEDIATE", minutes: 12,
  description: data.statement.split("\n")[0],
  constraints: ["Implementa solve(data) y devuelve el resultado, sin imprimirlo.", "Conserva la estructura de la plantilla y cambia el paso indicado.", ...data.constraints],
});

export const rotationExercises: SeedExercise[] = [
  lesson({
    slug: "reduce-vueltas-completas", title: "Las vueltas que sobran",
    statement: "Reduce un desplazamiento quitando las vueltas completas.\n\nYa conoces % como resto al dividir entre dos. También sirve con otros divisores positivos. Recibes k, un número de pasos no negativo, y size, el número de posiciones de un círculo. La plantilla guarda ambos como pasos y tamano.\n\nAl avanzar tantas posiciones como tamano, vuelves al punto inicial. Solo importan los pasos que sobran: pasos % tamano. Con k = 8 y size = 3, das dos vueltas completas y sobran 2 pasos. Devuelve ese resto, no cuántas vueltas completas diste.\n\nCambia pasos % 2 por pasos % tamano. No es una comprobación de paridad. Si k es cero o múltiplo de size, devuelve 0: no hay desplazamiento efectivo. Aquí size siempre es positivo. No se puede calcular el resto entre cero; en el reto de rotación comprobarás primero si la lista está vacía.",
    python: "def solve(data):\n    pasos = data['k']\n    tamano = data['size']\n    return pasos % tamano\n",
    javascript: "function solve(data) {\n  const pasos = data.k;\n  const tamano = data.size;\n  return pasos % tamano;\n}\n",
    starters: {
      python: "def solve(data):\n    pasos = data['k']\n    tamano = data['size']\n    return pasos % 2\n",
      javascript: "function solve(data) {\n  const pasos = data.k;\n  const tamano = data.size;\n  return pasos % 2;\n}\n",
    },
    constraints: ["k es un entero entre 0 y 10⁶; size es un entero entre 1 y 1000."],
    hints: ["Una vuelta tiene size posiciones, no siempre dos.", "El divisor debe ser el tamaño del círculo.", "Devuelve pasos % tamano."],
    explanation: "Ocho pasos en un círculo de tres posiciones dejan el mismo desplazamiento que dos pasos. Seis pasos en ese círculo dejan cero. Para entradas no negativas y tamaño positivo, el resto está entre cero y tamano − 1 en ambos lenguajes. Tiempo y espacio O(1) dentro de los límites de entrada.",
    tests: [{ input: { k: 8, size: 3 }, expected: 2 }, { input: { k: 6, size: 3 }, expected: 0 }, { input: { k: 0, size: 5 }, expected: 0 }, { input: { k: 7, size: 1 }, expected: 0 }, { input: { k: 2, size: 5 }, expected: 2 }, { input: { k: 1000000, size: 7 }, expected: 1 }],
  }),
  lesson({
    slug: "siguiente-indice-circular", title: "Después del último, el primero",
    statement: "Avanza una posición y vuelve al inicio cuando haga falta.\n\nRecibes index, un índice válido, y size, el número de posiciones. La plantilla los guarda en indice y tamano. Los índices van de 0 a tamano − 1. Para avanzar, suma uno; para volver al principio tras el último, calcula el resto con el tamaño: (indice + 1) % tamano.\n\nLa plantilla suma cero y se queda en el mismo sitio. Cambia solo indice + 0 por indice + 1. Los paréntesis indican que primero se suma y después se calcula el resto.\n\nCon size = 4, desde el índice 1 avanzas al 2; desde el 3 avanzas al 0, porque 4 % 4 es 0. No devuelvas 4 como índice: no existe en ese círculo. Con una sola posición, el siguiente índice sigue siendo 0. Aquí nunca recibes un tamaño cero ni un índice negativo.",
    python: "def solve(data):\n    indice = data['index']\n    tamano = data['size']\n    return (indice + 1) % tamano\n",
    javascript: "function solve(data) {\n  const indice = data.index;\n  const tamano = data.size;\n  return (indice + 1) % tamano;\n}\n",
    starters: {
      python: "def solve(data):\n    indice = data['index']\n    tamano = data['size']\n    return (indice + 0) % tamano\n",
      javascript: "function solve(data) {\n  const indice = data.index;\n  const tamano = data.size;\n  return (indice + 0) % tamano;\n}\n",
    },
    constraints: ["size es un entero entre 1 y 1000; index es un entero con 0 ≤ index < size."],
    hints: ["El resto ya permite volver al inicio; falta avanzar antes.", "No cambies tamano ni el operador %.", "Sustituye indice + 0 por indice + 1."],
    explanation: "Sumamos uno a la posición actual. Si llegamos a tamano, el resto lo transforma en cero. Si no llegamos, el resto conserva el índice avanzado. Así todos los resultados son posiciones válidas. Tiempo y espacio O(1).",
    tests: [{ input: { index: 1, size: 4 }, expected: 2 }, { input: { index: 3, size: 4 }, expected: 0 }, { input: { index: 0, size: 1 }, expected: 0 }, { input: { index: 0, size: 2 }, expected: 1 }, { input: { index: 998, size: 1000 }, expected: 999 }],
  }),
  lesson({
    slug: "recorre-en-circulo", title: "Empieza en otra posición",
    statement: "Construye una lista leyendo una vuelta desde un índice elegido.\n\nRecibes numbers, una lista no vacía, y start, un índice válido. Debes devolver todos sus elementos, empezando en start y continuando hacia la derecha; tras el último índice, vuelve al cero. Con numbers = [10, 20, 30, 40] y start = 2, devuelve [30, 40, 10, 20]. No cambies la lista recibida.\n\nLa plantilla ya prepara resultado y recorre con while. Hay dos variables distintas: indice dice qué posición leer; leidos cuenta cuántos elementos se han añadido. indice avanza con (indice + 1) % tamano y vuelve al inicio; leidos avanza sin volver a cero y detiene el bucle al llegar a tamano. Si usases solo indice < tamano para parar, nunca terminarías.\n\nCambia la asignación inicial indice = 0 por indice = data['start'] en Python o let indice = data.start en JavaScript. No cambies el avance, el contador ni return. Con start = 0 se conserva el orden. Una lista de un elemento devuelve ese mismo elemento en una lista. Aquí la entrada nunca está vacía; en el reto comprobarás ese caso antes de calcular restos o leer posiciones.",
    python: "def solve(data):\n    numeros = data['numbers']\n    tamano = len(numeros)\n    resultado = []\n    indice = data['start']\n    leidos = 0\n    while leidos < tamano:\n        resultado.append(numeros[indice])\n        indice = (indice + 1) % tamano\n        leidos = leidos + 1\n    return resultado\n",
    javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const tamano = numeros.length;\n  const resultado = [];\n  let indice = data.start;\n  let leidos = 0;\n  while (leidos < tamano) {\n    resultado.push(numeros[indice]);\n    indice = (indice + 1) % tamano;\n    leidos = leidos + 1;\n  }\n  return resultado;\n}\n",
    starters: {
      python: "def solve(data):\n    numeros = data['numbers']\n    tamano = len(numeros)\n    resultado = []\n    indice = 0\n    leidos = 0\n    while leidos < tamano:\n        resultado.append(numeros[indice])\n        indice = (indice + 1) % tamano\n        leidos = leidos + 1\n    return resultado\n",
      javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const tamano = numeros.length;\n  const resultado = [];\n  let indice = 0;\n  let leidos = 0;\n  while (leidos < tamano) {\n    resultado.push(numeros[indice]);\n    indice = (indice + 1) % tamano;\n    leidos = leidos + 1;\n  }\n  return resultado;\n}\n",
    },
    constraints: ["numbers contiene de 1 a 100 enteros entre −1000 y 1000; start es un entero con 0 ≤ start < longitud de numbers."],
    hints: ["El recorrido circular ya está escrito: solo debe empezar en otra posición.", "start es un índice, no el valor que hay en esa posición.", "Inicializa indice con data['start'] en Python o data.start en JavaScript."],
    explanation: "Desde el índice 2 de [10, 20, 30, 40] leemos las posiciones 2, 3, 0 y 1. El contador leidos toma 0, 1, 2 y 3 durante esas vueltas y llega a 4 para parar. Cada posición se visita una vez y sus valores se añaden a una lista nueva. Tiempo O(n), salida O(n) y espacio auxiliar O(1).",
    tests: [{ input: { numbers: [10,20,30,40], start: 2 }, expected: [30,40,10,20] }, { input: { numbers: [4,9,2], start: 0 }, expected: [4,9,2] }, { input: { numbers: [0], start: 0 }, expected: [0] }, { input: { numbers: [-1,0,7], start: 2 }, expected: [7,-1,0] }, { input: { numbers: [2,2,1], start: 1 }, expected: [2,1,2] }],
  }),
];

// Solo se incorpora a instalaciones existentes como una versión nueva en borrador.
export const rotationRevisions: Record<string, Pick<SeedExercise, "description" | "minutes" | "statement" | "python" | "javascript" | "starters" | "hints" | "explanation" | "tests">> = {
  "rotar-arreglo": {
    description: "Reduce las vueltas completas y reconstruye una lista desde el índice de inicio de un giro a la derecha.", minutes: 25,
    statement: "Combina Las vueltas que sobran, Después del último, el primero y Empieza en otra posición. Recibes numbers, una lista de enteros, y k, un entero no negativo. Devuelve una lista nueva rotada k posiciones a la derecha: los elementos que salen por el final vuelven al principio. No ordenes, elimines duplicados ni cambies numbers.\n\nCon [1, 2, 3, 4, 5] y k = 2, devuelve [4, 5, 1, 2, 3]. Es un giro a la derecha, no a la izquierda. Una lista vacía devuelve []; la plantilla ya trata ese caso antes de calcular restos, para no dividir entre cero.\n\nPrimero reduce las vueltas completas: desplazamiento = k % tamano. Después calcula el índice desde el que leer: indice = (tamano - desplazamiento) % tamano. Con tamaño 5 y desplazamiento 2, empieza en el índice 3, cuyo valor es 4. Si el desplazamiento es 0, la resta da tamano y el resto lo devuelve al índice 0. Todos estos operandos son no negativos; no necesitas calcular el resto de un número negativo.\n\nLa plantilla prepara resultado y leidos. Añade un while que lea exactamente tamano elementos como en Empieza en otra posición: añade numeros[indice], avanza indice con (indice + 1) % tamano y aumenta leidos en uno. Devuelve resultado fuera del bucle. No hagas k recorridos: un k grande solo cambia el índice inicial, no el número de elementos que debes copiar. No necesitas segmentos, slicing ni operaciones para mover elementos dentro de la lista.",
    python: "def solve(data):\n    numeros = data['numbers']\n    tamano = len(numeros)\n    if tamano == 0:\n        return []\n    desplazamiento = data['k'] % tamano\n    indice = (tamano - desplazamiento) % tamano\n    resultado = []\n    leidos = 0\n    while leidos < tamano:\n        resultado.append(numeros[indice])\n        indice = (indice + 1) % tamano\n        leidos = leidos + 1\n    return resultado\n",
    javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const tamano = numeros.length;\n  if (tamano === 0) {\n    return [];\n  }\n  const desplazamiento = data.k % tamano;\n  let indice = (tamano - desplazamiento) % tamano;\n  const resultado = [];\n  let leidos = 0;\n  while (leidos < tamano) {\n    resultado.push(numeros[indice]);\n    indice = (indice + 1) % tamano;\n    leidos = leidos + 1;\n  }\n  return resultado;\n}\n",
    starters: {
      python: "def solve(data):\n    numeros = data['numbers']\n    tamano = len(numeros)\n    if tamano == 0:\n        return []\n    resultado = []\n    leidos = 0\n    # Reduce k, calcula el inicio y copia una vuelta con un while.\n    return resultado\n",
      javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const tamano = numeros.length;\n  if (tamano === 0) {\n    return [];\n  }\n  const resultado = [];\n  let leidos = 0;\n  // Reduce k, calcula el inicio y copia una vuelta con un while.\n  return resultado;\n}\n",
    },
    hints: ["Comprueba el tamaño antes de usar %. Para una lista no vacía, calcula desplazamiento con k % tamano.", "Empieza a leer en (tamano - desplazamiento) % tamano: girar dos a la derecha hace que los dos últimos aparezcan primero.", "Mientras leidos < tamano, añade numeros[indice], actualiza indice = (indice + 1) % tamano y suma uno a leidos. No modifiques numeros."],
    explanation: "Reducimos k a un desplazamiento menor que el tamaño. El inicio es el índice del primer elemento que debe aparecer en la salida. Desde ahí copiamos una vuelta completa, conservando el orden circular y todas las repeticiones. Para k = 0 o un múltiplo del tamaño, empezamos en cero y aun así construimos otra lista. La entrada vacía sale antes de calcular restos. Tiempo O(n) y salida O(n), con espacio auxiliar O(1), independientemente de k dentro de los límites de entrada.",
    tests: [
      { input: { numbers: [1,2,3,4,5], k: 2 }, expected: [4,5,1,2,3] },
      { input: { numbers: [1,2,3], k: 3 }, expected: [1,2,3] },
      { input: { numbers: [], k: 5 }, expected: [] },
      { input: { numbers: [1,2], k: 5 }, expected: [2,1] },
      { input: { numbers: [9], k: 0 }, expected: [9] },
      { input: { numbers: [0,-1,0,2], k: 1 }, expected: [2,0,-1,0] },
      { input: { numbers: [3,1,2], k: 0 }, expected: [3,1,2] },
      { input: { numbers: [1,2,3], k: 1000000 }, expected: [3,1,2] },
      { input: { numbers: [7], k: 1000000 }, expected: [7] },
      { input: { numbers: [], k: 0 }, expected: [] },
    ],
  },
};
