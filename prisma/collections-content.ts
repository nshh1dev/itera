import type { SeedExercise } from "./content";

type Lesson = Pick<SeedExercise, "slug" | "title" | "statement" | "python" | "javascript" | "starters" | "tests" | "hints" | "explanation">;
const lesson = (data: Lesson): SeedExercise => ({
  ...data, category: "Arreglos", level: "INTERMEDIATE", minutes: 12,
  description: data.statement.split("\n")[0],
  constraints: ["Implementa solve(data) y devuelve un resultado JSON, no un conjunto ni un Map.", "Conserva la estructura de la plantilla y cambia el paso indicado."],
});

export const collectionsExercises: SeedExercise[] = [
  lesson({
    slug: "pertenece-al-conjunto", title: "¿Está en el conjunto?",
    statement: "Pregunta si un número pertenece a un conjunto.\n\nDespués de Construye tus bases, aprenderás a recordar valores sin repetirlos. Un conjunto guarda valores distintos: si recibe [3, 1, 3], solo conserva 3 y 1. No se usa para consultar posiciones como data[0].\n\nRecibes un objeto con numbers, una lista de enteros, y target, el número buscado. La plantilla crea el conjunto con set(data['numbers']) en Python o new Set(data.numbers) en JavaScript. Para preguntar si contiene el objetivo, Python usa objetivo in vistos; JavaScript usa vistos.has(objetivo).\n\nCambia el booleano fijo de return por esa comprobación. No devuelvas el conjunto: el resultado debe ser un booleano. Los ejemplos usan true y false de JSON; en código Python se escriben True y False. Una lista vacía no contiene ningún número.",
    python: "def solve(data):\n    vistos = set(data['numbers'])\n    objetivo = data['target']\n    return objetivo in vistos\n",
    javascript: "function solve(data) {\n  const vistos = new Set(data.numbers);\n  const objetivo = data.target;\n  return vistos.has(objetivo);\n}\n",
    starters: {
      python: "def solve(data):\n    vistos = set(data['numbers'])\n    objetivo = data['target']\n    # Pregunta si objetivo pertenece a vistos.\n    return False\n",
      javascript: "function solve(data) {\n  const vistos = new Set(data.numbers);\n  const objetivo = data.target;\n  // Pregunta si vistos contiene objetivo.\n  return false;\n}\n",
    },
    hints: ["No necesitas recorrer el conjunto ni buscar un índice.", "La comprobación de pertenencia ya produce un booleano.", "Devuelve objetivo in vistos en Python o vistos.has(objetivo) en JavaScript."],
    explanation: "Con numbers = [3, 1, 3] y target = 1, el conjunto conserva 3 y 1; la comprobación devuelve verdadero. Si target es 2, devuelve falso. Repetir un valor no cambia su pertenencia. Crear el conjunto requiere recorrer la lista; no es necesario devolverlo ni convertirlo a JSON.",
    tests: [
      { input: { numbers: [3,1,3], target: 1 }, expected: true },
      { input: { numbers: [3,1,3], target: 2 }, expected: false },
      { input: { numbers: [], target: 0 }, expected: false },
      { input: { numbers: [-2,0,-2], target: -2 }, expected: true },
      { input: { numbers: [5], target: 5 }, expected: true },
    ],
  }),
  lesson({
    slug: "cuenta-valores-distintos", title: "Recuerda cada valor una vez",
    statement: "Construye un conjunto y cuenta sus valores distintos.\n\nAhora data es una lista de enteros. La plantilla empieza con un conjunto vacío: set() en Python o new Set() en JavaScript. Dentro del bucle, vistos.add(numero) guarda el número visitado. Si ya estaba, el conjunto no crece.\n\nLa plantilla añade siempre 0. Cambia ese 0 por numero. Al terminar, len(vistos) en Python o vistos.size en JavaScript devuelve cuántos valores distintos se guardaron. La consulta del tamaño ya está escrita: no la cambies ni muevas return al interior del bucle.\n\nCon [3, 1, 3], el tamaño pasa por 1, 2 y 2; la respuesta es 2. Con una lista vacía es 0. No devuelvas el conjunto: queremos un número, no una lista ordenada. En Una sola vez combinarás esta memoria con una lista de salida para conservar el orden.",
    python: "def solve(data):\n    vistos = set()\n    for numero in data:\n        vistos.add(numero)\n    return len(vistos)\n",
    javascript: "function solve(data) {\n  const vistos = new Set();\n  for (const numero of data) {\n    vistos.add(numero);\n  }\n  return vistos.size;\n}\n",
    starters: {
      python: "def solve(data):\n    vistos = set()\n    for numero in data:\n        vistos.add(0)\n    return len(vistos)\n",
      javascript: "function solve(data) {\n  const vistos = new Set();\n  for (const numero of data) {\n    vistos.add(0);\n  }\n  return vistos.size;\n}\n",
    },
    hints: ["El bucle ya visita todos los números.", "add debe recibir el valor de esta vuelta, no un cero fijo.", "Cambia vistos.add(0) por vistos.add(numero)."],
    explanation: "Empezamos sin valores guardados. add recuerda cada número y no duplica los ya vistos. Con [-2, 0, -2], el conjunto crece con -2 y 0, pero no con el segundo -2: su tamaño es 2. La entrada vacía no produce vueltas y devuelve 0. No dependemos del orden de un conjunto de Python.",
    tests: [
      { input: [3,1,3], expected: 2 }, { input: [4,4,4], expected: 1 },
      { input: [], expected: 0 }, { input: [-2,0,-2], expected: 2 }, { input: [5,4,3], expected: 3 },
    ],
  }),
  lesson({
    slug: "guarda-con-una-clave", title: "Guarda un valor con nombre",
    statement: "Crea una asociación entre una clave y un valor.\n\nUna lista utiliza posiciones numéricas; un mapa asocia claves con valores. Aquí usaremos un diccionario en Python y un objeto en JavaScript, porque ambos pueden devolver directamente un objeto JSON. No necesitas la clase Map de JavaScript.\n\nRecibes una letra minúscula en data. La plantilla crea marcas = {} y guarda 0 bajo esa letra: marcas[data] = 0. Los corchetes utilizan el contenido de data como clave; marcas['data'] usaría literalmente la palabra data y no es lo que queremos.\n\nCambia solo el valor 0 por 1 y devuelve marcas. Con la entrada \"a\" debes obtener {\"a\": 1}; con \"z\", {\"z\": 1}. No devuelvas un texto que parezca JSON: devuelve el diccionario u objeto. Más adelante cada letra tendrá su propio contador.",
    python: "def solve(data):\n    marcas = {}\n    marcas[data] = 1\n    return marcas\n",
    javascript: "function solve(data) {\n  const marcas = {};\n  marcas[data] = 1;\n  return marcas;\n}\n",
    starters: {
      python: "def solve(data):\n    marcas = {}\n    marcas[data] = 0\n    return marcas\n",
      javascript: "function solve(data) {\n  const marcas = {};\n  marcas[data] = 0;\n  return marcas;\n}\n",
    },
    hints: ["La clave ya está bien escrita entre corchetes.", "Solo cambia el número guardado, no data ni return.", "La asignación es marcas[data] = 1."],
    explanation: "Con data = 'a', marcas[data] = 1 crea la asociación de la clave a con el número 1. El nombre de la variable no se convierte en la clave: se usa su contenido. Python devuelve un diccionario y JavaScript un objeto; la aplicación muestra ambos como un objeto JSON.",
    tests: [
      { input: "a", expected: { a: 1 } }, { input: "z", expected: { z: 1 } },
      { input: "b", expected: { b: 1 } }, { input: "m", expected: { m: 1 } }, { input: "x", expected: { x: 1 } },
    ],
  }),
  lesson({
    slug: "incrementa-contadores", title: "Un contador por letra",
    statement: "Actualiza un contador distinto para cada letra.\n\nRecibes un texto de letras minúsculas entre a y z. La plantilla crea frecuencias = {} y recorre cada letra. Antes de leer su contador, comprueba si todavía no existe la clave: letra not in frecuencias en Python, o !Object.hasOwn(frecuencias, letra) en JavaScript. not y ! niegan la comprobación: ese bloque solo se ejecuta en la primera aparición y guarda cero.\n\nDespués del bloque if hay una actualización que se ejecuta en todas las vueltas. Cambia frecuencias[letra] + 0 por frecuencias[letra] + 1 para contar la aparición actual. Conserva la actualización fuera del if: una letra repetida también debe aumentar su contador.\n\nCon \"aba\", los contadores pasan de {} a {\"a\": 1}, luego a {\"a\": 1, \"b\": 1} y finalmente a {\"a\": 2, \"b\": 1}. La cadena vacía devuelve {}. No conviertas el resultado en texto; el orden de las propiedades no importa.",
    python: "def solve(data):\n    frecuencias = {}\n    for letra in data:\n        if letra not in frecuencias:\n            frecuencias[letra] = 0\n        frecuencias[letra] = frecuencias[letra] + 1\n    return frecuencias\n",
    javascript: "function solve(data) {\n  const frecuencias = {};\n  for (const letra of data) {\n    if (!Object.hasOwn(frecuencias, letra)) {\n      frecuencias[letra] = 0;\n    }\n    frecuencias[letra] = frecuencias[letra] + 1;\n  }\n  return frecuencias;\n}\n",
    starters: {
      python: "def solve(data):\n    frecuencias = {}\n    for letra in data:\n        if letra not in frecuencias:\n            frecuencias[letra] = 0\n        frecuencias[letra] = frecuencias[letra] + 0\n    return frecuencias\n",
      javascript: "function solve(data) {\n  const frecuencias = {};\n  for (const letra of data) {\n    if (!Object.hasOwn(frecuencias, letra)) {\n      frecuencias[letra] = 0;\n    }\n    frecuencias[letra] = frecuencias[letra] + 0;\n  }\n  return frecuencias;\n}\n",
    },
    hints: ["El cero de la primera aparición es correcto: prepara el contador.", "Cambia solo la suma de la actualización posterior al if.", "La actualización debe ser frecuencias[letra] = frecuencias[letra] + 1."],
    explanation: "Inicializamos una clave solo cuando falta para no borrar las apariciones anteriores. Después sumamos uno en cada visita. Con aa, a empieza en cero, sube a uno y luego a dos; no vuelve a inicializarse. En Cada letra cuenta reconstruirás esta combinación sin tener el recorrido completo en la plantilla.",
    tests: [
      { input: "aba", expected: { a: 2, b: 1 } }, { input: "aa", expected: { a: 2 } },
      { input: "", expected: {} }, { input: "z", expected: { z: 1 } }, { input: "xyxyx", expected: { x: 3, y: 2 } },
    ],
  }),
].map(exercise => ({ ...exercise, constraints: [...exercise.constraints,
  exercise.slug === "pertenece-al-conjunto" ? "numbers contiene hasta 100 enteros entre −1000 y 1000; target es un entero en ese rango."
    : exercise.slug === "cuenta-valores-distintos" ? "La entrada contiene hasta 100 enteros entre −1000 y 1000."
    : exercise.slug === "guarda-con-una-clave" ? "La entrada es exactamente una letra entre a y z."
    : "La entrada contiene de 0 a 100 letras entre a y z, sin espacios ni mayúsculas.",
] }));

