import type { SeedExercise } from "./content";

type Revision = Pick<SeedExercise, "description" | "statement" | "minutes" | "hints" | "explanation" | "starters"> & Partial<Pick<SeedExercise, "python" | "javascript">>;

// Revisiones de los ocho retos originales. El seed solo las usa para instalaciones
// nuevas; las existentes las incorporan como borradores editoriales independientes.
export const beginnerRevisions: Record<string, Revision> = {
  "suma-de-dos-numeros": {
    description: "Combina el acceso a dos datos con una suma y devuelve el resultado.", minutes: 10,
    statement: "Ya has practicado cómo recibir datos, acceder a un valor con nombre y usar return. Ahora combina esas ideas: recibe un objeto con dos enteros, a y b, y devuelve su suma.\n\nCon {\"a\": 3, \"b\": 5}, obtén ambos números y suma 3 + 5 para devolver 8. En Python se accede con data['a']; en JavaScript, con data.a. La plantilla ya obtiene los dos valores y los llama primero y segundo. Modifica la respuesta para sumar ambos. No escribas un número fijo: cada prueba puede recibir valores diferentes.",
    starters: { python: "def solve(data):\n    primero = data['a']\n    segundo = data['b']\n    # Devuelve la suma de ambos valores.\n    return primero\n", javascript: "function solve(data) {\n  const primero = data.a;\n  const segundo = data.b;\n  // Devuelve la suma de ambos valores.\n  return primero;\n}\n" },
    hints: ["No necesitas leer datos ni llamar a solve: la aplicación lo hace por ti.", "primero y segundo ya guardan los números recibidos.", "Después de return, escribe primero + segundo."],
    explanation: "Primero obtenemos a y b de la entrada. Luego usamos + para sumar sus valores y return para entregar el resultado. Si a vale 3 y b vale 5, obtenemos 8. El mismo programa sirve cuando alguno es cero o negativo.",
  },
  "par-o-impar": {
    description: "Combina el resto de una división con una comparación de igualdad.", minutes: 10,
    statement: "Antes de este reto, practica Lo que sobra al repartir y ¿Es igual a diez? Un entero es par cuando puede dividirse en parejas sin que sobre nada. Devuelve verdadero si data es par y falso si no lo es. El cero también es par.\n\nPrimero calcula el resto al dividir entre 2. Después compáralo con cero. En Python se compara con ==; en JavaScript, con ===. La comparación ya produce el booleano que debes devolver: no hace falta convertirlo a texto. Los ejemplos usan true y false de JSON; Python utiliza True y False cuando se escriben esos valores en el código.",
    starters: { python: "def solve(data):\n    # Combina resto e igualdad.\n    return False\n", javascript: "function solve(data) {\n  // Combina resto e igualdad.\n  return false;\n}\n" },
    hints: ["El resto entre dos permite saber si sobra algo al formar parejas.", "Un resto de cero indica que el número es par.", "Devuelve data % 2 == 0 en Python o data % 2 === 0 en JavaScript."],
    explanation: "Calculamos el resto y comprobamos si vale cero. Con 8 el resto es 0 y la respuesta es verdadera; con 3 no es cero y la respuesta es falsa. Los negativos también pueden ser pares: aunque el signo del resto no coincida entre lenguajes, la comparación con cero sigue funcionando.",
  },
  "el-mayor-de-tres": {
    description: "Recorre tres números y conserva el mayor que hayas encontrado.", minutes: 15,
    statement: "Combina listas, recorridos y condiciones. Recibe una lista de exactamente tres números y devuelve el mayor. Puede haber valores repetidos y negativos.\n\nLa plantilla usa data[0] como primer candidato y lo guarda en mayor. Añade un recorrido antes de return: si el número que visitas supera al candidato, actualiza mayor. Con [3, 9, 2], el candidato empieza en 3, cambia a 9 y después se conserva. No lo inicialices en cero: eso fallaría si todos los valores fueran negativos.",
    starters: { python: "def solve(data):\n    mayor = data[0]\n    # Recorre data y actualiza mayor cuando encuentres uno más grande.\n    return mayor\n", javascript: "function solve(data) {\n  let mayor = data[0];\n  // Recorre data y actualiza mayor cuando encuentres uno más grande.\n  return mayor;\n}\n" },
    hints: ["Recorre los números igual que en Recorre y cuenta.", "Dentro del bucle, comprueba si numero > mayor.", "Si la condición se cumple, guarda mayor = numero. Devuelve mayor fuera del bucle."],
    explanation: "El candidato guarda el mayor valor visto hasta ese momento. Cada número se compara con él y solo se reemplaza si es mayor. Empezar con el primer elemento permite resolver también [-8, -2, -5], cuya respuesta es -2. En JavaScript usamos let porque el candidato puede cambiar.",
  },
  "contar-vocales": {
    description: "Combina minúsculas, pertenencia y un contador para contar vocales.", minutes: 20,
    statement: "Antes de este reto, practica El mismo texto en minúsculas y Reconoce una vocal. Recibe un texto y devuelve cuántas vocales contiene. Cuenta a, e, i, o, u tanto en mayúsculas como en minúsculas; no se incluyen vocales acentuadas.\n\nCombina cuatro pasos conocidos: convierte a minúsculas, recorre el texto, comprueba si cada letra pertenece a 'aeiou' y aumenta un contador solo cuando sea vocal. Con \"Hola\", h no cuenta, o aumenta el contador a 1, l no cuenta y a lo aumenta a 2. La plantilla ya prepara el contador y la conversión; añade el recorrido y la condición antes de return.",
    starters: { python: "def solve(data):\n    texto = data.lower()\n    contador = 0\n    # Recorre texto y cuenta solo las letras de 'aeiou'.\n    return contador\n", javascript: "function solve(data) {\n  const texto = data.toLowerCase();\n  let contador = 0;\n  // Recorre texto y cuenta solo las letras de 'aeiou'.\n  return contador;\n}\n" },
    hints: ["No cuentes todas las letras: primero comprueba si la letra es una vocal.", "Usa letra in 'aeiou' en Python o 'aeiou'.includes(letra) en JavaScript.", "Dentro del if, actualiza contador = contador + 1. Devuélvelo después del recorrido."],
    explanation: "Convertimos el texto a minúsculas para que A y a se traten igual. Recorremos sus caracteres y aumentamos el contador solo para las cinco vocales permitidas. Una cadena vacía no produce vueltas y devuelve cero. Los espacios y las consonantes no aumentan el contador.",
  },
  "invertir-cadena": {
    description: "Construye un texto colocando cada nueva letra delante de las anteriores.", minutes: 15,
    statement: "Ya has construido un texto letra a letra. Ahora recibe una cadena y devuelve sus caracteres en orden inverso, conservando espacios y mayúsculas.\n\nLa plantilla copia la cadena porque añade cada letra al final del resultado. Cambia el orden de esa unión para colocar la letra delante del texto acumulado. Con \"abc\", los resultados parciales deben ser \"a\", después \"ba\" y finalmente \"cba\". No necesitas índices, slicing ni una función nueva: utiliza el recorrido y la unión con + que ya conoces.",
    starters: { python: "def solve(data):\n    resultado = ''\n    for letra in data:\n        resultado = resultado + letra\n    return resultado\n", javascript: "function solve(data) {\n  let resultado = '';\n  for (const letra of data) {\n    resultado = resultado + letra;\n  }\n  return resultado;\n}\n" },
    hints: ["La nueva letra debe quedar antes del resultado anterior.", "Unir letra + resultado no es lo mismo que resultado + letra.", "Dentro del bucle, usa resultado = letra + resultado."],
    explanation: "Empezamos con un texto vacío y colocamos cada letra delante del resultado anterior. Con abc obtenemos a, ba y cba. Una entrada vacía sigue vacía. Esta versión prioriza la claridad; construir repetidamente cadenas puede costar tiempo cuadrático. Las alternativas más compactas quedan para después.",
  },
  "factorial": {
    description: "Combina un recorrido numérico con un producto acumulado.", minutes: 20,
    statement: "Antes de este reto, practica Del uno al número recibido y Un producto que crece. El factorial de n es el producto de los enteros desde 1 hasta n. Por ejemplo, el factorial de 4 es 1 * 2 * 3 * 4 = 24. El factorial de cero se define como 1.\n\nLa plantilla prepara producto = 1. Añade un recorrido del 1 al número recibido y multiplica el acumulador por cada valor. Devuelve el producto después del bucle, no en su interior. Con cero el recorrido no tiene vueltas y el valor inicial ya es la respuesta correcta.",
    starters: { python: "def solve(data):\n    producto = 1\n    # Recorre los números del 1 a data y acumula su producto.\n    return producto\n", javascript: "function solve(data) {\n  let producto = 1;\n  // Recorre los números del 1 a data y acumula su producto.\n  return producto;\n}\n" },
    hints: ["No empieces en cero: cualquier número multiplicado por cero da cero.", "En Python puedes usar range(1, data + 1). En JavaScript, recorre desde 1 mientras numero <= data.", "En cada vuelta, guarda producto = producto * numero. Deja return fuera del bucle."],
    explanation: "El acumulador empieza en uno. Para n = 4, pasa por 1, 2, 6 y 24. Si n es cero no se ejecuta el bucle y se conserva uno. No necesitas recursividad ni una fórmula nueva: solo combinar el rango con el producto de la actividad anterior.",
    python: "def solve(data):\n    producto = 1\n    for numero in range(1, data + 1):\n        producto = producto * numero\n    return producto\n",
    javascript: "function solve(data) {\n  let producto = 1;\n  for (let numero = 1; numero <= data; numero = numero + 1) {\n    producto = producto * numero;\n  }\n  return producto;\n}\n",
  },
  "suma-del-arreglo": {
    description: "Transforma un contador en una suma acumulada de los valores recibidos.", minutes: 15,
    statement: "Combina lo aprendido sobre listas, recorridos y variables. Recibe una lista de números y devuelve la suma de sus elementos. Una lista vacía debe devolver cero.\n\nEn Recorre y cuenta aumentabas un contador en uno por cada visita. Ahora debes añadir el valor visitado, no uno. Con [2, 4, 3], el total empieza en 0 y pasa a 2, después a 6 y finalmente a 9. La plantilla prepara el total y su devolución; añade el recorrido antes de return.",
    starters: { python: "def solve(data):\n    total = 0\n    # Recorre data y suma cada numero al total.\n    return total\n", javascript: "function solve(data) {\n  let total = 0;\n  // Recorre data y suma cada numero al total.\n  return total;\n}\n" },
    hints: ["El total debe conservarse entre vueltas, como el contador.", "En cada visita, añade numero al total anterior.", "Usa total = total + numero dentro del bucle y devuelve total después."],
    explanation: "La variable total guarda la suma parcial. Cada vuelta añade el valor actual, que también puede ser negativo. Con una lista vacía no hay vueltas y el valor inicial cero es la respuesta. No necesitas reduce ni una función de suma predefinida para resolverlo.",
  },
  "fizzbuzz": {
    description: "Integra rangos, restos, condiciones y construcción de listas.", minutes: 30,
    statement: "Este es el reto integrador de fundamentos. Repasa antes Del uno al número recibido, Tres caminos para un número y Dos condiciones a la vez. Recibe un entero n y construye una lista desde 1 hasta n, pero sustituye los múltiplos de 3 por \"Fizz\", los de 5 por \"Buzz\" y los de ambos por \"FizzBuzz\". Conserva los demás como números, no como textos.\n\nLa plantilla ya construye la lista numérica. Dentro del recorrido, añade una selección de casos para decidir qué valor guardar. Comprueba primero el caso que cumple ambas condiciones: 15 debe producir \"FizzBuzz\", no solo \"Fizz\". Usa elif y else en Python o else if y else en JavaScript. Con n = 0, devuelve una lista vacía.",
    starters: { python: "def solve(data):\n    resultado = []\n    for numero in range(1, data + 1):\n        # Decide qué añadir según los restos entre 3 y entre 5.\n        resultado.append(numero)\n    return resultado\n", javascript: "function solve(data) {\n  const resultado = [];\n  for (let numero = 1; numero <= data; numero = numero + 1) {\n    // Decide qué añadir según los restos entre 3 y entre 5.\n    resultado.push(numero);\n  }\n  return resultado;\n}\n" },
    hints: ["Reconoce un múltiplo comprobando que su resto sea cero.", "Empieza por los múltiplos de 3 y de 5 a la vez. Para enteros equivale a comprobar el resto entre 15.", "Ordena los casos: FizzBuzz, Fizz, Buzz y, en el else final, el número original. Añade un único valor por vuelta."],
    explanation: "Las condiciones se evalúan desde la más específica. Si un número es múltiplo de ambos, guardamos FizzBuzz; si no, probamos 3 y después 5. Cuando ninguna condición se cumple, conservamos el número. Añadimos exactamente un valor por vuelta y devolvemos toda la lista al terminar.",
    javascript: "function solve(data) {\n  const resultado = [];\n  for (let numero = 1; numero <= data; numero = numero + 1) {\n    if (numero % 15 === 0) {\n      resultado.push('FizzBuzz');\n    } else if (numero % 3 === 0) {\n      resultado.push('Fizz');\n    } else if (numero % 5 === 0) {\n      resultado.push('Buzz');\n    } else {\n      resultado.push(numero);\n    }\n  }\n  return resultado;\n}\n",
  },
};
