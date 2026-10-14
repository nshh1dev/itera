import type { SeedExercise } from "./content";

type Lesson = Pick<SeedExercise, "slug" | "title" | "statement" | "python" | "javascript" | "starters" | "tests" | "hints" | "explanation" | "constraints">;
const lesson = (data: Lesson): SeedExercise => ({
  ...data, category: "Cadenas", level: "INTERMEDIATE", minutes: 12,
  description: data.statement.split("\n")[0],
  constraints: ["Implementa solve(data) y devuelve el resultado, sin imprimirlo.", "Conserva la estructura de la plantilla y cambia el paso indicado.", ...data.constraints],
});

export const textExercises: SeedExercise[] = [
  lesson({
    slug: "quita-los-espacios", title: "Conserva lo que no es espacio",
    statement: "Filtra un texto sin cambiar el orden de sus caracteres.\n\nFiltrar significa conservar solo lo que cumple una condición. La plantilla recorre data y construye resultado, como en Construye un texto letra a letra. Ahora solo debe añadir el carácter si no es un espacio.\n\nPara preguntar si dos valores son distintos, Python utiliza != y JavaScript !==. La plantilla usa igualdad: cambia solo == por != en Python o === por !== en JavaScript. Así, el if dejará pasar los caracteres que no sean el espacio ' '.\n\nCon \"a b a\" debes obtener \"aba\". No conviertas a minúsculas ni quites signos: \"A !\" produce \"A!\". Aquí solo quitamos el espacio normal, no tabuladores ni saltos de línea. Con el texto vacío, devuelve el texto vacío. Esta distinción de reglas será importante al normalizar anagramas.",
    python: "def solve(data):\n    resultado = ''\n    for letra in data:\n        if letra != ' ':\n            resultado = resultado + letra\n    return resultado\n",
    javascript: "function solve(data) {\n  let resultado = '';\n  for (const letra of data) {\n    if (letra !== ' ') {\n      resultado = resultado + letra;\n    }\n  }\n  return resultado;\n}\n",
    starters: {
      python: "def solve(data):\n    resultado = ''\n    for letra in data:\n        if letra == ' ':\n            resultado = resultado + letra\n    return resultado\n",
      javascript: "function solve(data) {\n  let resultado = '';\n  for (const letra of data) {\n    if (letra === ' ') {\n      resultado = resultado + letra;\n    }\n  }\n  return resultado;\n}\n",
    },
    constraints: ["La entrada es una cadena ASCII de hasta 100 caracteres."],
    hints: ["No cambies la suma ni return; el filtro está en el if.", "Necesitas que la condición sea verdadera cuando letra sea distinta de ' '.", "Usa letra != ' ' en Python o letra !== ' ' en JavaScript."],
    explanation: "Con a b a, se añaden las dos a y la b, pero no los espacios. Se conserva el orden original. Los signos no son espacios, por eso A ! produce A!. Un filtro debe seguir la regla del enunciado, no borrar todo lo que parezca innecesario.",
    tests: [
      { input: "a b a", expected: "aba" }, { input: "A !", expected: "A!" },
      { input: "", expected: "" }, { input: "   ", expected: "" }, { input: "a\tb c", expected: "a\tbc" },
    ],
  }),
  lesson({
    slug: "filtra-letras-y-digitos", title: "Solo letras y dígitos",
    statement: "Normaliza un texto conservando solo letras a-z y dígitos 0-9.\n\nPrimero convertimos data a minúsculas, con lower() en Python o toLowerCase() en JavaScript. Después recorremos ese texto y comprobamos si cada carácter pertenece a permitidos: letra in permitidos en Python, o permitidos.includes(letra) en JavaScript. Ya conoces esta comprobación de Reconoce una vocal.\n\nLa plantilla solo permite las letras. Añade 0123456789 al final del texto guardado en permitidos. No cambies el recorrido ni la comprobación. Con \"A-1 ! b\" debe devolver \"a1b\"; con \"0P\", \"0p\". El orden y las repeticiones se conservan.\n\nEsta vez sí se quitan espacios y signos. No es la misma regla que quitar solo espacios. La cadena vacía y un texto sin caracteres permitidos producen ''. No necesitas expresiones regulares ni operaciones nuevas de filtrado.",
    python: "def solve(data):\n    permitidos = 'abcdefghijklmnopqrstuvwxyz0123456789'\n    resultado = ''\n    for letra in data.lower():\n        if letra in permitidos:\n            resultado = resultado + letra\n    return resultado\n",
    javascript: "function solve(data) {\n  const permitidos = 'abcdefghijklmnopqrstuvwxyz0123456789';\n  let resultado = '';\n  for (const letra of data.toLowerCase()) {\n    if (permitidos.includes(letra)) {\n      resultado = resultado + letra;\n    }\n  }\n  return resultado;\n}\n",
    starters: {
      python: "def solve(data):\n    permitidos = 'abcdefghijklmnopqrstuvwxyz'\n    resultado = ''\n    for letra in data.lower():\n        if letra in permitidos:\n            resultado = resultado + letra\n    return resultado\n",
      javascript: "function solve(data) {\n  const permitidos = 'abcdefghijklmnopqrstuvwxyz';\n  let resultado = '';\n  for (const letra of data.toLowerCase()) {\n    if (permitidos.includes(letra)) {\n      resultado = resultado + letra;\n    }\n  }\n  return resultado;\n}\n",
    },
    constraints: ["La entrada es una cadena ASCII de hasta 100 caracteres."],
    hints: ["Las minúsculas y el filtro ya están escritos.", "El grupo de permitidos debe incluir también los diez dígitos.", "Guarda 'abcdefghijklmnopqrstuvwxyz0123456789' en permitidos."],
    explanation: "A-1 ! b se convierte en a-1 ! b. El recorrido conserva a, 1 y b; descarta guion, espacios y exclamación. Con 0P se conserva el cero y se convierte P a p. Esta normalización es la que utilizarás antes de comprobar un palíndromo.",
    tests: [
      { input: "A-1 ! b", expected: "a1b" }, { input: "0P", expected: "0p" },
      { input: "", expected: "" }, { input: " !?\t", expected: "" }, { input: "Z9z0", expected: "z9z0" },
    ],
  }),
  lesson({
    slug: "compara-dos-textos", title: "¿Son el mismo texto?",
    statement: "Compara el contenido completo de dos cadenas.\n\nRecibes un objeto con los textos a y b. La plantilla los obtiene y los guarda en primero y segundo. Cambia el booleano fijo de return por una comparación de igualdad: primero == segundo en Python o primero === segundo en JavaScript.\n\nNo normalices nada en esta actividad. \"aba\" y \"aba\" son iguales; \"Ab\" y \"ab\" no, ni tampoco \"a b\" y \"ab\". El orden importa: \"ab\" y \"ba\" tienen las mismas letras, pero son textos distintos. Dos textos vacíos sí son iguales.\n\nDevuelve un booleano, no el texto 'true'. La comparación de cadenas examina su contenido en ambos lenguajes. No supongas lo mismo para objetos: en JavaScript dos objetos separados no se comparan por sus contadores con ===. Para eso aprenderás a comparar sus valores uno por uno.",
    python: "def solve(data):\n    primero = data['a']\n    segundo = data['b']\n    return primero == segundo\n",
    javascript: "function solve(data) {\n  const primero = data.a;\n  const segundo = data.b;\n  return primero === segundo;\n}\n",
    starters: {
      python: "def solve(data):\n    primero = data['a']\n    segundo = data['b']\n    return False\n",
      javascript: "function solve(data) {\n  const primero = data.a;\n  const segundo = data.b;\n  return false;\n}\n",
    },
    constraints: ["a y b son cadenas ASCII de hasta 100 caracteres."],
    hints: ["No necesitas un bucle ni convertir a minúsculas.", "Utiliza == en Python o === en JavaScript, no un solo =.", "Devuelve la comparación de primero con segundo."],
    explanation: "Comparamos el contenido completo y en orden. ab no es igual a ba, aunque las frecuencias de letras coincidan. En un palíndromo compararás el texto normalizado con su inverso; en un anagrama compararás frecuencias, porque allí el orden no importa.",
    tests: [
      { input: { a: "aba", b: "aba" }, expected: true }, { input: { a: "ab", b: "ba" }, expected: false },
      { input: { a: "", b: "" }, expected: true }, { input: { a: "Ab", b: "ab" }, expected: false },
      { input: { a: "a b", b: "ab" }, expected: false },
    ],
  }),
  lesson({
    slug: "compara-contadores", title: "Las mismas cantidades",
    statement: "Compara dos tablas de frecuencias letra por letra.\n\nRecibes un objeto con a y b: son dos diccionarios u objetos que guardan cuántas veces aparece cada letra minúscula. La plantilla recorre el alfabeto completo. En cada vuelta empieza con dos contadores en cero; si la clave existe, lee su valor. Una clave ausente significa cero apariciones.\n\nPara comprobar la clave se usa letra in data['a'] en Python o Object.hasOwn(data.a, letra) en JavaScript, y lo mismo para b. La plantilla compara primero > segundo, que solo detecta diferencias en un sentido. Sustituye > por != en Python o !== en JavaScript para rechazar cualquier diferencia.\n\nreturn False o return false dentro del if termina la función en cuanto hay una diferencia. El return verdadero final solo se alcanza si termina todo el recorrido sin diferencias. No lo metas dentro del bucle.\n\nCon {\"a\": 2, \"b\": 1} y {\"b\": 1, \"a\": 2}, la respuesta es verdadera: el orden de las claves no importa. Con {\"a\": 1} y {\"a\": 2}, debe ser falsa. No compares directamente objetos de JavaScript con ===.",
    python: "def solve(data):\n    for letra in 'abcdefghijklmnopqrstuvwxyz':\n        primero = 0\n        segundo = 0\n        if letra in data['a']:\n            primero = data['a'][letra]\n        if letra in data['b']:\n            segundo = data['b'][letra]\n        if primero != segundo:\n            return False\n    return True\n",
    javascript: "function solve(data) {\n  for (const letra of 'abcdefghijklmnopqrstuvwxyz') {\n    let primero = 0;\n    let segundo = 0;\n    if (Object.hasOwn(data.a, letra)) {\n      primero = data.a[letra];\n    }\n    if (Object.hasOwn(data.b, letra)) {\n      segundo = data.b[letra];\n    }\n    if (primero !== segundo) {\n      return false;\n    }\n  }\n  return true;\n}\n",
    starters: {
      python: "def solve(data):\n    for letra in 'abcdefghijklmnopqrstuvwxyz':\n        primero = 0\n        segundo = 0\n        if letra in data['a']:\n            primero = data['a'][letra]\n        if letra in data['b']:\n            segundo = data['b'][letra]\n        if primero > segundo:\n            return False\n    return True\n",
      javascript: "function solve(data) {\n  for (const letra of 'abcdefghijklmnopqrstuvwxyz') {\n    let primero = 0;\n    let segundo = 0;\n    if (Object.hasOwn(data.a, letra)) {\n      primero = data.a[letra];\n    }\n    if (Object.hasOwn(data.b, letra)) {\n      segundo = data.b[letra];\n    }\n    if (primero > segundo) {\n      return false;\n    }\n  }\n  return true;\n}\n",
    },
    constraints: ["a y b tienen solo claves de una letra entre a y z y contadores enteros entre 0 y 100. Pueden estar vacíos."],
    hints: ["Ser mayor no es la única forma de ser distinto.", "El mismo if debe detectar un contador menor y uno mayor.", "Usa primero != segundo en Python o primero !== segundo en JavaScript."],
    explanation: "Revisamos las 26 letras, incluso las que solo están en la segunda tabla. Si falta una clave, su cantidad se interpreta como cero. La primera diferencia termina la función con falso; verdadero se devuelve únicamente al acabar todas las comparaciones. Así comparamos contenido sin depender del orden de las propiedades ni de la identidad de los objetos.",
    tests: [
      { input: { a: { a: 2, b: 1 }, b: { b: 1, a: 2 } }, expected: true },
      { input: { a: { a: 1 }, b: { a: 2 } }, expected: false },
      { input: { a: {}, b: {} }, expected: true },
      { input: { a: { z: 1 }, b: {} }, expected: false },
      { input: { a: {}, b: { z: 1 } }, expected: false },
      { input: { a: { a: 0 }, b: {} }, expected: true },
    ],
  }),
];