// Solo se incorporan a instalaciones existentes como versiones nuevas en borrador.
export const collectionsRevisions: Record<string, Pick<SeedExercise, "description" | "minutes" | "statement" | "python" | "javascript" | "starters" | "hints" | "explanation">> = {
  "sin-duplicados": {
    description: "Combina un conjunto de valores vistos con una lista que conserve la primera aparición.", minutes: 20,
    statement: "Después de ¿Está en el conjunto? y Recuerda cada valor una vez, combina memoria y orden. Recibe una lista de enteros y devuelve otra sin repeticiones, conservando el orden de la primera aparición.\n\nLa plantilla prepara un conjunto vistos y una lista resultado. Recorre data: si el número todavía no está en vistos, recuérdalo con add y añádelo a resultado usando append en Python o push en JavaScript. Para negar la pertenencia, usa numero not in vistos en Python o !vistos.has(numero) en JavaScript.\n\nCon [3, 1, 3, 2, 1], guarda 3 y 1; omite el segundo 3; guarda 2; omite el segundo 1. Devuelve [3, 1, 2], no una lista ordenada de menor a mayor. Con [], devuelve []. No devuelvas el conjunto: la lista es la que conserva explícitamente el orden en ambos lenguajes.",
    python: "def solve(data):\n    vistos = set()\n    resultado = []\n    for numero in data:\n        if numero not in vistos:\n            vistos.add(numero)\n            resultado.append(numero)\n    return resultado\n",
    javascript: "function solve(data) {\n  const vistos = new Set();\n  const resultado = [];\n  for (const numero of data) {\n    if (!vistos.has(numero)) {\n      vistos.add(numero);\n      resultado.push(numero);\n    }\n  }\n  return resultado;\n}\n",
    starters: {
      python: "def solve(data):\n    vistos = set()\n    resultado = []\n    # Recorre data: recuerda y añade solo los números no vistos.\n    return resultado\n",
      javascript: "function solve(data) {\n  const vistos = new Set();\n  const resultado = [];\n  // Recorre data: recuerda y añade solo los números no vistos.\n  return resultado;\n}\n",
    },
    hints: ["El conjunto responde si un valor ya apareció; la lista guarda el orden de salida.", "Dentro de un for, usa numero not in vistos o !vistos.has(numero).", "Si no estaba, llama a vistos.add(numero) y añade numero a resultado. Devuelve resultado después del recorrido."],
    explanation: "Usamos dos estructuras con funciones distintas. El conjunto recuerda valores; la lista conserva la primera aparición. Solo añadimos a ambas cuando el valor todavía no estaba. Con [3, 1, 3], la salida pasa por [3], [3, 1] y se mantiene en [3, 1]. El coste esperado es O(n) en tiempo y O(n) en espacio, sin ordenar ni depender del orden de un set de Python.",
  },
  "frecuencia-caracteres": {
    description: "Construye un diccionario u objeto y acumula las apariciones de cada letra.", minutes: 20,
    statement: "Después de Guarda un valor con nombre y Un contador por letra, reconstruye el conteo con menos ayuda. Recibe una cadena de letras minúsculas entre a y z y devuelve un objeto con la frecuencia de cada letra. El orden de las propiedades no importa.\n\nLa plantilla prepara frecuencias = {}. Añade un recorrido por data. Cuando una letra aún no tenga contador, guarda cero; después, en cada visita, aumenta su contador en uno. Usa letra not in frecuencias en Python o !Object.hasOwn(frecuencias, letra) en JavaScript para detectar la primera aparición. No reinicies una clave que ya existe.\n\nCon \"banana\", b aparece una vez, a tres y n dos: devuelve {\"b\": 1, \"a\": 3, \"n\": 2}. Una cadena vacía devuelve {}. Usa un diccionario de Python o un objeto de JavaScript, no un Map ni un texto con JSON. No necesitas normalizar: la entrada ya contiene solo letras minúsculas.",
    python: "def solve(data):\n    frecuencias = {}\n    for letra in data:\n        if letra not in frecuencias:\n            frecuencias[letra] = 0\n        frecuencias[letra] = frecuencias[letra] + 1\n    return frecuencias\n",
    javascript: "function solve(data) {\n  const frecuencias = {};\n  for (const letra of data) {\n    if (!Object.hasOwn(frecuencias, letra)) {\n      frecuencias[letra] = 0;\n    }\n    frecuencias[letra] = frecuencias[letra] + 1;\n  }\n  return frecuencias;\n}\n",
    starters: {
      python: "def solve(data):\n    frecuencias = {}\n    # Recorre data, inicializa las claves que falten y suma cada aparición.\n    return frecuencias\n",
      javascript: "function solve(data) {\n  const frecuencias = {};\n  // Recorre data, inicializa las claves que falten y suma cada aparición.\n  return frecuencias;\n}\n",
    },
    hints: ["Usa cada letra como clave entre corchetes, no como una clave literal llamada 'letra'.", "Inicializa en cero solo cuando falte la clave; incrementar va fuera de ese if.", "En cada vuelta, actualiza frecuencias[letra] = frecuencias[letra] + 1. Devuelve frecuencias fuera del bucle."],
    explanation: "Cada clave guarda un contador independiente. La primera aparición crea el contador en cero y lo aumenta a uno. Las siguientes lo aumentan sin reiniciarlo. Con banana, b queda en 1, a pasa por 1, 2 y 3, y n pasa por 1 y 2. El recorrido tarda O(n); hay como máximo 26 claves por la restricción de letras a-z.",
  },
};
