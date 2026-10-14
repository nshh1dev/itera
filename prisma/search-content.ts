import type { SeedExercise } from "./content";

type Lesson = Pick<SeedExercise, "slug" | "title" | "statement" | "python" | "javascript" | "starters" | "tests" | "hints" | "explanation" | "constraints">;
const lesson = (data: Lesson): SeedExercise => ({
  ...data, category: "Algoritmos", level: "INTERMEDIATE", minutes: 12,
  description: data.statement.split("\n")[0],
  constraints: ["Implementa solve(data) y devuelve el resultado, sin imprimirlo.", "Conserva la estructura de la plantilla y cambia el paso indicado.", ...data.constraints],
});

export const searchExercises: SeedExercise[] = [
  lesson({
    slug: "repite-con-while", title: "Repite mientras se cumpla",
    statement: "Avanza un contador hasta alcanzar el número recibido.\n\nHasta ahora for visitaba elementos. while repite un bloque mientras una condición sea verdadera; la comprueba antes de cada vuelta. La plantilla empieza contador en cero y usa while contador < data en Python o while (contador < data) en JavaScript.\n\nRecibes un entero no negativo. Cambia contador + 2 por contador + 1 para avanzar de uno en uno y devuelve contador al terminar. Con 3, la condición se comprueba con 0, 1, 2 y 3; hay tres vueltas y se devuelve 3. Con 0, la condición ya es falsa al empezar: no hay vueltas.\n\nLa actualización dentro del bucle es imprescindible: si el contador no avanzase, la condición podría ser siempre verdadera y el programa no terminaría. Conserva la actualización y el return fuera del bucle. Esta actividad practica el control de la repetición, aunque el resultado final coincida con la entrada; después usarás el contador para acceder a posiciones.",
    python: "def solve(data):\n    contador = 0\n    while contador < data:\n        contador = contador + 1\n    return contador\n",
    javascript: "function solve(data) {\n  let contador = 0;\n  while (contador < data) {\n    contador = contador + 1;\n  }\n  return contador;\n}\n",
    starters: {
      python: "def solve(data):\n    contador = 0\n    while contador < data:\n        contador = contador + 2\n    return contador\n",
      javascript: "function solve(data) {\n  let contador = 0;\n  while (contador < data) {\n    contador = contador + 2;\n  }\n  return contador;\n}\n",
    },
    constraints: ["La entrada es un entero entre 0 y 100."],
    hints: ["while comprueba la condición antes de entrar, también en la primera vuelta.", "No cambies la condición ni elimines el avance: modifica su tamaño.", "Sustituye contador + 2 por contador + 1."],
    explanation: "Cada vuelta aumenta el contador en uno. Al llegar al límite, contador < data deja de cumplirse y se devuelve el contador. Para cero no se ejecuta el bloque. El número de vueltas es n: tiempo O(n) y espacio auxiliar O(1).",
    tests: [{ input: 3, expected: 3 }, { input: 0, expected: 0 }, { input: 1, expected: 1 }, { input: 2, expected: 2 }, { input: 5, expected: 5 }, { input: 100, expected: 100 }],
  }),
  lesson({
    slug: "recorre-por-indices", title: "Visita cada posición",
    statement: "Copia una lista recorriendo sus posiciones con while.\n\nUn índice es la posición de un elemento. En [4, 9, 2], los índices son 0, 1 y 2: data[1] vale 9. Ahora indice empieza en cero y aumenta en uno dentro de un while. El tamaño se consulta con len(data) en Python o data.length en JavaScript.\n\nLa condición indice < tamaño evita acceder a una posición que no existe: una lista de tres elementos no tiene posición 3. Con una lista vacía, el bucle no entra y devuelve []. No cambies < por <=.\n\nLa plantilla añade siempre data[0]. Sustituye solo ese acceso por data[indice] para copiar el elemento de la posición actual. append en Python o push en JavaScript ya añade el valor a resultado. Conserva el avance de indice y devuelve resultado al acabar. Con [4, 9, 2], debes obtener [4, 9, 2], no [4, 4, 4] ni los índices [0, 1, 2].",
    python: "def solve(data):\n    resultado = []\n    indice = 0\n    while indice < len(data):\n        resultado.append(data[indice])\n        indice = indice + 1\n    return resultado\n",
    javascript: "function solve(data) {\n  const resultado = [];\n  let indice = 0;\n  while (indice < data.length) {\n    resultado.push(data[indice]);\n    indice = indice + 1;\n  }\n  return resultado;\n}\n",
    starters: {
      python: "def solve(data):\n    resultado = []\n    indice = 0\n    while indice < len(data):\n        resultado.append(data[0])\n        indice = indice + 1\n    return resultado\n",
      javascript: "function solve(data) {\n  const resultado = [];\n  let indice = 0;\n  while (indice < data.length) {\n    resultado.push(data[0]);\n    indice = indice + 1;\n  }\n  return resultado;\n}\n",
    },
    constraints: ["La entrada contiene de 0 a 100 enteros entre −1000 y 1000."],
    hints: ["indice ya avanza de cero a la última posición válida.", "Añade el valor en esa posición, no la posición misma.", "Cambia data[0] por data[indice] en append o push."],
    explanation: "El índice toma 0, 1 y 2 para copiar cada valor. Al valer 3, la condición impide leer data[3]. Con [] no se lee ningún elemento. El recorrido tarda O(n); la salida ocupa O(n) y el índice usa espacio auxiliar O(1).",
    tests: [{ input: [4,9,2], expected: [4,9,2] }, { input: [], expected: [] }, { input: [0], expected: [0] }, { input: [-3,0,7], expected: [-3,0,7] }, { input: [2,2], expected: [2,2] }],
  }),
  lesson({
    slug: "punto-medio-del-intervalo", title: "Una posición en el centro",
    statement: "Calcula el índice central de un intervalo inclusivo.\n\nRecibes un objeto con left y right, dos índices no negativos con left <= right. Son límites inclusivos: ambos pertenecen al intervalo. La plantilla los guarda en izquierda y derecha. Queremos el promedio de los índices, redondeado hacia abajo. No estamos calculando el promedio de los valores de una lista.\n\nEn Python, (izquierda + derecha) // 2 usa división entera. En JavaScript, Math.floor((izquierda + derecha) / 2) redondea hacia abajo la división. Estos límites son no negativos. Si hay dos posiciones centrales, elegimos la de menor índice: para [0, 3], el centro es 1, no 1.5 ni 2.\n\nLa plantilla divide entre 1. Cambia solo ese divisor por 2. Conserva los paréntesis: primero sumamos los límites y después dividimos. Para [2, 5], el centro es 3; para [4, 4], es 4. Aquí el intervalo nunca está vacío; más adelante comprobarás esa condición antes de leer el centro.",
    python: "def solve(data):\n    izquierda = data['left']\n    derecha = data['right']\n    return (izquierda + derecha) // 2\n",
    javascript: "function solve(data) {\n  const izquierda = data.left;\n  const derecha = data.right;\n  return Math.floor((izquierda + derecha) / 2);\n}\n",
    starters: {
      python: "def solve(data):\n    izquierda = data['left']\n    derecha = data['right']\n    return (izquierda + derecha) // 1\n",
      javascript: "function solve(data) {\n  const izquierda = data.left;\n  const derecha = data.right;\n  return Math.floor((izquierda + derecha) / 1);\n}\n",
    },
    constraints: ["left y right son enteros con 0 ≤ left ≤ right ≤ 10000."],
    hints: ["El promedio suma los dos extremos y divide entre dos.", "Conserva // en Python y Math.floor en JavaScript para obtener un índice entero.", "Cambia el divisor 1 por 2."],
    explanation: "Entre los índices 2 y 5, el promedio es 3.5 y elegimos 3. Entre 4 y 4 solo queda una posición, así que el centro es 4. El resultado siempre es un índice del intervalo. Tiempo y espacio O(1).",
    tests: [{ input: { left: 0, right: 3 }, expected: 1 }, { input: { left: 2, right: 5 }, expected: 3 }, { input: { left: 0, right: 0 }, expected: 0 }, { input: { left: 4, right: 4 }, expected: 4 }, { input: { left: 3, right: 7 }, expected: 5 }, { input: { left: 9999, right: 10000 }, expected: 9999 }],
  }),
  lesson({
    slug: "descarta-una-mitad", title: "Descarta una mitad",
    statement: "Haz un solo paso de búsqueda en una lista ordenada.\n\nRecibes numbers, una lista de enteros distintos en orden ascendente, y target, el objetivo. Devuelve los dos límites inclusivos que quedan tras comparar su centro: [izquierda, derecha]. No repitas la búsqueda todavía. La plantilla empieza en 0 y tamaño − 1. Una lista vacía devuelve [0, -1] sin leer ningún elemento. Si izquierda > derecha, no quedan posiciones.\n\nSi el valor central coincide con el objetivo, esta actividad devuelve [centro, centro] para señalar la posición encontrada. Si es menor que el objetivo, los valores hasta el centro tampoco pueden servir: izquierda pasa a centro + 1. Si es mayor, descartamos desde el centro hacia la derecha: derecha debe pasar a centro − 1. La plantilla tiene centro + 1 en esa última asignación; cambia solo ese + por −.\n\nCon [1, 3, 5, 7, 9], el centro es el índice 2 y su valor es 5. Si buscas 3, conserva [0, 1]; si buscas 7, conserva [3, 4]; si buscas 5, señala [2, 2]. No devuelvas los valores de los extremos.\n\nDescartamos también el centro cuando no coincide, por eso usamos + 1 o − 1. La ordenación permite saber qué mitad no puede contener el objetivo. En Busca a la mitad repetirás este paso mientras quede intervalo y devolverás directamente el índice al encontrarlo.",
    python: "def solve(data):\n    numeros = data['numbers']\n    objetivo = data['target']\n    izquierda = 0\n    derecha = len(numeros) - 1\n    if izquierda > derecha:\n        return [izquierda, derecha]\n    centro = (izquierda + derecha) // 2\n    if numeros[centro] == objetivo:\n        return [centro, centro]\n    if numeros[centro] < objetivo:\n        izquierda = centro + 1\n    else:\n        derecha = centro - 1\n    return [izquierda, derecha]\n",
    javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const objetivo = data.target;\n  let izquierda = 0;\n  let derecha = numeros.length - 1;\n  if (izquierda > derecha) {\n    return [izquierda, derecha];\n  }\n  const centro = Math.floor((izquierda + derecha) / 2);\n  if (numeros[centro] === objetivo) {\n    return [centro, centro];\n  }\n  if (numeros[centro] < objetivo) {\n    izquierda = centro + 1;\n  } else {\n    derecha = centro - 1;\n  }\n  return [izquierda, derecha];\n}\n",
    starters: {
      python: "def solve(data):\n    numeros = data['numbers']\n    objetivo = data['target']\n    izquierda = 0\n    derecha = len(numeros) - 1\n    if izquierda > derecha:\n        return [izquierda, derecha]\n    centro = (izquierda + derecha) // 2\n    if numeros[centro] == objetivo:\n        return [centro, centro]\n    if numeros[centro] < objetivo:\n        izquierda = centro + 1\n    else:\n        derecha = centro + 1\n    return [izquierda, derecha]\n",
      javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const objetivo = data.target;\n  let izquierda = 0;\n  let derecha = numeros.length - 1;\n  if (izquierda > derecha) {\n    return [izquierda, derecha];\n  }\n  const centro = Math.floor((izquierda + derecha) / 2);\n  if (numeros[centro] === objetivo) {\n    return [centro, centro];\n  }\n  if (numeros[centro] < objetivo) {\n    izquierda = centro + 1;\n  } else {\n    derecha = centro + 1;\n  }\n  return [izquierda, derecha];\n}\n",
    },
    constraints: ["numbers contiene de 0 a 100 enteros distintos entre −1000 y 1000, en orden ascendente; target es un entero en ese rango."],
    hints: ["Solo está mal la asignación de derecha en el else.", "Si el centro es demasiado grande, el último índice posible está justo antes.", "Cambia derecha = centro + 1 por derecha = centro - 1."],
    explanation: "El orden ascendente hace imposible encontrar un objetivo menor a la derecha de un centro demasiado grande. Por eso se conserva hasta centro − 1. Simétricamente, si el centro es demasiado pequeño, se conserva desde centro + 1. Una lista de un elemento que no coincide deja un intervalo vacío. Este paso aislado tiene tiempo y espacio O(1); todavía no determina si existe un objetivo que quede dentro de la mitad conservada.",
    tests: [
      { input: { numbers: [1,3,5,7,9], target: 3 }, expected: [0,1] },
      { input: { numbers: [1,3,5,7,9], target: 7 }, expected: [3,4] },
      { input: { numbers: [1,3,5,7,9], target: 5 }, expected: [2,2] },
      { input: { numbers: [], target: 0 }, expected: [0,-1] },
      { input: { numbers: [5], target: 4 }, expected: [0,-1] },
      { input: { numbers: [5], target: 6 }, expected: [1,0] },
      { input: { numbers: [-9,0], target: -9 }, expected: [0,0] },
      { input: { numbers: [1,3], target: 2 }, expected: [1,1] },
    ],
  }),
];