// Las instalaciones existentes incorporan estas revisiones como borradores nuevos.
export const textRevisions: Record<string, Pick<SeedExercise, "description" | "minutes" | "statement" | "python" | "javascript" | "starters" | "hints" | "explanation" | "tests">> = {
  "palindromo": {
    description: "Normaliza un texto, construye su inverso y compara ambos contenidos.", minutes: 25,
    statement: "Combina Solo letras y dígitos, Palabras al revés y ¿Son el mismo texto? Un palíndromo se lee igual en ambos sentidos después de normalizarlo. Devuelve un booleano.\n\nRecibe una cadena ASCII. Conviértela a minúsculas y conserva únicamente letras a-z y dígitos 0-9; ignora el resto, incluidos espacios y puntuación. La plantilla prepara permitidos y limpio. Primero recorre el texto en minúsculas y añade a limpio solo los caracteres permitidos. Después construye otro texto colocando cada carácter de limpio delante del inverso acumulado. Compara limpio con su inverso usando == en Python o === en JavaScript.\n\nCon \"Anita lava la tina\", limpio es \"anitalavalatina\" y coincide con su inverso: verdadero. Con \"0P\", limpio es \"0p\" y el inverso es \"p0\": falso. No descartes los dígitos. El texto vacío y un texto solo de signos se normalizan a '' y son palíndromos. No necesitas expresiones regulares, slicing ni reverse.",
    python: "def solve(data):\n    permitidos = 'abcdefghijklmnopqrstuvwxyz0123456789'\n    limpio = ''\n    for letra in data.lower():\n        if letra in permitidos:\n            limpio = limpio + letra\n    inverso = ''\n    for letra in limpio:\n        inverso = letra + inverso\n    return limpio == inverso\n",
    javascript: "function solve(data) {\n  const permitidos = 'abcdefghijklmnopqrstuvwxyz0123456789';\n  let limpio = '';\n  for (const letra of data.toLowerCase()) {\n    if (permitidos.includes(letra)) {\n      limpio = limpio + letra;\n    }\n  }\n  let inverso = '';\n  for (const letra of limpio) {\n    inverso = letra + inverso;\n  }\n  return limpio === inverso;\n}\n",
    starters: {
      python: "def solve(data):\n    permitidos = 'abcdefghijklmnopqrstuvwxyz0123456789'\n    limpio = ''\n    # Filtra data en minúsculas, construye el inverso y compara ambos textos.\n    return False\n",
      javascript: "function solve(data) {\n  const permitidos = 'abcdefghijklmnopqrstuvwxyz0123456789';\n  let limpio = '';\n  // Filtra data en minúsculas, construye el inverso y compara ambos textos.\n  return false;\n}\n",
    },
    hints: ["Recorre data.lower() o data.toLowerCase() y conserva cada letra que pertenezca a permitidos.", "Empieza inverso en '' y actualiza inverso = letra + inverso al recorrer limpio.", "Devuelve limpio == inverso en Python o limpio === inverso en JavaScript, fuera de los bucles."],
    explanation: "Primero aplicamos exactamente el filtro del enunciado. Luego construimos el inverso colocando cada carácter delante de lo acumulado. Por último comparamos los contenidos. 0P no es palíndromo porque el cero se conserva. Esta referencia prioriza pasos ya aprendidos; concatenar cadenas repetidamente puede tener coste cuadrático. Más adelante se puede estudiar una comparación con dos índices para lograr tiempo lineal.",
    tests: [
      { input: "Anita lava la tina", expected: true }, { input: "programar", expected: false },
      { input: "", expected: true }, { input: "A man, a plan, a canal: Panama", expected: true },
      { input: "0P", expected: false }, { input: "!? ", expected: true },
      { input: "A1!1a", expected: true }, { input: "ab!ca", expected: false },
    ],
  },
  "anagramas": {
    description: "Cuenta las letras de dos textos y compara sus cantidades sin importar el orden.", minutes: 30,
    statement: "Combina Conserva lo que no es espacio, Cada letra cuenta y Las mismas cantidades. Dos textos son anagramas si cada letra aparece el mismo número de veces, aunque cambie el orden. Recibes a y b, formados por letras ASCII y espacios. Ignora las diferencias entre mayúsculas y minúsculas y los espacios normales. Devuelve un booleano.\n\nLa plantilla crea dos tablas con las 26 letras inicializadas en cero: primero y segundo. Para cada texto, recorre su versión en minúsculas; si el carácter no es ' ', aumenta el contador de esa letra en la tabla correspondiente. Finalmente recorre el alfabeto: si los contadores difieren, devuelve falso. Devuelve verdadero solo después de revisar todas las letras.\n\nCon \"Dormitory\" y \"Dirty room\", las cantidades coinciden: verdadero. Con \"aa\" y \"a\", no: falso, aunque el conjunto de letras sea el mismo. El orden de los caracteres no importa, por lo que no sirve comparar directamente los textos. Tampoco compares objetos de JavaScript con ===. Una cadena vacía y otra de espacios sí son anagramas. No necesitas ordenar ni escribir funciones auxiliares.",
    python: "def solve(data):\n    alfabeto = 'abcdefghijklmnopqrstuvwxyz'\n    primero = {}\n    segundo = {}\n    for letra in alfabeto:\n        primero[letra] = 0\n        segundo[letra] = 0\n    for letra in data['a'].lower():\n        if letra != ' ':\n            primero[letra] = primero[letra] + 1\n    for letra in data['b'].lower():\n        if letra != ' ':\n            segundo[letra] = segundo[letra] + 1\n    for letra in alfabeto:\n        if primero[letra] != segundo[letra]:\n            return False\n    return True\n",
    javascript: "function solve(data) {\n  const alfabeto = 'abcdefghijklmnopqrstuvwxyz';\n  const primero = {};\n  const segundo = {};\n  for (const letra of alfabeto) {\n    primero[letra] = 0;\n    segundo[letra] = 0;\n  }\n  for (const letra of data.a.toLowerCase()) {\n    if (letra !== ' ') {\n      primero[letra] = primero[letra] + 1;\n    }\n  }\n  for (const letra of data.b.toLowerCase()) {\n    if (letra !== ' ') {\n      segundo[letra] = segundo[letra] + 1;\n    }\n  }\n  for (const letra of alfabeto) {\n    if (primero[letra] !== segundo[letra]) {\n      return false;\n    }\n  }\n  return true;\n}\n",
    starters: {
      python: "def solve(data):\n    alfabeto = 'abcdefghijklmnopqrstuvwxyz'\n    primero = {}\n    segundo = {}\n    for letra in alfabeto:\n        primero[letra] = 0\n        segundo[letra] = 0\n    # Cuenta a y b en minúsculas sin espacios; después compara las 26 cantidades.\n    return False\n",
      javascript: "function solve(data) {\n  const alfabeto = 'abcdefghijklmnopqrstuvwxyz';\n  const primero = {};\n  const segundo = {};\n  for (const letra of alfabeto) {\n    primero[letra] = 0;\n    segundo[letra] = 0;\n  }\n  // Cuenta a y b en minúsculas sin espacios; después compara las 26 cantidades.\n  return false;\n}\n",
    },
    hints: ["La inicialización ya crea todas las claves: no hace falta comprobar si existen antes de aumentar sus contadores.", "Recorre a y b en minúsculas por separado; si letra es distinta de ' ', suma uno en la tabla correspondiente.", "Recorre alfabeto y devuelve falso ante cualquier contador distinto. Devuelve verdadero fuera de ese bucle, nunca en su primera vuelta."],
    explanation: "Inicializamos las 26 cantidades en cero y contamos cada texto por separado, sin espacios y en minúsculas. Recorremos el alfabeto completo para comparar las tablas por contenido. aa y a difieren en la cantidad de a; ab y ba no difieren en ninguna. Revisar también letras como z evita aceptar por error cuando las primeras cantidades coinciden. El tiempo es O(n + m + 26) y el espacio de las tablas es O(26).",
    tests: [
      { input: { a: "amor", b: "roma" }, expected: true }, { input: { a: "casa", b: "cosa" }, expected: false },
      { input: { a: "Dormitory", b: "Dirty room" }, expected: true }, { input: { a: "", b: " " }, expected: true },
      { input: { a: "aa", b: "a" }, expected: false }, { input: { a: "a", b: "aa" }, expected: false },
      { input: { a: "AZ", b: "a" }, expected: false }, { input: { a: "a", b: "az" }, expected: false },
    ],
  },
};