// Las instalaciones existentes reciben la revisión como borrador, no sobre la versión pública.
export const searchRevisions: Record<string, Pick<SeedExercise, "description" | "minutes" | "statement" | "python" | "javascript" | "starters" | "hints" | "explanation" | "tests">> = {
  "busqueda-binaria": {
    description: "Repite el descarte de mitades para encontrar un índice en una lista ordenada.", minutes: 25,
    statement: "Combina Repite mientras se cumpla, Visita cada posición, Una posición en el centro y Descarta una mitad. Recibes numbers, una lista de enteros distintos en orden ascendente, y target. Usa búsqueda binaria y devuelve el índice del objetivo o −1 si no existe. Aquí el contrato pide −1 para la ausencia, no None ni null. Un objetivo en la primera posición devuelve 0, no −1.\n\nLa plantilla obtiene los datos y prepara límites inclusivos: izquierda = 0 y derecha = tamaño − 1. Añade un while que continúe mientras izquierda <= derecha. Es <=, no <: cuando ambos límites coinciden todavía queda una posición por revisar. En la lista vacía, derecha empieza en −1 y no se entra al bucle.\n\nDentro de cada vuelta, calcula centro con (izquierda + derecha) // 2 en Python o Math.floor((izquierda + derecha) / 2) en JavaScript. Compara numeros[centro] con objetivo. Si coincide, devuelve centro directamente. Si es menor, mueve izquierda a centro + 1; si es mayor, mueve derecha a centro − 1. Debes recalcular centro en cada vuelta, porque los límites cambian.\n\nCon [1, 3, 5, 7, 9] y objetivo 7, primero se revisa el índice 2, cuyo valor es 5; queda [3, 4]. Su centro es ahora 3 y se devuelve ese índice. Si el intervalo se agota, el return -1 final indica que no se encontró. No ordenes ni cortes la lista: ya viene ordenada y necesitas sus índices originales.",
    python: "def solve(data):\n    numeros = data['numbers']\n    objetivo = data['target']\n    izquierda = 0\n    derecha = len(numeros) - 1\n    while izquierda <= derecha:\n        centro = (izquierda + derecha) // 2\n        if numeros[centro] == objetivo:\n            return centro\n        if numeros[centro] < objetivo:\n            izquierda = centro + 1\n        else:\n            derecha = centro - 1\n    return -1\n",
    javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const objetivo = data.target;\n  let izquierda = 0;\n  let derecha = numeros.length - 1;\n  while (izquierda <= derecha) {\n    const centro = Math.floor((izquierda + derecha) / 2);\n    if (numeros[centro] === objetivo) {\n      return centro;\n    }\n    if (numeros[centro] < objetivo) {\n      izquierda = centro + 1;\n    } else {\n      derecha = centro - 1;\n    }\n  }\n  return -1;\n}\n",
    starters: {
      python: "def solve(data):\n    numeros = data['numbers']\n    objetivo = data['target']\n    izquierda = 0\n    derecha = len(numeros) - 1\n    # Mientras quede intervalo, recalcula el centro y encuentra o descarta.\n    return -1\n",
      javascript: "function solve(data) {\n  const numeros = data.numbers;\n  const objetivo = data.target;\n  let izquierda = 0;\n  let derecha = numeros.length - 1;\n  // Mientras quede intervalo, recalcula el centro y encuentra o descarta.\n  return -1;\n}\n",
    },
    hints: ["Usa while izquierda <= derecha para incluir el último candidato. Calcula el centro dentro del bucle.", "Devuelve centro si numeros[centro] coincide con objetivo; no devuelvas el valor guardado en esa posición.", "Si el valor central es menor, izquierda = centro + 1; en caso contrario, derecha = centro - 1. return -1 va después del bucle."],
    explanation: "Cada comparación descarta el centro y una mitad cuando no hay coincidencia. Los límites son inclusivos; izquierda == derecha todavía permite una comparación. Los movimientos + 1 y − 1 garantizan que el intervalo se reduzca, incluso con una sola posición. Al vaciarse no se lee ningún índice y se devuelve −1. El tiempo es O(log n) para n positivo y el espacio auxiliar O(1). Los casos comprueban resultados; una prueba editorial adicional cuenta accesos para verificar el comportamiento de esta referencia, no la complejidad de cualquier programa enviado por un usuario.",
    tests: [
      { input: { numbers: [1,3,5,7,9], target: 7 }, expected: 3 },
      { input: { numbers: [2,4], target: 3 }, expected: -1 },
      { input: { numbers: [], target: 0 }, expected: -1 },
      { input: { numbers: [5], target: 5 }, expected: 0 },
      { input: { numbers: [-9,0,8], target: -9 }, expected: 0 },
      { input: { numbers: [5], target: 4 }, expected: -1 },
      { input: { numbers: [5], target: 6 }, expected: -1 },
      { input: { numbers: [0,4], target: 4 }, expected: 1 },
      { input: { numbers: [1,3,5,7,9,11], target: 11 }, expected: 5 },
      { input: { numbers: [-9,-3,0,8], target: 0 }, expected: 2 },
    ],
  },
};
